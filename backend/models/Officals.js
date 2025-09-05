const moongose = require('mongoose')

const OfficalsSchema = new moongose.Schema({

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
})

module.exports=moongose.model('Officals',OfficalsSchema);