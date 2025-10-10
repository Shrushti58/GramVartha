const express = require("express");
const bcrypt = require("bcryptjs");
const Citizen = require('../models/Citizen')
const upload = require("../middlewares/uploadCloud"); 
const { generateToken } = require("../utlis/jwt");

const router = express.Router();

router.post("/register", upload.single("avatar"), async (req, res) => {
  try {
    const { name, email, password, profile, address } = req.body;

    // Check if citizen already exists
    const existing = await Citizen.findOne({ email });
    if (existing) return res.status(400).json({ message: "Citizen already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    let avatarUrl = "";
    if (req.file) {
      avatarUrl = req.file.path; 
    }

    const citizen = await Citizen.create({
      name,
      email,
      password: hashedPassword,
      profile: { ...JSON.parse(profile || "{}"), avatar: avatarUrl }, 
      address: JSON.parse(address || "{}"), 
    });

    const token = generateToken(citizen);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .status(201)
      .json({
        _id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        profile: citizen.profile,
        address: citizen.address,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if citizen exists
    const citizen = await Citizen.findOne({ email });
    if (!citizen) return res.status(400).json({ message: "Invalid email or password" });

    // Compare password
    const isMatch = await bcrypt.compare(password, citizen.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT token
    const token = generateToken(citizen);

    // Send cookie + response
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .status(200)
      .json({
        _id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        profile: citizen.profile,
        address: citizen.address,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
