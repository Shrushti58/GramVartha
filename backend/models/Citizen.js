const mongoose = require("mongoose");

const citizenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
  },
  address: {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip: { type: String, default: "" },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Citizen", citizenSchema);
