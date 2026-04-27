const mongoose = require("mongoose");

/**
 * Scheme Model
 * Core fields are aligned with myScheme sync requirements.
 * Extra legacy fields are kept for backward compatibility with existing APIs.
 */
const SchemeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
      index: true, // For faster searches
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      default: "general",
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      default: "maharashtra",
      trim: true,
      index: true,
    },
    benefits: {
      type: String,
      default: "",
      trim: true,
    },
    eligibility: {
      type: String,
      default: "",
      trim: true,
    },
    sourceUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },

    // Legacy fields retained for existing endpoints/services.
    link: { type: String, trim: true, index: true },
    source: { type: String, default: "myscheme", trim: true },
    isNew: { type: Boolean, default: true, index: true },
    deadline: {
      type: Date,
      default: null,
    },
    processSteps: [
      {
        step: String,
        description: String,
      },
    ],
    contactInfo: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    imageUrl: {
      type: String,
      default: null,
    },
    scrapeStatus: { type: String, default: "success" },
    contentHash: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

// Required dedupe rule: skip duplicates by title + state.
SchemeSchema.index({ title: 1, state: 1 }, { unique: true });

// Legacy query indexes.
SchemeSchema.index({ createdAt: -1 });
SchemeSchema.index({ category: 1, state: 1 });
SchemeSchema.index({ source: 1, createdAt: -1 });

module.exports = mongoose.model("Scheme", SchemeSchema);
