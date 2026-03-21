const express = require("express");
const { createVillage, registerVillage, getVillages, updateVillage, deleteVillage, getPendingVillages, approveVillage, rejectVillage, updateVillageCoordinates, getVillageQRCode, getVillageByQRCode, generateQRCode, downloadQRCode } = require("../controllers/villageController");
const { verifyToken } = require("../utlis/jwt");
const { uploadVillageDoc } = require("../middlewares/uploadCloud");

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied. Superadmin required.' });
  }
  next();
};
router.post("/register", uploadVillageDoc.single('document'), registerVillage);
router.put("/coordinates/:id", updateVillageCoordinates);
router.get("/debug/qr-codes", async (req, res) => {
  try {
    const Village = require("../models/Village");
    const villages = await Village.find().select('name district state pincode status qrCode._id qrCode.uniqueId');
    res.json({
      message: "All villages with QR code info",
      count: villages.length,
      villages: villages.map(v => ({
        _id: v._id,
        name: v.name,
        district: v.district,
        state: v.state,
        pincode: v.pincode,
        status: v.status,
        qrCodeId: v.qrCode?.uniqueId || 'NOT SET'
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/qr/:qrCodeId", getVillageByQRCode);
router.get("/:id/qrcode", getVillageQRCode);
router.post("/:id/qrcode/generate", verifyToken, generateQRCode);
router.get("/:id/qrcode/download", verifyToken, downloadQRCode);
router.post("/create", verifyToken, requireSuperAdmin, createVillage);
router.get("/", getVillages);
router.get("/pending", verifyToken, requireSuperAdmin, getPendingVillages);
router.put("/approve/:id", verifyToken, requireSuperAdmin, approveVillage);
router.put("/reject/:id", verifyToken, requireSuperAdmin, rejectVillage);
router.put("/:id", verifyToken, requireSuperAdmin, updateVillage);
router.delete("/:id", verifyToken, requireSuperAdmin, deleteVillage);

module.exports = router;
