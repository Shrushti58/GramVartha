const express = require("express");
const router = express.Router();
const officialsController = require('../controllers/officialsController');
const { verifyToken } = require("../utlis/jwt");
const { uploadProfile } = require("../middlewares/uploadCloud");
const { authLimiter } = require("../src/middleware/rateLimiter");

router.post("/register", authLimiter, uploadProfile.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'documentProof', maxCount: 1 }]), officialsController.registerOfficial);
router.post("/login", authLimiter, officialsController.loginOfficial);
router.post("/logout", officialsController.logoutOfficial);

router.get("/me", verifyToken, officialsController.getCurrentOfficial);

router.get("/profile", verifyToken, officialsController.getOfficialProfile);
router.post("/profile/image", verifyToken, uploadProfile.single('profileImage'), officialsController.uploadProfileImage);

router.get("/pending", verifyToken, officialsController.getPendingOfficials);
router.put("/approve/:id", verifyToken, officialsController.approveOfficial);
router.put("/reject/:id", verifyToken, officialsController.rejectOfficial);
router.get("/all", verifyToken, officialsController.getAllOfficials);
router.delete("/:id", verifyToken, officialsController.deleteOfficial);
router.put("/:id", verifyToken, officialsController.updateOfficial);

module.exports = router;
