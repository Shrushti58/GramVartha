const mongoose = require("mongoose");

const villageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  district: String,
  state: String,
  pincode: String,
  latitude: Number,
  longitude: Number
  ,
  status: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending"
  },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
}, { timestamps: true });

module.exports = mongoose.model("Village", villageSchema);