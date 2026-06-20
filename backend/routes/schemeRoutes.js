const express = require("express");
const router = express.Router();
const getSchemesForCitizen = require("../controllers/schemeController").getSchemesForCitizen;
const getSchemesForOfficial = require("../controllers/schemeController").getSchemesForOfficial;
const getSchemeBySlug = require("../controllers/schemeController").getSchemeBySlug;
const searchSchemes = require("../controllers/schemeController").searchSchemes;
const getVillageSchemesForOfficial = require("../controllers/schemeController").getVillageSchemesForOfficial;
const createVillageScheme = require("../controllers/schemeController").createVillageScheme;
const updateVillageScheme = require("../controllers/schemeController").updateVillageScheme;
const deleteVillageScheme = require("../controllers/schemeController").deleteVillageScheme;
const { verifyToken } = require("../utlis/jwt");

// ===============================
// 🌍 PUBLIC (Citizen)
// ===============================
router.get("/", getSchemesForCitizen);
router.get("/search", searchSchemes);



// ===============================
// 🔐 OFFICIAL (Protected)
// ===============================
router.get("/official", verifyToken, getSchemesForOfficial);
router.get("/village", verifyToken, getVillageSchemesForOfficial);

// ➕ Create new custom scheme
router.post("/village", verifyToken, createVillageScheme);

// ✏️ Update existing scheme (override)
router.put("/village/:schemeId", verifyToken, updateVillageScheme);
router.delete("/village/:schemeId", verifyToken, deleteVillageScheme);

router.get("/:slug", getSchemeBySlug);
module.exports = router;
