const express = require("express");
const bcrypt = require("bcryptjs");
const { generateToken, verifyToken } = require("../utlis/jwt");
const Officials = require("../models/Officals");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const exists = await Officials.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    await Officials.create({ name, email, password: hashed, phone });

    res.status(201).json({ message: "Registered! Await admin approval." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const official = await Officials.findOne({ email });
    if (!official) return res.status(400).json({ message: "Invalid email or password" });

    if (official.status !== "approved") {
      return res.status(403).json({ message: `Your account is ${official.status}.` });
    }

    const ok = await bcrypt.compare(password, official.password);
    if (!ok) return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(official);

    // send JWT in httpOnly cookie
   res.cookie("token", token, {
  httpOnly: true,
  sameSite: "lax", // or "strict"
  secure: false,   // true only if using HTTPS
  maxAge: 24 * 60 * 60 * 1000,
});


    res.json({
      message: "Login successful",
      official: { id: official._id, name: official.name, email: official.email },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
  sameSite: "lax", // or "strict"
  secure: false,   // true only if using HTTPS
  maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ message: "Logged out successfully" });
});


/** Who am I (protected) */
router.get("/me", verifyToken, async (req, res) => {
  const me = await Officials.findById(req.user.id).select("-password");
  res.json(me);
});

module.exports = router;
