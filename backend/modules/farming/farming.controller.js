const farmingService = require("./farming.service");

async function getFarmingAdvice(req, res) {
  const data = await farmingService.getFarmingAdvice(req.validatedQuery);

  res.status(200).json({
    status: "success",
    data,
  });
}

module.exports = {
  getFarmingAdvice,
};
