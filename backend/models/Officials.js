const mongoose = require("mongoose");

const OfficalsSchema = new mongoose.Schema({

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    village: { type: mongoose.Schema.Types.ObjectId, ref: "Village", required: true }

})

module.exports=mongoose.model('Officals',OfficalsSchema);