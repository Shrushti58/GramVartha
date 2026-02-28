const Notice = require("../models/Notice");
const NoticeView = require("../models/NoticeView");
const Citizen = require("../models/Citizen");

const uploadNotice = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      noticeId, 
      category,
      priority = "medium",
      isPinned = false
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ 
        message: "Missing required fields: title, description, and category are required" 
      });
    }

    let fileUrl = null;
    let fileName = null;

    if (req.file) {
      fileUrl = req.file.path; 
      fileName = req.file.originalname;
    }

    let notice;

    if (noticeId) {
      notice = await Notice.findById(noticeId);
      if (!notice) {
        return res.status(404).json({ message: "Notice not found" });
      }
      if (notice.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ 
          message: "Not authorized to update this notice" 
        });
      }
      notice.title = title;
      notice.description = description;
      notice.category = category;
      notice.priority = priority;
      notice.isPinned = isPinned === 'true' || isPinned === true;
      
      if (fileUrl) {
        notice.fileUrl = fileUrl;
        notice.fileName = fileName;
      }

      await notice.save();

    } else {
    const noticeData = {
  title,
  description,
  category,
  priority,
  isPinned: isPinned === 'true' || isPinned === true,
  createdBy: req.user.id,

  village: req.user.village, // ← ADD THIS

  status: "published"
};

      if (fileUrl) {
        noticeData.fileUrl = fileUrl;
        noticeData.fileName = fileName;
      }

      notice = new Notice(noticeData);
      await notice.save();
    }
    await notice.populate('createdBy', 'name email');

    res.status(201).json({
      message: noticeId ? "Notice updated successfully" : "Notice published successfully",
      notice
    });

  } catch (err) {
    console.error("Notice upload error:", err);
    res.status(500).json({ 
      message: "Error saving notice", 
      error: err.message 
    });
  }
};

const fetchNotices = async (req, res) => {
  try {
    const { 
      category, 
      page = 1, 
      limit = 10,
      priority,
      isPinned
    } = req.query;

    let filter = { status: "published" };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (isPinned !== undefined) {
      filter.isPinned = isPinned === 'true';
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
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ message: "Error fetching notices", error: error.message });
  }
};

const fetchOfficialNotices = async (req, res) => {
  try {
    const { 
      category, 
      page = 1, 
      limit = 10,
      priority,
      isPinned
    } = req.query;

    let filter = { status: "published", village: req.user.village };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (isPinned !== undefined) {
      filter.isPinned = isPinned === 'true';
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
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error("Error fetching official notices:", error);
    res.status(500).json({ message: "Error fetching notices", error: error.message });
  }
};

const updateNotice = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category,
      priority,
      isPinned
    } = req.body;
    
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    if (notice.createdBy.toString() !== req.user.id || notice.village.toString() !== req.user.village.toString()) {
      return res.status(403).json({ message: "Not authorized to update this notice" });
    }

    let fileUrl = null;
    let fileName = null;
    if (req.file) {
      fileUrl = req.file.path;
      fileName = req.file.originalname;
    }

    notice.title = title || notice.title;
    notice.description = description || notice.description;
    notice.category = category || notice.category;
    notice.priority = priority || notice.priority;
    notice.isPinned = isPinned !== undefined ? (isPinned === 'true' || isPinned === true) : notice.isPinned;
    
    if (fileUrl) {
      notice.fileUrl = fileUrl;
      notice.fileName = fileName;
    }

    await notice.save();
    
    await notice.populate('createdBy', 'name email');
    
    res.json({ 
      message: "Notice updated successfully", 
      notice
    });
  } catch (err) {
    console.error("Error updating notice:", err);
    res.status(500).json({ message: "Error updating notice", error: err.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    if (notice.createdBy.toString() !== req.user.id || notice.village.toString() !== req.user.village.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this notice" });
    }

    await notice.deleteOne();
    res.json({ message: "Notice deleted successfully" });
  } catch (err) {
    console.error("Error deleting notice:", err);
    res.status(500).json({ message: "Error deleting notice", error: err.message });
  }
};

const trackNoticeView = async (req, res) => {
  try {
    const { visitorId } = req.body;
    const noticeId = req.params.id;

    if (!visitorId) {
      return res.status(400).json({ error: 'Visitor ID is required' });
    }

    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    const existingView = await NoticeView.findOne({
      noticeId: noticeId,
      visitorId: visitorId
    });

    if (existingView) {
      return res.json({ 
        success: true, 
        views: notice.views,
        alreadyViewed: true
      });
    }
    const noticeView = new NoticeView({
      noticeId: noticeId,
      visitorId: visitorId,
      userAgent: req.get('User-Agent') || '',
      ipAddress: req.ip || req.connection.remoteAddress
    });

    await noticeView.save();

    notice.views += 1;
    await notice.save();

    res.json({ 
      success: true, 
      views: notice.views,
      firstView: true
    });
  } catch (error) {
    console.error('Error tracking view:', error);
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
};

const getPopularNotices = async (req, res) => {
  try {
    const { limit = 10, category } = req.query;
    
    let query = { status: 'published' };
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const popularNotices = await Notice.find(query)
      .sort({ views: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');
      
    res.json(popularNotices);
  } catch (error) {
    console.error("Error fetching popular notices:", error);
    res.status(500).json({ error: 'Failed to fetch popular notices' });
  }
};

const getCitizenNotices = async (req, res) => {
  try {
    const { 
      category, 
      page = 1, 
      limit = 10
    } = req.query;

    const citizen = await Citizen.findById(req.user.id);
    if (!citizen) {
      return res.status(404).json({ message: "Citizen not found" });
    }

    const citizenWard = citizen.address.wardNumber;

    let filter = { status: 'published' };

    if (category && category !== 'all') {
      filter.category = category;
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
      currentPage: parseInt(page),
      total,
      citizenWard
    });

  } catch (error) {
    console.error("Error fetching citizen notices:", error);
    res.status(500).json({ message: "Error fetching notices", error: error.message });
  }
};

const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id).populate("createdBy", "name email");

    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    res.status(200).json({
      success: true,
      notice
    });
  } catch (error) {
    console.error("Error fetching notice:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notice",
      error: error.message
    });
  }
};


// Public: Get notices by village ID (for QR code scanning)
const getNoticesByVillage = async (req, res) => {
  try {
    const { villageId } = req.params;
    const { page = 1, limit = 10, category = 'all' } = req.query;

    const Village = require("../models/Village");
    
    // Verify village exists and is approved
    const village = await Village.findById(villageId);
    if (!village) {
      return res.status(404).json({ message: "Village not found" });
    }

    if (village.status !== 'approved') {
      return res.status(403).json({ message: "Village is not approved yet" });
    }

    // Build filter
    let filter = {
      village: villageId,
      status: "published"
    };

    if (category && category !== 'all') {
      filter.category = category;
    }

    // Fetch notices
    const notices = await Notice.find(filter)
      .populate("createdBy", "name email")
      .populate("village", "name district state pincode")
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notice.countDocuments(filter);

    res.json({
      notices,
      village: {
        _id: village._id,
        name: village.name,
        district: village.district,
        state: village.state,
        pincode: village.pincode
      },
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error("Error fetching notices by village:", err);
    res.status(500).json({ message: "Error fetching notices", error: err.message });
  }
};

module.exports = {
  uploadNotice,
  fetchNotices,
  fetchOfficialNotices,
  updateNotice,
  deleteNotice,
  trackNoticeView,
  getPopularNotices,
  getCitizenNotices,
  getNoticeById,
  getNoticesByVillage
};