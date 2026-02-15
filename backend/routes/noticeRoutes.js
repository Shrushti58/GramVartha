const express = require("express");
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const upload = require("../middlewares/uploadCloud");
const { verifyToken } = require("../utlis/jwt");

router.post("/upload", verifyToken, upload.single("file"), noticeController.uploadNotice);
router.get("/fetch", noticeController.fetchNotices);
router.get("/location", noticeController.getNoticesByLocation);
router.get("/official/fetch", verifyToken, noticeController.fetchOfficialNotices);
router.put("/update/:id", verifyToken, upload.single("file"), noticeController.updateNotice);
router.delete("/delete/:id", verifyToken, noticeController.deleteNotice);

router.get("/:id", noticeController.getNoticeById);

router.post("/:id/view", noticeController.trackNoticeView);

router.get("/popular", noticeController.getPopularNotices);

router.get("/citizen/notices", verifyToken, noticeController.getCitizenNotices);

module.exports = router;