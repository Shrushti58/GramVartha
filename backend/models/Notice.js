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
  },
  category: {
    type: String,
    required: true,
    enum: [
      "development",
      "health",
      "education", 
      "agriculture",
      "employment",
      "social_welfare",
      "tax_billing",
      "election",
      "meeting",
      "general"
    ],
    default: "general"
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

// Index for faster queries
NoticeSchema.index({ createdAt: -1 });
NoticeSchema.index({ category: 1 });

module.exports = mongoose.model("Notice", NoticeSchema);