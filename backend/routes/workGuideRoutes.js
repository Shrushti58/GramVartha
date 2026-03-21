const express = require("express");
const router  = express.Router();
const { verifyToken } = require("../utlis/jwt");
const {
  getWorkGuides,
  getWorkGuideById,
  createWorkGuide,
  updateWorkGuide,
  deleteWorkGuide,
} = require("../controllers/workGuideController");

router.get("/village/:villageId", getWorkGuides);

router.get("/:id", getWorkGuideById);

router.post("/", verifyToken, createWorkGuide);

router.delete("/:id", verifyToken, deleteWorkGuide);

router.put("/:id", verifyToken, updateWorkGuide);

module.exports = router;