const express = require("express");
const weatherController = require("./weather.controller");
const asyncHandler = require("../../middlewares/asyncHandler");
const {
  validateWeatherAdviceQuery,
} = require("./weather.validation");

const router = express.Router();

router.get(
  "/advice",
  validateWeatherAdviceQuery,
  asyncHandler(weatherController.getWeatherAdvice)
);

module.exports = router;
