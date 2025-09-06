const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");
const upload = require('../middlewares/uploadCloud');
const { verifyToken } = require("../utlis/jwt"); 
const axios=require('axios')
const mime=require('mime-types')


router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const notice = new Notice({
      title: req.body.title,
      description: req.body.description,
      fileUrl: req.file ? req.file.path : null, 
      createdBy: req.user.id,
    });

    await notice.save();
    res.status(201).json({ message: "Notice uploaded successfully", notice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading notice", error: err });
  }
});

// Fetch all notices (without exposing fileUrl directly)
router.get("/fetch", async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    // Don't expose Cloudinary URL
    const safeNotices = notices.map((n) => ({
      _id: n._id,
      title: n.title,
      description: n.description,
      file: !!n.fileUrl, // just tell frontend if file exists
      createdBy: n.createdBy,
      createdAt: n.createdAt,
    }));

    res.json(safeNotices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching notices" });
  }
});



/**
 * GET /notice/fetch
 * Return notice metadata WITHOUT exposing fileUrl
 */
router.get("/fetch", async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const safeNotices = notices.map((n) => {
      const fileUrl = n.fileUrl || "";
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
      return {
        _id: n._id,
        title: n.title,
        description: n.description,
        hasFile: !!n.fileUrl,       // frontend can know whether file exists
        fileIsImage: isImage,       // frontend can decide to show inline preview
        createdBy: n.createdBy,
        createdAt: n.createdAt,
      };
    });

    res.json(safeNotices);
  } catch (err) {
    console.error("fetch notices error:", err);
    res.status(500).json({ message: "Error fetching notices", error: err.message });
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



router.put("/update/:id", verifyToken, upload.single("file"), async (req, res) => {
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