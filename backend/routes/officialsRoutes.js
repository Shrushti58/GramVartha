const express = require("express");
const router = express.Router();
const officialsController = require('../controllers/officialsController');
const { verifyToken } = require("../utlis/jwt");

router.post("/register", officialsController.registerOfficial);
router.post("/login", officialsController.loginOfficial);
router.post("/logout", officialsController.logoutOfficial);

router.get("/me", verifyToken, officialsController.getCurrentOfficial);

module.exports = router;