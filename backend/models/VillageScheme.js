const mongoose = require("mongoose");
const villageSchemeSchema = new mongoose.Schema({
  schemeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scheme",
    required: true,
  },
  villageId: {
    type: String,
    required: true,
  },

  // Override fields (optional)
  customTitle: String,
  customDescription: String,
  customAmount: Number,
  isActive: {
    type: Boolean,
    default: true,
  },

  // For new schemes created by village
  isCustom: {
    type: Boolean,
    default: false,
  },

  updatedBy: String,
}, { timestamps: true });

module.exports = mongoose.model("VillageScheme", villageSchemeSchema);