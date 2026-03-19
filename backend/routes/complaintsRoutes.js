const express = require("express");
const router  = express.Router();

const { verifyToken } = require("../utlis/jwt");
const { uploadIssue } = require("../middlewares/uploadCloud");

const {
  createComplaint,
  getComplaints,
  updateStatus,
  resolveComplaint,
} = require("../controllers/complaintController");


router.post(
  "/create",
  verifyToken,
  uploadIssue.single("image"), 
  createComplaint
);

router.get("/", verifyToken, getComplaints);
router.patch("/:id/status", verifyToken, updateStatus);
router.patch(
  "/:id/resolve",
  verifyToken,
  uploadIssue.single("image"),
  resolveComplaint
);

module.exports = router;