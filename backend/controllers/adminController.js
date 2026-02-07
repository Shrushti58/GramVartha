const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Officals = require('../models/Officials');
const Citizens = require('../models/Citizen');
const { generateToken } = require("../utlis/jwt");

const registerAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            return res.status(403).json({ message: 'Admin already exists. Only one admin allowed.' });
        }

        const hashedpassword = await bcrypt.hash(password, 10);
        
        const newadmin = new Admin({ email, password: hashedpassword });
        await newadmin.save();

        return res.status(201).json({ message: 'Admin registered successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: "Incorrect email or password." });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect email or password." });
        }
        const token = generateToken(admin);
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,       
            sameSite: "lax",     
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const logoutAdmin = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,      
        sameSite: "lax",
    });
    return res.status(200).json({ message: "Logged out successfully" });
};

const getPendingOfficials = async (req, res) => {
    try {
        const pendingOfficials = await Officals.find({ status: "pending" }).select("-password");
        res.json(pendingOfficials);
    } catch (err) {
        console.error("Error fetching pending officials:", err);
        res.status(500).json({ message: "Error fetching pending officials" });
    }
};

const approveOfficial = async (req, res) => {
    try {
        const official = await Officals.findByIdAndUpdate(
            req.params.id,
            { status: "approved" },
            { new: true }
        );

        if (!official) {
            return res.status(404).json({ message: "Official not found" });
        }

        res.json({ message: "Official approved", official });
    } catch (err) {
        console.error("Error approving official:", err);
        res.status(500).json({ message: "Error approving official" });
    }
};

const rejectOfficial = async (req, res) => {
    try {
        const official = await Officals.findByIdAndUpdate(
            req.params.id,
            { status: "rejected" },
            { new: true }
        );

        if (!official) {
            return res.status(404).json({ message: "Official not found" });
        }

        res.json({ message: "Official rejected", official });
    } catch (err) {
        console.error("Error rejecting official:", err);
        res.status(500).json({ message: "Error rejecting official" });
    }
};

const deleteCitizen = async (req, res) => {
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
};

const deleteOfficial = async (req, res) => {
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
};

const getAllCitizens = async (req, res) => {
    try {
        const citizens = await Citizens.find().select("-password"); 
        res.status(200).json(citizens);
    } catch (err) {
        console.error("Error fetching citizens:", err);
        res.status(500).json({ message: "Error fetching citizens" });
    }
};


const getAllOfficials = async (req, res) => {
    try {
        const officials = await Officals.find().select("-password"); 
        res.status(200).json(officials);
    } catch (err) {
        console.error("Error fetching officials:", err);
        res.status(500).json({ message: "Error fetching officials" });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    getPendingOfficials,
    approveOfficial,
    rejectOfficial,
    deleteCitizen,
    deleteOfficial,
    getAllCitizens,
    getAllOfficials
};