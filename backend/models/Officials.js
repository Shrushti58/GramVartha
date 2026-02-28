const mongoose = require("mongoose");

const OfficalsSchema = new mongoose.Schema({

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    profileImage: { type: String, required: true }, // Cloudinary URL for profile photo - required for verification
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    village: { type: mongoose.Schema.Types.ObjectId, ref: "Village", required: true }

}, { timestamps: true })

module.exports=mongoose.model('Officals',OfficalsSchema);