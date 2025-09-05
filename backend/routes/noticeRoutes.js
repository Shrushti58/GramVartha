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

module.exports = router;