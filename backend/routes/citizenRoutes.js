const express = require("express");
const router = express.Router();
const citizenController = require('../controllers/citizenController');
const { verifyToken } = require("../utlis/jwt");

router.post("/register", citizenController.registerCitizen);
router.post("/login", citizenController.loginCitizen);
router.post("/logout", citizenController.logoutCitizen);
router.get("/profile", verifyToken, citizenController.getCitizenProfile);

module.exports = router;