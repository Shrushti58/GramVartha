const express = require("express");
const router  = express.Router();

const { verifyToken } = require("../utlis/jwt");
const { uploadIssue } = require("../middlewares/uploadCloud");

const {
  createComplaint,
  getComplaints,
  updateStatus,
  resolveComplaint,
  getMyComplaints,
  getComplaintById,
  getComplaintsByVillage,
} = require("../controllers/complaintController");


router.post(
  "/create",
  verifyToken,
  uploadIssue.single("image"), 
  createComplaint
);

// Get user's own complaints
router.get("/my", verifyToken, getMyComplaints);

// Get single complaint by ID
router.get("/:id", getComplaintById);

// Get all complaints for a village
router.get("/village/:villageId", getComplaintsByVillage);

// Get complaints for user's village (requires auth)
router.get("/", verifyToken, getComplaints);

// Update complaint status
router.patch("/:id/status", verifyToken, updateStatus);

// Resolve complaint with image
router.patch(
  "/:id/resolve",
  verifyToken,
  uploadIssue.single("image"),
  resolveComplaint
);

module.exports = router;