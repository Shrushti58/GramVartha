const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const villageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  district: String,
  state: String,
  pincode: String,
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  documentUrl: { type: String }, 
  status: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending"
  },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  
  qrCode: {
    uniqueId: {
      type: String,
      unique: true,
      sparse: true,
      default: () => uuidv4()
    },
    imageUrl: { type: String }, 
    generatedAt: { type: Date }
  }
}, { timestamps: true });

villageSchema.index({ name: 1, district: 1, state: 1, pincode: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Village", villageSchema);