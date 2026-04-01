const mongoose = require("mongoose");

const CitizenSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  village: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Village",
    required: true
  },
  pushTokens: {
    type: [String],
    default: []
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Citizens", CitizenSchema);