const bcrypt = require("bcryptjs");
const Citizens = require("../models/Citizens");
const { generateToken } = require("../utlis/jwt");

const registerCitizen = async (req, res) => {
  try {
    const { name, phone, password, village } = req.body;

    if (!name || !phone || !password || !village) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const exists = await Citizens.findOne({ phone });

    if (exists) {
      return res.status(400).json({
        message: "Citizen already registered"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const citizen = await Citizens.create({
      name,
      phone,
      password: hashed,
      village
    });

    const token = generateToken(citizen);

    res.status(201).json({
      message: "Citizen registered successfully",
      token,
      citizen: {
        id: citizen._id,
        name: citizen.name,
        village: citizen.village
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Registration failed" });
  }
};

const loginCitizen = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const citizen = await Citizens.findOne({ phone });

    if (!citizen) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, citizen.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = generateToken(citizen);
    res.cookie("token", token, {
  httpOnly: true,
  secure: true,          
  sameSite: "none",      
  maxAge: 24 * 60 * 60 * 1000
});

    res.json({
      message: "Login successful",
      token,
      citizen: {
        id: citizen._id,
        name: citizen.name,
        village: citizen.village
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

const registerPushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({
        message: "Push token is required"
      });
    }

    const citizen = await Citizens.findById(req.user.id);

    if (!citizen) {
      return res.status(404).json({
        message: "Citizen not found"
      });
    }

    // Add push token if not already present
    if (!citizen.pushTokens.includes(pushToken)) {
      citizen.pushTokens.push(pushToken);
      await citizen.save();
      console.log(`📱 Push token registered for citizen ${citizen._id}`);
    }

    res.json({
      message: "Push token registered successfully",
      tokensCount: citizen.pushTokens.length
    });

  } catch (error) {
    console.error("Error registering push token:", error);
    res.status(500).json({ message: "Failed to register push token" });
  }
};

module.exports = {
  registerCitizen,
  loginCitizen,
  registerPushToken
};