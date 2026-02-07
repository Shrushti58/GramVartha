const bcrypt = require("bcryptjs");
const Citizen = require('../models/Citizen');
const { generateToken } = require("../utlis/jwt");

const registerCitizen = async (req, res) => {
  try {
    const { name, email, password, profile, address } = req.body;

    const existing = await Citizen.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Citizen already exists" });
    }

    if (!name || !email || !password || !address.wardNumber) {
      return res.status(400).json({ 
        message: "Missing required fields: name, email, password, and wardNumber are required" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const citizen = await Citizen.create({
      name,
      email,
      password: hashedPassword,
      profile: profile || {},
      address: address || {},
    });

    const token = generateToken(citizen);

    res.cookie("token", token, {
            httpOnly: true,
            secure: false,       
            sameSite: "lax",     
            maxAge: 24 * 60 * 60 * 1000
        })
      .status(201)
      .json({
        _id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        profile: citizen.profile,
        address: citizen.address,
        token 
      });
  } catch (err) {
    console.error("Registration error:", err);
    
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    
    res.status(500).json({ message: "Server error during registration" });
  }
};

const loginCitizen = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const citizen = await Citizen.findOne({ email });
    if (!citizen) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (citizen.status !== "active") {
      return res.status(400).json({ message: "Account is not active. Please contact support." });
    }

    const isMatch = await bcrypt.compare(password, citizen.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    citizen.lastLogin = new Date();
    await citizen.save();

    const token = generateToken(citizen);

   res.cookie("token", token, {
            httpOnly: true,
            secure: false,       
            sameSite: "lax",     
            maxAge: 24 * 60 * 60 * 1000
        })
      .status(200)
      .json({
        _id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        profile: citizen.profile,
        address: citizen.address,
        token 
      });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

const logoutCitizen = (req, res) => {
 res.clearCookie("token", {
        httpOnly: true,
        secure: false,      
        sameSite: "lax",
    })
    .status(200)
    .json({ message: "Logged out successfully" });
};


const getCitizenProfile = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.user.id)
      .select('-password -refreshToken'); 

    if (!citizen) {
      return res.status(404).json({ message: "Citizen not found" });
    }

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
      
    };

    res.json(profileData);
  } catch (error) {
    console.error("Error fetching citizen profile:", error);
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

module.exports = {
  registerCitizen,
  loginCitizen,
  logoutCitizen,
  getCitizenProfile
};