const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
    email: { type: String, unique: true, requried: true },
    password: { type: String, requried: true }
})

module.exports = mongoose.model("Admin", AdminSchema);