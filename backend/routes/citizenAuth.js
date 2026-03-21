const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utlis/jwt");
const {
  registerCitizen,
  loginCitizen
} = require("../controllers/citizenAuth");

router.post("/register", registerCitizen);
router.post("/login", loginCitizen);

router.get("/me", verifyToken, (req, res) => {
  console.log("Decoded user from token:", req.user); // Debug log
  res.json({
    message: "User data fetched",
    user: req.user
  });
});

module.exports = router;