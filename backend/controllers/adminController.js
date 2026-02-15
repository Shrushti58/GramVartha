const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Officals = require('../models/Officials');
const Citizens = require('../models/Citizen');
const { generateToken } = require("../utlis/jwt");

const registerAdmin = async (req, res) => {
    try {
        const { email, password, village } = req.body;
        
        const adminCount = await Admin.countDocuments();
        
        let role = 'admin';
        let status = 'pending';
        
        if (!village) {
            // Requesting to be superadmin
            if (adminCount > 0) {
                return res.status(403).json({ message: 'Superadmin already exists.' });
            }
            role = 'superadmin';
            status = 'approved';
        } else {
            // Requesting to be admin of a village
            // Allow multiple pending requests
        }

        const hashedpassword = await bcrypt.hash(password, 10);
        
        const newadmin = new Admin({ email, password: hashedpassword, role, status, village });
        await newadmin.save();

        return res.status(201).json({ message: `${role} registered successfully`, status });

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

        if (admin.status !== 'approved') {
            return res.status(403).json({ message: "Account not approved yet." });
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


const getPendingAdmins = async (req, res) => {
    try {
        const pendingAdmins = await Admin.find({ status: 'pending' }).populate('village');
        res.status(200).json(pendingAdmins);
    } catch (err) {
        console.error("Error fetching pending admins:", err);
        res.status(500).json({ message: "Error fetching pending admins" });
    }
};

const approveAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json({ message: "Admin approved", admin });
    } catch (err) {
        console.error("Error approving admin:", err);
        res.status(500).json({ message: "Error approving admin" });
    }
};

const rejectAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findByIdAndDelete(id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json({ message: "Admin rejected and removed" });
    } catch (err) {
        console.error("Error rejecting admin:", err);
        res.status(500).json({ message: "Error rejecting admin" });
    }
};

const getAdminMe = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).populate('village').select("-password");
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json(admin);
    } catch (err) {
        console.error("Error fetching admin profile:", err);
        res.status(500).json({ message: "Error fetching admin profile" });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    deleteCitizen,
    deleteOfficial,
    getAllCitizens,
    getPendingAdmins,
    approveAdmin,
    rejectAdmin,
    getAdminMe
};