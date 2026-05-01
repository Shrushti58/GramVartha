const AppError = require("../../utils/appError");

const toSafeNumber = (value) => Number(Number(value).toFixed(4));

const sanitizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z_ -]/g, "");

function validateFarmingAdviceQuery(req, res, next) {
  const { lat, lon, crop, soilType } = req.query;

  if (lat === undefined || lon === undefined) {
    return next(new AppError("lat and lon are required query params", 400));
  }

  const parsedLat = Number(lat);
  const parsedLon = Number(lon);

  if (Number.isNaN(parsedLat) || Number.isNaN(parsedLon)) {
    return next(new AppError("lat and lon must be valid numbers", 400));
  }

  if (parsedLat < -90 || parsedLat > 90) {
    return next(new AppError("lat must be between -90 and 90", 400));
  }

  if (parsedLon < -180 || parsedLon > 180) {
    return next(new AppError("lon must be between -180 and 180", 400));
  }

  req.validatedQuery = {
    lat: toSafeNumber(parsedLat),
    lon: toSafeNumber(parsedLon),
    crop: sanitizeText(crop) || null,
    soilType: sanitizeText(soilType) || null,
  };

  return next();
}

module.exports = {
  validateFarmingAdviceQuery,
};
