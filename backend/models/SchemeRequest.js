const mongoose = require("mongoose");
const schemeRequestSchema = new mongoose.Schema({
  schemeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scheme",
  },
  villageId: {
    type: String,
    required: true,
  },

  requestedChanges: {
    type: Object, // flexible (amount, title, etc.)
    required: true,
  },

  requestedBy: String,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  reviewedBy: String,
}, { timestamps: true });

module.exports = mongoose.model("SchemeRequest", schemeRequestSchema);