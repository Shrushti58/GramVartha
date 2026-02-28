const express = require("express");
const { createVillage, registerVillage, getVillages, updateVillage, deleteVillage, getPendingVillages, approveVillage, rejectVillage, updateVillageCoordinates, getVillageQRCode, getVillageByQRCode, generateQRCode, downloadQRCode } = require("../controllers/villageController");
const { verifyToken } = require("../utlis/jwt");
const { uploadVillageDoc } = require("../middlewares/uploadCloud");

const router = express.Router();

// Middleware to check if user is superadmin
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied. Superadmin required.' });
  }
  next();
};

// Public endpoint: request village be added (creates pending village + pending admin)
router.post("/register", uploadVillageDoc.single('document'), registerVillage);

// Public endpoint: update village coordinates (for location detection)
router.put("/coordinates/:id", updateVillageCoordinates);

// Debug endpoint: Get all villages with their QR code info (for testing/verification)
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

// Public endpoint: Get village by QR code (Citizens scan QR codes)
router.get("/qr/:qrCodeId", getVillageByQRCode);

// Get QR code details for a village (Admin/Officials)
router.get("/:id/qrcode", getVillageQRCode);

// Generate QR code image and upload to Cloudinary (Admin/Officials)
// Permission enforced in controller: superadmin OR user whose village matches the requested village
router.post("/:id/qrcode/generate", verifyToken, generateQRCode);

// Download QR code image for a village (Admin/Officials)
router.get("/:id/qrcode/download", verifyToken, downloadQRCode);

router.post("/create", verifyToken, requireSuperAdmin, createVillage);
router.get("/", getVillages);
router.get("/pending", verifyToken, requireSuperAdmin, getPendingVillages);
router.put("/approve/:id", verifyToken, requireSuperAdmin, approveVillage);
router.put("/reject/:id", verifyToken, requireSuperAdmin, rejectVillage);
router.put("/:id", verifyToken, requireSuperAdmin, updateVillage);
router.delete("/:id", verifyToken, requireSuperAdmin, deleteVillage);

module.exports = router;
