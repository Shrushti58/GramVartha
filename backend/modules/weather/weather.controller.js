const weatherService = require("./weather.service");

const getWeatherAdvice = async (req, res) => {
  const { lat, lon } = req.validatedQuery;
  const data = await weatherService.getWeatherAdvice({ lat, lon });

  res.status(200).json({
    status: "success",
    data,
  });
};

module.exports = {
  getWeatherAdvice,
};
