const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },

    slug: {
      type: String,
      index: true,
      sparse: true,
    },

    description: String,
    shortDescription: String,
    benefits: String,
    eligibility: String,

    documents: [String],
    applicationSteps: [String],

    level: {
      type: String,
      enum: ["Central", "State", "Unknown"],
      default: "Unknown",
      index: true,
    },

    state: {
      type: String,
      default: "Unknown",
      index: true,
    },

    category: {
      type: [String],
      default: [],
      index: true,
    },

    beneficiary: {
      type: String,
      default: "general",
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    amount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "expired", "unknown"],
      default: "active",
      index: true,
    },

    verificationStatus: {
      type: String,
      enum: ["verified", "needs_verification", "needs_user_verification", "panchayat_provided"],
      default: "needs_user_verification",
    },

    source: {
      type: String,
      default: "myScheme - Government of India",
    },

    sourceUrl: {
      type: String,
      default: "https://www.myscheme.gov.in",
    },

    language: {
      type: String,
      default: "en",
    },

    scope: {
      type: String,
      enum: ["global", "village"],
      default: "global",
      index: true,
    },

    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// Search index
schemeSchema.index({
  title: "text",
  description: "text",
  shortDescription: "text",
  benefits: "text",
  eligibility: "text",
  tags: "text",
});

module.exports = mongoose.model("Scheme", schemeSchema);
