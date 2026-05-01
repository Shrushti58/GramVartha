const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utlis/jwt");
const { authLimiter } = require("../src/middleware/rateLimiter");
const {
  registerCitizen,
  loginCitizen,
  registerPushToken
} = require("../controllers/citizenAuth");

router.post("/register", authLimiter, registerCitizen);
router.post("/login", authLimiter, loginCitizen);
router.post("/register-push-token", verifyToken, registerPushToken);

router.get("/me", verifyToken, (req, res) => {
  console.log("Decoded user from token:", req.user); // Debug log
  res.json({
    message: "User data fetched",
    user: req.user
  });
});

module.exports = router;
