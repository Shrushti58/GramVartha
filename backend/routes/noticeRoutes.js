const express = require("express");
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const upload = require("../middlewares/uploadCloud");
const { verifyToken } = require("../utlis/jwt");
const {
  rejectMongoOperators,
  validateRequest,
  objectIdParam,
  pagination,
  noticeValidators,
} = require("../middlewares/validators");

router.use(rejectMongoOperators);

router.post("/upload", verifyToken, upload.single("file"), noticeValidators.save, validateRequest, noticeController.uploadNotice);
router.get("/fetch", pagination, validateRequest, noticeController.fetchNotices);
router.get("/village/:villageId", objectIdParam("villageId"), pagination, validateRequest, noticeController.getNoticesByVillage);
router.get("/official/fetch", pagination, validateRequest, verifyToken, noticeController.fetchOfficialNotices);
router.get("/popular", pagination, validateRequest, noticeController.getPopularNotices);
router.put("/update/:id", verifyToken, upload.single("file"), noticeValidators.update, validateRequest, noticeController.updateNotice);
router.delete("/delete/:id", objectIdParam("id"), validateRequest, verifyToken, noticeController.deleteNotice);
router.get("/:id", objectIdParam("id"), validateRequest, noticeController.getNoticeById);
router.post("/:id/view", noticeValidators.trackView, validateRequest, noticeController.trackNoticeView);

module.exports = router;
