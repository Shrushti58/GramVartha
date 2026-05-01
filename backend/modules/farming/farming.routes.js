const express = require("express");
const asyncHandler = require("../../middlewares/asyncHandler");
const { validateFarmingAdviceQuery } = require("./farming.validation");
const farmingController = require("./farming.controller");

const router = express.Router();

router.get(
  "/advice",
  validateFarmingAdviceQuery,
  asyncHandler(farmingController.getFarmingAdvice)
);

module.exports = router;
