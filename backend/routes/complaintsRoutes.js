const express = require("express");
const router  = express.Router();

const { verifyToken } = require("../utlis/jwt");
const { uploadIssue } = require("../middlewares/uploadCloud");
const { complaintLimiter } = require("../middlewares/rateLimiter");
const {
  rejectMongoOperators,
  validateRequest,
  objectIdParam,
  objectIdQuery,
  pagination,
  complaintValidators,
} = require("../middlewares/validators");

const {
  createComplaint,
  getComplaints,
  updateStatus,
  resolveComplaint,
  getMyComplaints,
  getComplaintById,
  getComplaintsByVillage,
} = require("../controllers/complaintController");

router.use(rejectMongoOperators);

router.post(
  "/create",
  // Limit complaint creation only; viewing and status updates should remain usable.
  complaintLimiter,
  verifyToken,
  uploadIssue.single("image"),
  complaintValidators.create,
  validateRequest,
  createComplaint
);

// Get user's own complaints
router.get("/my", pagination, validateRequest, verifyToken, getMyComplaints);

// Get single complaint by ID
router.get("/:id", objectIdParam("id"), validateRequest, getComplaintById);

// Get all complaints for a village
router.get(
  "/village/:villageId",
  objectIdParam("villageId"),
  pagination,
  objectIdQuery("unused"),
  validateRequest,
  getComplaintsByVillage
);

// Get complaints for user's village (requires auth)
router.get("/", pagination, validateRequest, verifyToken, getComplaints);

// Update complaint status
router.patch("/:id/status", complaintValidators.updateStatus, validateRequest, verifyToken, updateStatus);

// Resolve complaint with image
router.patch(
  "/:id/resolve",
  objectIdParam("id"),
  validateRequest,
  verifyToken,
  uploadIssue.single("image"),
  resolveComplaint
);

module.exports = router;
