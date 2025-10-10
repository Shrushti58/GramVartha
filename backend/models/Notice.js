const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  fileUrl: {
    type: String, // Cloudinary or uploaded file URL
    required: true,
  },
  extractedText: {
    type: String, // Text extracted via OCR from PDF/image
    required: true,
  },
  aiExplanation: {
    summary: { type: String}, // Short summary for citizens
    bullets: { type: [String]}, // Key points
    full: { type: String}, // Full explanation
    language: { type: String, default: "auto"},
    translations: {
      type: Map,
      of: new mongoose.Schema({
        summary: { type: String},
        full: { type: String},
        bullets: { type: [String]},
      }),
      default: {},
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Officals", // keeping typo as you wanted
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "done", "error"],
    default: "pending",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Index for faster queries (by creation date)
NoticeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notice", NoticeSchema);
