const express = require("express");
const router = express.Router();
const officialsController = require('../controllers/officialsController');
const { verifyToken } = require("../utlis/jwt");

router.post("/register", officialsController.registerOfficial);
router.post("/login", officialsController.loginOfficial);
router.post("/logout", officialsController.logoutOfficial);

router.get("/me", verifyToken, officialsController.getCurrentOfficial);

router.get("/pending", verifyToken, officialsController.getPendingOfficials);
router.put("/approve/:id", verifyToken, officialsController.approveOfficial);
router.put("/reject/:id", verifyToken, officialsController.rejectOfficial);
router.get("/all", verifyToken, officialsController.getAllOfficials);
router.delete("/:id", verifyToken, officialsController.deleteOfficial);

module.exports = router;