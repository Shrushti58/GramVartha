const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
    village: { type: mongoose.Schema.Types.ObjectId, ref: "Village" }

})

module.exports = mongoose.model("Admin", AdminSchema);