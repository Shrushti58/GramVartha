const express = require("express");
const router = express.Router();

const { uploadIssue } = require("../middlewares/uploadCloud"); 
const {verifyToken}  = require("../utlis/jwt");

const { createComplaint } = require("../controllers/complaintController");

router.post(
  "/create",
  verifyToken,
  uploadIssue.single("image"),
  createComplaint
);

module.exports = router;