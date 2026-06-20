const express = require("express");
const router = express.Router();
const officialsController = require('../controllers/officialsController');
const { verifyToken } = require("../utlis/jwt");
const { uploadProfile } = require("../middlewares/uploadCloud");
const {
  rejectMongoOperators,
  validateRequest,
  objectIdParam,
  authValidators,
  adminValidators,
} = require("../middlewares/validators");

router.use(rejectMongoOperators);

router.post(
  "/register",
  uploadProfile.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'documentProof', maxCount: 1 }]),
  authValidators.officialRegister,
  validateRequest,
  officialsController.registerOfficial
);
router.post("/login", authValidators.loginEmail, validateRequest, officialsController.loginOfficial);
router.post("/logout", officialsController.logoutOfficial);

router.get("/me", verifyToken, officialsController.getCurrentOfficial);

router.get("/profile", verifyToken, officialsController.getOfficialProfile);
router.post("/profile/image", verifyToken, uploadProfile.single('profileImage'), officialsController.uploadProfileImage);

router.get("/pending", verifyToken, officialsController.getPendingOfficials);
router.put("/approve/:id", objectIdParam("id"), validateRequest, verifyToken, officialsController.approveOfficial);
router.put("/reject/:id", objectIdParam("id"), validateRequest, verifyToken, officialsController.rejectOfficial);
router.get("/all", verifyToken, officialsController.getAllOfficials);
router.delete("/:id", objectIdParam("id"), validateRequest, verifyToken, officialsController.deleteOfficial);
router.put("/:id", adminValidators.editOfficial, validateRequest, verifyToken, officialsController.updateOfficial);

module.exports = router;
