const bcrypt = require("bcryptjs");
const Officials = require("../models/Officials");
const { generateToken } = require("../utlis/jwt");

const registerOfficial = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Missing required fields: name, email, and password are required" 
      });
    }

    const exists = await Officials.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    await Officials.create({ 
      name, 
      email, 
      password: hashed, 
      phone 
    });

    res.status(201).json({ message: "Registered successfully! Awaiting admin approval." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const loginOfficial = async (req, res) => {
  try {
    console.log("🔹 /login route hit:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const official = await Officials.findOne({ email });
    if (!official) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    
    if (official.status !== "approved") {
      return res.status(403).json({ 
        message: `Your account is ${official.status}. Please contact admin.` 
      });
    }

    const isMatch = await bcrypt.compare(password, official.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(official);
    console.log("Generated token:", token);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,       
      sameSite: "lax",     
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login successful",
      official: { 
        id: official._id, 
        name: official.name, 
        email: official.email,
        phone: official.phone,
        status: official.status
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

const logoutOfficial = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,       
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

const getCurrentOfficial = async (req, res) => {
  try {
    const official = await Officials.findById(req.user.id).select("-password");
    
    if (!official) {
      return res.status(404).json({ message: "Official not found" });
    }

    res.json(official);
  } catch (error) {
    console.error("Error fetching official profile:", error);
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

module.exports = {
  registerOfficial,
  loginOfficial,
  logoutOfficial,
  getCurrentOfficial
};