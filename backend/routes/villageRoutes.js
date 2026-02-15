const express = require("express");
const { createVillage, registerVillage, getVillages, updateVillage, deleteVillage, getPendingVillages, approveVillage, rejectVillage, updateVillageCoordinates } = require("../controllers/villageController");
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

router.post("/create", verifyToken, requireSuperAdmin, createVillage);
router.get("/", getVillages);
router.get("/pending", verifyToken, requireSuperAdmin, getPendingVillages);
router.put("/approve/:id", verifyToken, requireSuperAdmin, approveVillage);
router.put("/reject/:id", verifyToken, requireSuperAdmin, rejectVillage);
router.put("/:id", verifyToken, requireSuperAdmin, updateVillage);
router.delete("/:id", verifyToken, requireSuperAdmin, deleteVillage);

module.exports = router;
