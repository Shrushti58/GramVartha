const express = require("express");
const router = express.Router();

const {
  getBasicWeatherAdvice,
  getCropWeatherAdvice,
} = require("../controllers/weatherController");

router.get("/basic-advice/:villageId", getBasicWeatherAdvice);

router.get("/crop-advice/:villageId", getCropWeatherAdvice);

module.exports = router;