const express = require("express");
const { createVillage, registerVillage, getVillages, updateVillage, deleteVillage, getPendingVillages, approveVillage, rejectVillage, updateVillageCoordinates, getVillageQRCode, getVillageByQRCode, generateQRCode, downloadQRCode } = require("../controllers/villageController");
const { verifyToken } = require("../utlis/jwt");
const { uploadVillageDoc } = require("../middlewares/uploadCloud");
const {
  rejectMongoOperators,
  validateRequest,
  objectIdParam,
  villageValidators,
} = require("../middlewares/validators");

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied. Superadmin required.' });
  }
  next();
};
router.use(rejectMongoOperators);

router.post(
  "/register",
  uploadVillageDoc.single('document'),
  villageValidators.register,
  validateRequest,
  registerVillage
);
router.put("/coordinates/:id", villageValidators.coordinates, validateRequest, updateVillageCoordinates);
router.get("/qr/:qrCodeId", getVillageByQRCode);
router.get("/:id/qrcode", objectIdParam("id"), validateRequest, getVillageQRCode);
router.post("/:id/qrcode/generate", objectIdParam("id"), validateRequest, verifyToken, generateQRCode);
router.get("/:id/qrcode/download", objectIdParam("id"), validateRequest, verifyToken, downloadQRCode);
router.post("/create", villageValidators.create, validateRequest, verifyToken, requireSuperAdmin, createVillage);
router.get("/", getVillages);
router.get("/pending", verifyToken, requireSuperAdmin, getPendingVillages);
router.put("/approve/:id", objectIdParam("id"), validateRequest, verifyToken, requireSuperAdmin, approveVillage);
router.put("/reject/:id", objectIdParam("id"), validateRequest, verifyToken, requireSuperAdmin, rejectVillage);
router.put("/:id", villageValidators.update, validateRequest, verifyToken, requireSuperAdmin, updateVillage);
router.delete("/:id", objectIdParam("id"), validateRequest, verifyToken, requireSuperAdmin, deleteVillage);

module.exports = router;
