const express = require("express");
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const upload = require("../middlewares/uploadCloud");
const { verifyToken } = require("../utlis/jwt");

router.post("/upload", verifyToken, upload.single("file"), noticeController.uploadNotice);
router.get("/fetch", noticeController.fetchNotices);
router.get("/village/:villageId", noticeController.getNoticesByVillage);
router.get("/official/fetch", verifyToken, noticeController.fetchOfficialNotices);
router.get("/popular", noticeController.getPopularNotices);
router.put("/update/:id", verifyToken, upload.single("file"), noticeController.updateNotice);
router.delete("/delete/:id", verifyToken, noticeController.deleteNotice);

// Place parameterized routes LAST to avoid conflicts
router.get("/:id", noticeController.getNoticeById);
router.post("/:id/view", noticeController.trackNoticeView);

module.exports = router;