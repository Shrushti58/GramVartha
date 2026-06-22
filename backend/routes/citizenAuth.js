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
router.post(
  "/register-push-token",
  (req, res, next) => {
    console.log("[push-token] Route hit", {
      method: req.method,
      path: req.originalUrl,
      hasAuthorization: Boolean(req.headers.authorization),
      hasPushToken: Boolean(req.body?.pushToken),
      pushToken: req.body?.pushToken,
    });
    next();
  },
  authValidators.pushToken,
  validateRequest,
  (req, res, next) => {
    console.log("[push-token] Validation passed", {
      hasAuthorization: Boolean(req.headers.authorization),
      hasPushToken: Boolean(req.body?.pushToken),
    });
    next();
  },
  verifyToken,
  (req, res, next) => {
    console.log("[push-token] Auth passed", {
      userId: req.user?.id,
      village: req.user?.village,
    });
    next();
  },
  registerPushToken
);
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
