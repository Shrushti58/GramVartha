const express = require("express")
const router = express.Router();
const bycrpt = require('bcryptjs')
const Admin = require('../models/Admin')


router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const adminCount = Admin.countDocuments();
        if (adminCount > 0) {
            return res.status(403).json({ message: 'Admin already exists. Only one admin allowed.' });
        }

        const hashedpassword = await bycrpt.hash(password, 10);
        const newadmin = new Admin({ email, password: hashedpassword });
        await newadmin.save();

        return res.status(201).json({ message: 'Admin registered successfully' })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: "Incorrect email or password" })
        }

        const ismatch = await bycrpt.compare(password, admin.password);
        if (!ismatch) {
            return res.status(401).json({ message: "Incorrect email or password" })
        }

        return res.status(201).json({ message: 'Login Sucessful' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
})


module.exports = router;