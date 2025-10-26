const mongoose = require("mongoose");

const citizenSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  profile: {
    phone: { 
      type: String, 
      default: "",
      trim: true
    },
    avatar: { 
      type: String, 
      default: "" 
    }
  },
  address: {
    street: { 
      type: String, 
      default: "",
      trim: true
    },
    wardNumber: { 
      type: String, 
      required: true,
      trim: true
    },
    city: { 
      type: String, 
      default: "",
      trim: true
    },
    state: { 
      type: String, 
      default: "",
      trim: true
    },
    pincode: { 
      type: String, 
      default: "",
      trim: true
    }
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for better query performance
citizenSchema.index({ "address.wardNumber": 1 });
citizenSchema.index({ email: 1 });

// Method to get public profile (without sensitive data)
citizenSchema.methods.getPublicProfile = function() {
  const citizen = this.toObject();
  delete citizen.password;
  return citizen;
};

// Static method to find by ward
citizenSchema.statics.findByWard = function(wardNumber) {
  return this.find({ "address.wardNumber": wardNumber, status: "active" });
};

// Virtual for full address
citizenSchema.virtual('fullAddress').get(function() {
  const address = this.address;
  const parts = [
    address.street,
    `Ward ${address.wardNumber}`,
    address.city,
    address.state,
    address.pincode
  ].filter(part => part && part.trim() !== '');
  
  return parts.join(', ');
});

module.exports = mongoose.model("Citizen", citizenSchema);