const express = require("express");
const router = express.Router();

const upload = require("../middlewares/uploadCloud");
const {verifyToken}  = require("../utlis/jwt");

const { createComplaint } = require("../controllers/complaintController");

router.post(
  "/create",
  verifyToken,
  upload.single("photo"),
  createComplaint
);

module.exports = router;