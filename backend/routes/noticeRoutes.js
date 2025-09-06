const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");
const upload = require('../middlewares/uploadCloud');
const { verifyToken } = require("../utlis/jwt"); 


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


router.get("/fetch", async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("createdBy", "name email") // optional: show official info
      .sort({ createdAt: -1 }); // latest first

    res.json(notices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching notices", error: err });
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