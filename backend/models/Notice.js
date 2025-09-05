const mongoose = require("mongoose");
const Officals=require('../models/Officals')

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
    type: String, 
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Officals",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("Notice", NoticeSchema);
