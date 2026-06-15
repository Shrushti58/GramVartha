const mongoose = require("mongoose");
const schemeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  slug: {
    type: String,
    required: true,
    unique: true, 
  },

  description: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
  },

  category: [
    {
      type: String,
    }
  ],

  level: {
    type: String, 
  },

  eligibility: {
    type: String,
  },

  documents: [
    {
      type: String,
    }
  ],

  applicationSteps: [
    {
      type: String,
    }
  ],

  tags: [
    {
      type: String,
    }
  ],

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },

  region: {
    type: String, 
  },

}, { timestamps: true });

module.exports = mongoose.model("Scheme", schemeSchema);