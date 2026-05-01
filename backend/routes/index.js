const express = require("express");
const adminRoutes = require("./adminRoutes");
const officialsRoutes = require("./officialsRoutes");
const noticeRoutes = require("./noticeRoutes");
const villageRoutes = require("./villageRoutes");
const citizenRoutes = require("./citizenAuth");
const complaintsRoutes = require("./complaintsRoutes");
const workGuideRoutes = require("./workGuideRoutes");
const schemeRoutes = require("./schemeRoutes");
const weatherRoutes = require("../modules/weather/weather.routes");
const farmingRoutes = require("../modules/farming/farming.routes");
const healthController = require("../controllers/healthController");

const router = express.Router();

router.get("/", healthController.getHealth);

router.use("/admin", adminRoutes);
router.use("/officials", officialsRoutes);
router.use("/notice", noticeRoutes);
router.use("/villages", villageRoutes);
router.use("/citizen", citizenRoutes);
router.use("/complaints", complaintsRoutes);
router.use("/workguide", workGuideRoutes);
router.use("/schemes", schemeRoutes);
router.use("/api/v1/weather", weatherRoutes);
router.use("/api/v1/farming", farmingRoutes);

module.exports = router;
