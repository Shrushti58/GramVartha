const express = require("express");
const router = express.Router();

const {
  registerCitizen,
  loginCitizen
} = require("../controllers/citizenAuth");

router.post("/register", registerCitizen);
router.post("/login", loginCitizen);

module.exports = router;