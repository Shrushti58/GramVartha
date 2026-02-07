const mongoose = require("mongoose");

const NoticeViewSchema = new mongoose.Schema({
  noticeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notice",
    required: true
  },
  visitorId: {
    type: String,
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  },
  userAgent: {
    type: String,
    default: ""
  },
  ipAddress: {
    type: String,
    default: ""
  }
});

NoticeViewSchema.index({ noticeId: 1, visitorId: 1 }, { unique: true });
NoticeViewSchema.index({ viewedAt: -1 });
NoticeViewSchema.index({ noticeId: 1, viewedAt: -1 });

module.exports = mongoose.model("NoticeView", NoticeViewSchema);