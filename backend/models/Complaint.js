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
    enum: ["issue", "complaint"],
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

  imageUrl: {
    type: String
  },

  location: {
    lat: Number,
    lng: Number
  },

  imageSource: {
    type: String,
    enum: ["camera", "gallery"]
  },

  timestamp: {
    type: Date
  },

  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved",'rejected'],
    default: "pending"
  },

  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint"
  },

  aiVerification: {
    isValidIssue: {
      type: Boolean,
      default: true
    },

    labels: [String],

    fraudScore: {
      type: Number,
      default: 0
    },

    remarks: {
      type: String
    }
  },

  resolvedImageUrl: {
    type: String
  },

  resolutionVerification: {
    score: Number,
    remarks: String
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);