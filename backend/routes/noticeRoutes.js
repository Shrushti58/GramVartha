const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Notice = require("../models/Notice");
const { extractText } = require("../utlis/extractText");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { verifyToken } = require("../utlis/jwt");
const NoticeView = require("../models/NoticeView");
const Citizen = require("../models/Citizen");

// Multer temporary local storage
const multerUpload = multer({ dest: "uploads/" });

// Gemini setup
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);
const geminiModel = googleAI.getGenerativeModel({ model: "gemini-2.5-flash" });


async function getStructuredExplanation(text) {
  const prompt = `
You are a helpful multilingual assistant.
If the notice is in Marathi, Hindi, or any Indian language, detect it and simplify it for citizens in the same language.
If the notice is in English, simplify it in English.
Output only JSON:
{
  "language": "detected language name",
  "summary": "2-3 line summary",
  "bullets": ["Key point 1", "Key point 2"],
  "full": "Full simplified explanation"
}

Notice:
${text}
  `;

  const result = await geminiModel.generateContent(prompt);
  let rawText = result.response.text().trim();
  rawText = rawText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(rawText);
  } catch (err) {
    console.error("Error parsing Gemini JSON:", err);
    return {
      language: "auto",
      summary: rawText.slice(0, 200),
      bullets: [],
      full: rawText,
    };
  }
}

// POST /notice/upload - create or update notice (Enhanced)
router.post("/upload", verifyToken, multerUpload.single("file"), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      noticeId, 
      category,
      priority = "medium",
      targetAudience = "all",
      targetWards = "",
      tags = "",
      isPinned = false,
      expiryDate = null
    } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ 
        message: "Missing required fields: title, description, and category are required" 
      });
    }

    let fileUrl = null;
    let fileName = null;
    let fileSize = 0;

    // Upload new file to Cloudinary if provided
    if (req.file && req.file.path) {
      try {
        const cloudRes = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "auto",
          folder: "gramvartha_notices",
        });
        fileUrl = cloudRes.secure_url;
        fileName = req.file.originalname;
        fileSize = cloudRes.bytes;

        // Cleanup local temp file safely
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ 
          message: "File upload failed", 
          error: uploadError.message 
        });
      }
    }

    let notice;

    if (noticeId) {
      // UPDATE EXISTING NOTICE
      notice = await Notice.findById(noticeId);
      if (!notice) {
        return res.status(404).json({ message: "Notice not found" });
      }

      // Check authorization
      if (notice.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ 
          message: "Not authorized to update this notice" 
        });
      }

      // Update notice fields
      notice.title = title;
      notice.description = description;
      notice.category = category;
      notice.priority = priority;
      notice.targetAudience = targetAudience;
      notice.isPinned = isPinned === 'true' || isPinned === true;
      
      // Handle target wards
      if (targetAudience === 'ward_specific' && targetWards) {
        notice.targetWards = Array.isArray(targetWards) 
          ? targetWards 
          : targetWards.split(',').map(ward => ward.trim());
      } else {
        notice.targetWards = [];
      }
      
      // Handle tags
      if (tags) {
        notice.tags = Array.isArray(tags) 
          ? tags 
          : tags.split(',').map(tag => tag.trim());
      }
      
      // Handle file updates
      if (fileUrl) {
        notice.fileUrl = fileUrl;
        notice.fileName = fileName;
        notice.fileSize = fileSize;
      }
      
      // Handle expiry date
      if (expiryDate) {
        notice.expiryDate = new Date(expiryDate);
      } else {
        notice.expiryDate = null;
      }
      
      // Update metadata
      notice.metadata = {
        version: (notice.metadata?.version || 1) + 1,
        language: "en"
      };

      await notice.save();

    } else {
      // CREATE NEW NOTICE
      const noticeData = {
        title,
        description,
        category,
        priority,
        targetAudience,
        isPinned: isPinned === 'true' || isPinned === true,
        createdBy: req.user.id,
        status: "published",
        publishDate: new Date(),
        metadata: {
          version: 1,
          language: "en"
        }
      };

      // Add file data if uploaded
      if (fileUrl) {
        noticeData.fileUrl = fileUrl;
        noticeData.fileName = fileName;
        noticeData.fileSize = fileSize;
      }

      // Handle target wards for ward-specific notices
      if (targetAudience === 'ward_specific' && targetWards) {
        noticeData.targetWards = Array.isArray(targetWards) 
          ? targetWards 
          : targetWards.split(',').map(ward => ward.trim());
      }

      // Handle tags
      if (tags) {
        noticeData.tags = Array.isArray(tags) 
          ? tags 
          : tags.split(',').map(tag => tag.trim());
      }

      // Handle expiry date
      if (expiryDate) {
        noticeData.expiryDate = new Date(expiryDate);
      }

      notice = new Notice(noticeData);
      await notice.save();

      // Send notifications to citizens after successful creation
      try {
        await sendNoticeNotifications(notice);
      } catch (notificationError) {
        console.error("Notification sending failed:", notificationError);
        // Don't fail the request if notifications fail
      }
    }

    // Populate createdBy for response
    await notice.populate('createdBy', 'name email');

    res.status(201).json({
      message: noticeId ? "Notice updated successfully" : "Notice published successfully",
      notice: {
        _id: notice._id,
        title: notice.title,
        description: notice.description,
        category: notice.category,
        priority: notice.priority,
        targetAudience: notice.targetAudience,
        targetWards: notice.targetWards,
        isPinned: notice.isPinned,
        fileUrl: notice.fileUrl,
        fileName: notice.fileName,
        fileSize: notice.fileSize,
        status: notice.status,
        views: notice.views,
        uniqueViews: notice.uniqueViews,
        publishDate: notice.publishDate,
        expiryDate: notice.expiryDate,
        tags: notice.tags,
        metadata: notice.metadata,
        createdBy: notice.createdBy,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt
      },
    });

  } catch (err) {
    console.error("Notice upload error:", err);
    
    // Cleanup uploaded file if error occurred after upload
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: "Error saving notice", 
      error: err.message 
    });
  }
});


// GET /notice/fetch - get notices with enhanced filtering
router.get("/fetch", async (req, res) => {
  try {
    const { 
      category, 
      page = 1, 
      limit = 10,
      showExpired = false,
      targetAudience,
      priority,
      isPinned
    } = req.query;

    let filter = {};

    // Filter by category if provided
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Filter by target audience
    if (targetAudience && targetAudience !== 'all') {
      filter.targetAudience = targetAudience;
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    // Filter by pinned status
    if (isPinned !== undefined) {
      filter.isPinned = isPinned === 'true';
    }

    // Handle expired notices filter
    const now = new Date();
    if (!showExpired || showExpired === 'false') {
      filter.$and = [
        {
          $or: [
            { publishDate: { $lte: now } },
            { publishDate: null }
          ]
        },
        {
          $or: [
            { expiryDate: { $gte: now } },
            { expiryDate: null }
          ]
        }
      ];
    }

    const notices = await Notice.find(filter)
      .populate('createdBy', 'name email')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notice.countDocuments(filter);

    res.json({
      notices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ message: "Error fetching notices", error: error.message });
  }
});

// PUT /notice/update/:id - update notice (Enhanced)
router.put("/update/:id", verifyToken, multerUpload.single("file"), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category,
      priority,
      targetAudience,
      targetWards,
      tags,
      isPinned,
      expiryDate
    } = req.body;
    
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    if (notice.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this notice" });
    }

    let fileUrl = null;
    let fileName = null;
    let fileSize = 0;

    // Handle file upload if new file is provided
    if (req.file && req.file.path) {
      const cloudRes = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "gramvartha_notices",
      });
      fileUrl = cloudRes.secure_url;
      fileName = req.file.originalname;
      fileSize = cloudRes.bytes;

      // Cleanup local temp file safely
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    // Update notice fields
    notice.title = title || notice.title;
    notice.description = description || notice.description;
    notice.category = category || notice.category;
    notice.priority = priority || notice.priority;
    notice.targetAudience = targetAudience || notice.targetAudience;
    notice.isPinned = isPinned !== undefined ? (isPinned === 'true' || isPinned === true) : notice.isPinned;
    
    // Handle target wards
    if (targetAudience === 'ward_specific' && targetWards) {
      notice.targetWards = Array.isArray(targetWards) 
        ? targetWards 
        : targetWards.split(',').map(ward => ward.trim());
    } else if (targetAudience === 'all') {
      notice.targetWards = [];
    }
    
    // Handle tags
    if (tags !== undefined) {
      notice.tags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [];
    }
    
    // Handle file updates
    if (fileUrl) {
      notice.fileUrl = fileUrl;
      notice.fileName = fileName;
      notice.fileSize = fileSize;
    }
    
    // Handle expiry date
    if (expiryDate !== undefined) {
      notice.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }
    
    // Update metadata version
    notice.metadata = {
      version: (notice.metadata?.version || 1) + 1,
      language: "en"
    };

    await notice.save();
    
    // Populate for response
    await notice.populate('createdBy', 'name email');
    
    res.json({ 
      message: "Notice updated successfully", 
      notice: {
        _id: notice._id,
        title: notice.title,
        description: notice.description,
        category: notice.category,
        priority: notice.priority,
        targetAudience: notice.targetAudience,
        targetWards: notice.targetWards,
        isPinned: notice.isPinned,
        fileUrl: notice.fileUrl,
        fileName: notice.fileName,
        fileSize: notice.fileSize,
        status: notice.status,
        views: notice.views,
        uniqueViews: notice.uniqueViews,
        publishDate: notice.publishDate,
        expiryDate: notice.expiryDate,
        tags: notice.tags,
        metadata: notice.metadata,
        createdBy: notice.createdBy,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating notice", error: err.message });
  }
});


router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });


    if (notice.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this notice" });
    }

    await notice.deleteOne();
    res.json({ message: "Notice deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting notice", error: err });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    const { visitorId } = req.body;
    const noticeId = req.params.id;

    if (!visitorId) {
      return res.status(400).json({ error: 'Visitor ID is required' });
    }

    // Check if notice exists
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // Check if this visitor already viewed this notice
    const existingView = await NoticeView.findOne({
      noticeId: noticeId,
      visitorId: visitorId
    });

    if (existingView) {
      // Return current views count without incrementing
      return res.json({ 
        success: true, 
        views: notice.views,
        alreadyViewed: true
      });
    }

    // Create new view record
    const noticeView = new NoticeView({
      noticeId: noticeId,
      visitorId: visitorId,
      userAgent: req.get('User-Agent') || '',
      ipAddress: req.ip || req.connection.remoteAddress
    });

    await noticeView.save();

    // Increment views count on notice
    notice.views += 1;
    notice.lastViewedAt = new Date();
    await notice.save();

    res.json({ 
      success: true, 
      views: notice.views,
      firstView: true
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    
    // Handle duplicate key error (unique index violation)
    if (error.code === 11000) {
      const notice = await Notice.findById(req.params.id);
      return res.json({ 
        success: true, 
        views: notice.views,
        alreadyViewed: true
      });
    }
    
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// GET /notice/popular - get popular notices
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10, category } = req.query;
    
    let query = { status: 'published' };
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Only show active notices (not expired)
    const now = new Date();
    query.$and = [
      {
        $or: [
          { publishDate: { $lte: now } },
          { publishDate: null }
        ]
      },
      {
        $or: [
          { expiryDate: { $gte: now } },
          { expiryDate: null }
        ]
      }
    ];
    
    const popularNotices = await Notice.find(query)
      .sort({ views: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name');
      
    res.json(popularNotices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular notices' });
  }
});

// Get view analytics (optional)
router.get('/:id/analytics', async (req, res) => {
  try {
    const noticeId = req.params.id;
    
    const totalViews = await NoticeView.countDocuments({ noticeId });
    const uniqueVisitors = await NoticeView.distinct('visitorId', { noticeId });
    const viewsLast7Days = await NoticeView.countDocuments({
      noticeId,
      viewedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      viewsLast7Days
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});


router.get("/:id/file", async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findById(id);
    if (!notice || !notice.fileUrl) {
      return res.status(404).json({ message: "File not found" });
    }

    // Fetch the remote file as a stream
    const cloudUrl = notice.fileUrl;
    const response = await axios.get(cloudUrl, { responseType: "stream" });

    const contentType = response.headers["content-type"] || "application/octet-stream";
    if (response.headers["content-length"]) {
      res.setHeader("Content-Length", response.headers["content-length"]);
    }
    res.setHeader("Content-Type", contentType);

    // Build a safe filename + extension
    const extFromMime = mime.extension(contentType);
    const ext = extFromMime ? `.${extFromMime}` : (cloudUrl.split(".").pop().split("?")[0] || "");
    const safeTitle = (notice.title || "notice")
      .replace(/[^a-z0-9_\-\. ]/gi, "_")
      .slice(0, 100);
    const filename = `${safeTitle}${ext}`;

    if (req.query.download === "true") {
      // Force download with an appropriate filename
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    } else {
      res.setHeader("Content-Disposition", "inline");
    }

    // Optional: caching headers (tune for your use-case)
    res.setHeader("Cache-Control", "public, max-age=3600");

    // Pipe the streamed response to the client
    response.data.pipe(res);

    // handle stream errors
    response.data.on("error", (streamErr) => {
      console.error("Stream error:", streamErr);
      // if headers not sent, send 500
      try {
        if (!res.headersSent) res.status(500).end("Error streaming file");
        else res.end();
      } catch (e) {
        // swallow
      }
    });
  } catch (err) {
    console.error("proxy file error:", err);
    res.status(500).json({ message: "Error fetching file", error: err.message });
  }
});


// Then update the /notice/citizen/notices route:
router.get("/citizen/notices", verifyToken, async (req, res) => {
  try {
    const { 
      category, 
      page = 1, 
      limit = 10
    } = req.query;

    // Get citizen's ward number from citizen data (not User)
    const citizen = await Citizen.findById(req.user.id);
    if (!citizen) {
      return res.status(404).json({ message: "Citizen not found" });
    }

    const citizenWard = citizen.address.wardNumber;

    let filter = { 
      status: 'published'
    };

    // Filter by category if provided
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Handle active notices only (not expired)
    const now = new Date();
    filter.$and = [
      {
        $or: [
          { publishDate: { $lte: now } },
          { publishDate: null }
        ]
      },
      {
        $or: [
          { expiryDate: { $gte: now } },
          { expiryDate: null }
        ]
      }
    ];

    // Ward-based filtering logic
    filter.$and.push({
      $or: [
        // Show notices for all citizens
        { targetAudience: 'all' },
        // OR show notices specifically for citizen's ward
        {
          targetAudience: 'ward_specific',
          targetWards: citizenWard
        }
      ]
    });

    const notices = await Notice.find(filter)
      .populate('createdBy', 'name email')
      .sort({ isPinned: -1, publishDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notice.countDocuments(filter);

    res.json({
      notices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      citizenWard
    });

  } catch (error) {
    console.error("Error fetching citizen notices:", error);
    res.status(500).json({ message: "Error fetching notices", error: error.message });
  }
});

module.exports = router;