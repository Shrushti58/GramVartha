const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    trim: true
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
      "general",
      "urgent"
    ],
    default: "general"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  targetAudience: {
    type: String,
    enum: ["all", "ward_specific"],
    default: "all"
  },
  targetWards: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Officals",
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "published"
  },
  views: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

NoticeSchema.index({ createdAt: -1 });
NoticeSchema.index({ category: 1 });
NoticeSchema.index({ status: 1 });
NoticeSchema.index({ isPinned: -1 });
NoticeSchema.index({ targetAudience: 1, targetWards: 1 });

module.exports = mongoose.model("Notice", NoticeSchema);