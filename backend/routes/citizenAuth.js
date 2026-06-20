const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utlis/jwt");
const {
  rejectMongoOperators,
  validateRequest,
  authValidators,
} = require("../middlewares/validators");
const {
  registerCitizen,
  loginCitizen,
  registerPushToken,
  unregisterPushToken,
  deleteCitizenAccount
} = require("../controllers/citizenAuth");

router.use(rejectMongoOperators);

router.post("/register", authValidators.citizenRegister, validateRequest, registerCitizen);
router.post("/login", authValidators.citizenLogin, validateRequest, loginCitizen);
router.post("/register-push-token", authValidators.pushToken, validateRequest, verifyToken, registerPushToken);
router.post("/unregister-push-token", authValidators.pushToken, validateRequest, verifyToken, unregisterPushToken);
router.delete("/me", verifyToken, deleteCitizenAccount);

router.get("/me", verifyToken, (req, res) => {
  console.log("Decoded user from token:", req.user); // Debug log
  res.json({
    message: "User data fetched",
    user: req.user
  });
});

module.exports = router;
