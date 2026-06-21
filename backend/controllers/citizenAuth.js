const bcrypt = require("bcryptjs");
const Citizens = require("../models/Citizens");
const Complaint = require("../models/Complaint");
const Village = require("../models/Village");
const { generateToken } = require("../utlis/jwt");
const { tokenCookieOptions } = require("../utlis/cookieOptions");

function isExpoPushToken(token) {
  return /^Expo(nent)?PushToken\[[\w-]+\]$/.test(token);
}

const registerCitizen = async (req, res) => {
  try {
    const { name, phone, password, village } = req.body;

    if (!name || !phone || !password || !village) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingVillage = await Village.findOne({
      _id: village,
      status: "approved"
    });

    if (!existingVillage) {
      return res.status(400).json({
        message: "Selected village does not exist or is not approved"
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
    const { phone, password, village } = req.body;

    if (!village) {
      return res.status(400).json({
        message: "Village is required. Please scan a valid village QR code."
      });
    }

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

    if (citizen.village.toString() !== village.toString()) {
      return res.status(403).json({
        message: "This account is not registered for the scanned village"
      });
    }

    const existingVillage = await Village.findOne({
      _id: citizen.village,
      status: "approved"
    });

    if (!existingVillage) {
      return res.status(403).json({
        message: "Registered village does not exist or is not approved"
      });
    }

    const token = generateToken(citizen);
    res.cookie("token", token, tokenCookieOptions);

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

    if (!isExpoPushToken(pushToken)) {
      return res.status(400).json({
        message: "A valid Expo push token is required"
      });
    }

    const citizen = await Citizens.findById(req.user.id);

    if (!citizen) {
      return res.status(404).json({
        message: "Citizen not found"
      });
    }

    await Citizens.updateOne(
      { _id: citizen._id },
      { $addToSet: { pushTokens: pushToken } }
    );

    res.json({
      message: "Push token registered successfully",
      tokensCount: citizen.pushTokens.includes(pushToken)
        ? citizen.pushTokens.length
        : citizen.pushTokens.length + 1
    });
  } catch (error) {
    console.error("Error registering push token:", error);
    res.status(500).json({ message: "Failed to register push token" });
  }
};

const unregisterPushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({
        message: "Push token is required"
      });
    }

    await Citizens.updateOne(
      { _id: req.user.id },
      { $pull: { pushTokens: pushToken } }
    );

    res.json({
      message: "Push token unregistered successfully"
    });
  } catch (error) {
    console.error("Error unregistering push token:", error);
    res.status(500).json({ message: "Failed to unregister push token" });
  }
};

const deleteCitizenAccount = async (req, res) => {
  try {
    const citizen = await Citizens.findById(req.user.id);

    if (!citizen) {
      return res.status(404).json({
        message: "Citizen not found"
      });
    }

    await Complaint.deleteMany({ citizen: citizen._id });
    await Citizens.deleteOne({ _id: citizen._id });

    res.clearCookie("token");
    res.json({
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting citizen account:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

module.exports = {
  registerCitizen,
  loginCitizen,
  registerPushToken,
  unregisterPushToken,
  deleteCitizenAccount
};
