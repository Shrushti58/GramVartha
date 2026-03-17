const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
{
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizens",
    required: true
  },

  village: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Village",
    required: true
  },

  type: {
    type: String,
    enum: ["issue", "complaint", "appreciation"],
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  photo: {
    type: String
  },

  location: {
    lat: Number,
    lng: Number
  },

  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved"],
    default: "pending"
  },

  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint"
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);