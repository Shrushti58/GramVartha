const bcrypt = require("bcryptjs");
const Officials = require("../models/Officials");
const { generateToken } = require("../utlis/jwt");

const registerOfficial = async (req, res) => {
  try {
    const { name, email, password, phone, village } = req.body;

    if (!name || !email || !password || !village) {
      return res.status(400).json({
        message: "Missing required fields: name, email, password, and village are required"
      });
    }

    const exists = await Officials.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const officialData = {
      name,
      email,
      password: hashed,
      phone,
      village
    };

    // Add profile image if uploaded
    if (req.file) {
      officialData.profileImage = req.file.path;
    }

    await Officials.create(officialData);

    res.status(201).json({ message: "Registered successfully! Awaiting village admin approval." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const loginOfficial = async (req, res) => {
  try {
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

const getPendingOfficials = async (req, res) => {
  try {
    let query = { status: 'pending' };
    if (req.user.role === 'admin') {
      query.village = req.user.village;
    }
    const officials = await Officials.find(query).populate('village');
    res.status(200).json(officials);
  } catch (err) {
    console.error("Error fetching pending officials:", err);
    res.status(500).json({ message: "Error fetching pending officials" });
  }
};

const approveOfficial = async (req, res) => {
  try {
    const { id } = req.params;
    const official = await Officials.findById(id);
    if (!official) {
      return res.status(404).json({ message: "Official not found" });
    }
    if (req.user.role === 'admin' && official.village.toString() !== req.user.village.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    official.status = 'approved';
    await official.save();
    res.status(200).json({ message: "Official approved", official });
  } catch (err) {
    console.error("Error approving official:", err);
    res.status(500).json({ message: "Error approving official" });
  }
};

const rejectOfficial = async (req, res) => {
  try {
    const { id } = req.params;
    const official = await Officials.findById(id);
    if (!official) {
      return res.status(404).json({ message: "Official not found" });
    }
    if (req.user.role === 'admin' && official.village.toString() !== req.user.village.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    official.status = 'rejected';
    await official.save();
    res.status(200).json({ message: "Official rejected", official });
  } catch (err) {
    console.error("Error rejecting official:", err);
    res.status(500).json({ message: "Error rejecting official" });
  }
};

const getAllOfficials = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      query.village = req.user.village;
    }
    const officials = await Officials.find(query).select("-password").populate('village');
    res.status(200).json(officials);
  } catch (err) {
    console.error("Error fetching officials:", err);
    res.status(500).json({ message: "Error fetching officials" });
  }
};

const deleteOfficial = async (req, res) => {
  try {
    const { id } = req.params;
    const official = await Officials.findById(id);
    if (!official) {
      return res.status(404).json({ message: "Official not found" });
    }
    if (req.user.role === 'admin' && official.village.toString() !== req.user.village.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    await Officials.findByIdAndDelete(id);
    res.status(200).json({ message: "Official deleted" });
  } catch (err) {
    console.error("Error deleting official:", err);
    res.status(500).json({ message: "Error deleting official" });
  }
};

// Profile management functions
const getOfficialProfile = async (req, res) => {
  try {
    const official = await Officials.findById(req.user.id)
      .populate('village', 'name district state')
      .select('-password');

    if (!official) {
      return res.status(404).json({ message: "Official not found" });
    }

    res.status(200).json(official);
  } catch (error) {
    console.error("Error fetching official profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const official = await Officials.findByIdAndUpdate(
      req.user.id,
      { profileImage: req.file.path },
      { new: true }
    ).select('-password');

    if (!official) {
      return res.status(404).json({ message: "Official not found" });
    }

    res.status(200).json({
      message: "Profile image uploaded successfully",
      profileImage: req.file.path,
      official
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ message: "Error uploading image" });
  }
};

module.exports = {
  registerOfficial,
  loginOfficial,
  logoutOfficial,
  getCurrentOfficial,
  getPendingOfficials,
  approveOfficial,
  rejectOfficial,
  getAllOfficials,
  deleteOfficial,
  getOfficialProfile,
  uploadProfileImage
};