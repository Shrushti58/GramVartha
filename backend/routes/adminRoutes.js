const express = require("express")
const router = express.Router();
const bcrypt = require('bcryptjs')
const Admin = require('../models/Admin')
const Officals = require('../models/Officals')
const { generateToken, verifyToken } = require("../utlis/jwt");;
const Citizens=require('../models/Citizen')

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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    // Generate JWT token
    const token = generateToken(admin);

  res.cookie("token", token, {
  httpOnly: true,
  secure: false,       // dev: no HTTPS
  sameSite: "lax",     // allows cross-origin requests from different port
  maxAge: 24 * 60 * 60 * 1000
});



    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/pending-officials',async (req, res) => {
    try {
        const pendingOfficials = await Officals.find({ status: "pending" }).select("-password");
        res.json(pendingOfficials);
    } catch (err) {
        console.error("Error fetching pending officials:", err);
        res.status(500).json({ message: "Error fetching pending officials" });
    }
})


router.put("/approve/:id",async (req, res) => {
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

router.delete("/citizen/:id",async (req, res) => {
  try {
    const deletedCitizen = await Citizens.findByIdAndDelete(req.params.id);
    if (!deletedCitizen) {
      return res.status(404).json({ message: "Citizen not found" });
    }
    res.json({ message: "Citizen deleted successfully", deletedCitizen });
  } catch (err) {
    console.error("Error deleting citizen:", err);
    res.status(500).json({ message: "Error deleting citizen" });
  }
});

router.delete("/official/:id",async (req, res) => {
  try {
    const deletedOfficial = await Officals.findByIdAndDelete(req.params.id);
    if (!deletedOfficial) {
      return res.status(404).json({ message: "Official not found" });
    }
    res.json({ message: "Official deleted successfully", deletedOfficial });
  } catch (err) {
    console.error("Error deleting official:", err);
    res.status(500).json({ message: "Error deleting official" });
  }
});


router.put("/reject/:id",async (req, res) => {
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

// Route to get all citizens
router.get('/all-citizens',async (req, res) => {
  try {
    const citizens = await Citizens.find().select("-password"); // Exclude passwords
    res.status(200).json(citizens);
  } catch (err) {
    console.error("Error fetching citizens:", err);
    res.status(500).json({ message: "Error fetching citizens" });
  }
});

// Route to get all officials
router.get('/all-officials',async (req, res) => {
  try {
    const officials = await Officals.find().select("-password"); // Exclude passwords
    res.status(200).json(officials);
  } catch (err) {
    console.error("Error fetching officials:", err);
    res.status(500).json({ message: "Error fetching officials" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,       // set to true in production (HTTPS)
    sameSite: "lax",
  });
  return res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;