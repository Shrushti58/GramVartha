const express = require("express")
const router = express.Router();
const bycrpt = require('bcryptjs')
const Admin = require('../models/Admin')
const Officals = require('../models/Officals')

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

router.get('/pending-officials', async (req, res) => {
    try {
        const pendingOfficials = await Officals.find({ status: "pending" }).select("-password");
        res.json(pendingOfficials);
    } catch (err) {
        console.error("Error fetching pending officials:", err);
        res.status(500).json({ message: "Error fetching pending officials" });
    }
})

// ✅ Approve an official
router.put("/approve/:id", async (req, res) => {
  try {
    const official = await Officals.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!official) return res.status(404).json({ message: "Official not found" });

    res.json({ message: "Official approved", official });
  } catch (err) {
    res.status(500).json({ message: "Error approving official" });
  }
});


router.put("/reject/:id", async (req, res) => {
  try {
    const official = await Officals.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!official) return res.status(404).json({ message: "Official not found" });

    res.json({ message: "Official rejected", official });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting official" });
  }
});

module.exports = router;