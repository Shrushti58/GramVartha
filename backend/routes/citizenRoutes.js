const express = require("express");
const bcrypt = require("bcryptjs");
const Citizen = require('../models/Citizen')
const upload = require("../middlewares/uploadCloud"); 
const { generateToken, verifyToken } = require("../utlis/jwt");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, profile, address } = req.body;

    // Check if citizen already exists
    const existing = await Citizen.findOne({ email });
    if (existing) return res.status(400).json({ message: "Citizen already exists" });

    // Validate required fields
    if (!name || !email || !password || !address.wardNumber) {
      return res.status(400).json({ 
        message: "Missing required fields: name, email, password, and wardNumber are required" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create citizen with simplified structure
    const citizen = await Citizen.create({
      name,
      email,
      password: hashedPassword,
      profile: profile || {},
      address: address || {},
    });

    // Generate JWT token
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
        token // Also send token in response for frontend storage if needed
      });
  } catch (err) {
    console.error("Registration error:", err);
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    res.status(500).json({ message: "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if citizen exists
    const citizen = await Citizen.findOne({ email });
    if (!citizen) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if account is active
    if (citizen.status !== "active") {
      return res.status(400).json({ message: "Account is not active. Please contact support." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, citizen.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Update last login
    citizen.lastLogin = new Date();
    await citizen.save();

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
        token // Also send token in response
      });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Add logout route
router.post("/logout", (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(200)
    .json({ message: "Logged out successfully" });
});

// GET /api/citizen/profile - Get citizen profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.user.id)
      .select('-password -refreshToken') // Exclude sensitive fields

    if (!citizen) {
      return res.status(404).json({ message: "Citizen not found" });
    }

    // Format the response to match what the dashboard expects
    const profileData = {
      id: citizen._id,
      name: citizen.name || citizen.user?.name,
      email: citizen.email || citizen.user?.email,
      phone: citizen.phone || citizen.user?.phone,
      address: {
        wardNumber: citizen.address.wardNumber,
        houseNumber: citizen.address.houseNumber,
        street: citizen.address.street,
        village: citizen.address.village,
        pincode: citizen.address.pincode
      },
      joinDate: citizen.createdAt || citizen.joinDate,
      // Add any other relevant fields
    };

    res.json(profileData);
  } catch (error) {
    console.error("Error fetching citizen profile:", error);
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
});

module.exports = router;
