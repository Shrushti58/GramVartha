const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Officals = require('../models/Officials');
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
  secure: true,          
  sameSite: "none",      
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

// Get all admins (with role-based filtering)
const getAllAdmins = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'admin') {
            // Village admin can only see admins from their village
            query.village = req.user.village;
        }
        // Superadmin can see all admins

        const admins = await Admin.find(query).populate('village').select("-password");
        res.status(200).json(admins);
    } catch (err) {
        console.error("Error fetching admins:", err);
        res.status(500).json({ message: "Error fetching admins" });
    }
};

// Edit admin
const editAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, village, status } = req.body;

        const adminToEdit = await Admin.findById(id);
        if (!adminToEdit) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Permission checks
        if (req.user.role === 'admin') {
            // Village admin can only edit admins from their village
            if (adminToEdit.village.toString() !== req.user.village.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }
            // Village admin cannot change status or village
            if (status !== undefined || village !== undefined) {
                return res.status(403).json({ message: "Cannot change status or village" });
            }
        }

        // Prevent superadmin from being demoted
        if (adminToEdit.role === 'superadmin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ message: "Cannot modify superadmin" });
        }

        const updateData = {};
        if (email !== undefined) updateData.email = email;
        if (village !== undefined && req.user.role === 'superadmin') updateData.village = village;
        if (status !== undefined && req.user.role === 'superadmin') updateData.status = status;

        const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, { new: true }).populate('village').select("-password");
        res.status(200).json({ message: "Admin updated successfully", admin: updatedAdmin });
    } catch (err) {
        console.error("Error editing admin:", err);
        res.status(500).json({ message: "Error editing admin" });
    }
};

// Delete admin
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const adminToDelete = await Admin.findById(id);
        if (!adminToDelete) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Permission checks
        if (req.user.role === 'admin') {
            // Village admin can only delete admins from their village
            if (adminToDelete.village.toString() !== req.user.village.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        // Prevent superadmin from being deleted
        if (adminToDelete.role === 'superadmin') {
            return res.status(403).json({ message: "Cannot delete superadmin" });
        }

        // Prevent self-deletion
        if (adminToDelete._id.toString() === req.user.id) {
            return res.status(403).json({ message: "Cannot delete your own account" });
        }

        await Admin.findByIdAndDelete(id);
        res.status(200).json({ message: "Admin deleted successfully" });
    } catch (err) {
        console.error("Error deleting admin:", err);
        res.status(500).json({ message: "Error deleting admin" });
    }
};

// Get all officials (with role-based filtering)
const getAllOfficials = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'admin') {
            // Village admin can only see officials from their village
            query.village = req.user.village;
        }
        // Superadmin can see all officials

        const officials = await Officals.find(query).populate('village').select("-password");
        res.status(200).json(officials);
    } catch (err) {
        console.error("Error fetching officials:", err);
        res.status(500).json({ message: "Error fetching officials" });
    }
};

// Edit official
const editOfficial = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, village, status } = req.body;

        const officialToEdit = await Officals.findById(id);
        if (!officialToEdit) {
            return res.status(404).json({ message: "Official not found" });
        }

        // Permission checks
        if (req.user.role === 'admin') {
            // Village admin can only edit officials from their village
            if (officialToEdit.village.toString() !== req.user.village.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (village !== undefined && req.user.role === 'superadmin') updateData.village = village;
        if (status !== undefined) updateData.status = status;

        const updatedOfficial = await Officals.findByIdAndUpdate(id, updateData, { new: true }).populate('village').select("-password");
        res.status(200).json({ message: "Official updated successfully", official: updatedOfficial });
    } catch (err) {
        console.error("Error editing official:", err);
        res.status(500).json({ message: "Error editing official" });
    }
};

// Delete official (keeping the existing one but adding permission checks)
const deleteOfficialWithPermissions = async (req, res) => {
    try {
        const { id } = req.params;

        const officialToDelete = await Officals.findById(id);
        if (!officialToDelete) {
            return res.status(404).json({ message: "Official not found" });
        }

        // Permission checks
        if (req.user.role === 'admin') {
            // Village admin can only delete officials from their village
            if (officialToDelete.village.toString() !== req.user.village.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        await Officals.findByIdAndDelete(id);
        res.status(200).json({ message: "Official deleted successfully" });
    } catch (err) {
        console.error("Error deleting official:", err);
        res.status(500).json({ message: "Error deleting official" });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    deleteOfficial,
    getPendingAdmins,
    approveAdmin,
    rejectAdmin,
    getAdminMe,
    getAllAdmins,
    editAdmin,
    deleteAdmin,
    getAllOfficials,
    editOfficial,
    deleteOfficialWithPermissions
};