const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Notice = require("../models/Notice");
const { extractText } = require("../utlis/extractText");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { verifyToken } = require("../utlis/jwt");

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

// POST /notice/upload - create or update notice (AI optional/lazy)
router.post("/upload", verifyToken, multerUpload.single("file"), async (req, res) => {
  try {
    const { title, description, noticeId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let fileUrl = null;
    let mimetype = null;
    let extractedText = "";
    let aiExplanation = { summary: "", bullets: [], full: "", language: "auto" };

    // Upload new file to Cloudinary if provided
    if (req.file && req.file.path) {
      const cloudRes = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "gramvartha_notices",
      });
      fileUrl = cloudRes.secure_url;
      mimetype = req.file.mimetype;

      // Extract text from uploaded file
      extractedText = await extractText(fileUrl, mimetype);

      // Cleanup local temp file safely
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    let notice;
    if (noticeId) {
      // Update existing notice
      notice = await Notice.findById(noticeId);
      if (!notice) return res.status(404).json({ message: "Notice not found" });

      notice.title = title;
      notice.description = description;
      if (fileUrl) notice.fileUrl = fileUrl;
      if (extractedText) notice.extractedText = extractedText;
      notice.status = extractedText ? "done" : notice.status;

      await notice.save();
    } else {
      // Create new notice
      notice = new Notice({
        title,
        description,
        fileUrl,
        extractedText,
        aiExplanation, // still empty initially
        createdBy: req.user.id,
        status: extractedText ? "done" : "pending",
      });

      await notice.save();
    }

    // ✅ AI Explanation is now lazy / optional
    // You can trigger AI processing later via a separate route
    // Example: /notice/generateAI/:id

    res.status(201).json({
      message: "Notice saved successfully",
      notice,
      info: "AI explanation can be generated later on-demand",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving notice", error: err.message });
  }
});
// POST /notice/upload - create or update notice (AI optional/lazy)
router.post("/upload", verifyToken, multerUpload.single("file"), async (req, res) => {
  try {
    const { title, description, noticeId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let fileUrl = null;
    let mimetype = null;
    let extractedText = "";
    let aiExplanation = { summary: "", bullets: [], full: "", language: "auto" };

    // Upload new file to Cloudinary if provided
    if (req.file && req.file.path) {
      const cloudRes = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "gramvartha_notices",
      });
      fileUrl = cloudRes.secure_url;
      mimetype = req.file.mimetype;

      // Extract text from uploaded file
      extractedText = await extractText(fileUrl, mimetype);

      // Cleanup local temp file safely
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    let notice;
    if (noticeId) {
      // Update existing notice
      notice = await Notice.findById(noticeId);
      if (!notice) return res.status(404).json({ message: "Notice not found" });

      notice.title = title;
      notice.description = description;
      if (fileUrl) notice.fileUrl = fileUrl;
      if (extractedText) notice.extractedText = extractedText;
      notice.status = extractedText ? "done" : notice.status;

      await notice.save();
    } else {
      // Create new notice
      notice = new Notice({
        title,
        description,
        fileUrl,
        extractedText,
        aiExplanation, // still empty initially
        createdBy: req.user.id,
        status: extractedText ? "done" : "pending",
      });

      await notice.save();
    }

    // ✅ AI Explanation is now lazy / optional
    // You can trigger AI processing later via a separate route
    // Example: /notice/generateAI/:id

    res.status(201).json({
      message: "Notice saved successfully",
      notice,
      info: "AI explanation can be generated later on-demand",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving notice", error: err.message });
  }
});

router.post("/generateAI/:id", async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    if (!notice.extractedText) {
      return res.status(400).json({ message: "No text to generate AI explanation" });
    }

    const aiExplanation = await getStructuredExplanation(notice.extractedText);
    notice.aiExplanation = aiExplanation;
    await notice.save();

    res.json({ success: true, aiExplanation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate AI explanation", error: err.message });
  }
});


router.get("/generateDetails/:id", async (req, res) => {
  try {
    const noticeId = req.params.id;
    const notice = await Notice.findById(noticeId).populate("createdBy"); // populate if you have user info

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json(notice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});






































router.get("/fetch", async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const safeNotices = notices.map((n) => {
      return {
        _id: n._id,
        title: n.title,
        description: n.description,
        fileUrl: n.fileUrl || null, // This is the key part for the front end
        createdBy: n.createdBy,
        createdAt: n.createdAt,
      };
    });

    res.json(safeNotices);
  } catch (err) {
    console.error("fetch notices error:", err);
    res
      .status(500)
      .json({ message: "Error fetching notices", error: err.message });
  }
});
/**
 * GET /notice/:id/file
 * Proxy/stream file from Cloudinary (or any storage) through your backend.
 * - ?download=true forces Content-Disposition: attachment (download)
 * - otherwise Content-Disposition: inline (view in browser)
 */
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



router.put("/update/:id", verifyToken, multerUpload.single("file"), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    if (notice.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this notice" });
    }

    notice.title = req.body.title || notice.title;
    notice.description = req.body.description || notice.description;

    
    if (req.file) {
      notice.fileUrl = req.file.path;
    }

    await notice.save();
    res.json({ message: "Notice updated successfully", notice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating notice", error: err });
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

module.exports = router;