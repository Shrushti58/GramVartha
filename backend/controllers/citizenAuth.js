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

module.exports = {
  registerCitizen,
  loginCitizen
};