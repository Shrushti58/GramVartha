const mongoose = require("mongoose");

const WorkGuideSchema = new mongoose.Schema(
  {
    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Certificates & Documents",
        "Land & Property",
        "Ration & Government Schemes",
        "Water & Sanitation",
        "Roads & Infrastructure",
        "Birth & Death Registration",
        "Elections",
        "Agriculture",
        "Health",
        "Education",
        "Gram Sabha & Administration",
      ],
    },

    workName: {
      type: String,
      required: true,
      trim: true,
    },

    officerName: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    availableDays: {
      type: [String],
      default: [],
    },

    timing: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    documents: {
      type: [String],
      default: [],
    },

    searchKeywords: {
      type: [String],
      default: [],
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

WorkGuideSchema.index({
  workName:       "text",
  officerName:    "text",
  designation:    "text",
  category:       "text",
  documents:      "text",
  searchKeywords: "text",
});

module.exports = mongoose.model("WorkGuide", WorkGuideSchema);