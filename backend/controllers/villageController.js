const Village = require("../models/Village");

const createVillage = async (req, res) => {
  try {
    // Superadmin direct create - created as approved by superadmin
    const village = await Village.create({ ...req.body, status: 'approved' });
    res.json(village);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Public: register a village request along with requester admin details
const registerVillage = async (req, res) => {
  try {
    const { name, district, state, pincode, latitude, longitude, requesterEmail, requesterPassword } = req.body;

    if (!name || !requesterEmail || !requesterPassword) {
      return res.status(400).json({ message: 'Missing required fields: name, requesterEmail, requesterPassword' });
    }

    // Check if document was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Document proof is required for village registration' });
    }

    // check if email already exists in Admin
    const Admin = require('../models/Admin');
    const bcrypt = require('bcryptjs');

    const existingAdmin = await Admin.findOne({ email: requesterEmail });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Requester email already registered' });
    }

    // create pending admin (will be approved when village is approved)
    const hashed = await bcrypt.hash(requesterPassword, 10);
    const newAdmin = new Admin({ email: requesterEmail, password: hashed, role: 'admin', status: 'pending' });
    await newAdmin.save();

    // create village in pending state and link requestedBy with document URL
    const village = await Village.create({ 
      name, 
      district, 
      state, 
      pincode, 
      latitude, 
      longitude, 
      documentUrl: req.file.path, // Cloudinary URL from uploaded document
      status: 'pending', 
      requestedBy: newAdmin._id 
    });

    // link admin to village (pending)
    newAdmin.village = village._id;
    await newAdmin.save();

    return res.status(201).json({ message: 'Village registration submitted', village, adminId: newAdmin._id });
  } catch (err) {
    console.error('Error registering village:', err);
    res.status(500).json({ error: err.message });
  }
};

const getVillages = async (req, res) => {
  const villages = await Village.find();
  res.json(villages);
};

const updateVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const village = await Village.findByIdAndUpdate(id, req.body, { new: true });
    if (!village) {
      return res.status(404).json({ error: "Village not found" });
    }
    res.json(village);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const village = await Village.findByIdAndDelete(id);
    if (!village) {
      return res.status(404).json({ error: "Village not found" });
    }
    res.json({ message: "Village deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Superadmin: view pending villages
const getPendingVillages = async (req, res) => {
  try {
    const pending = await Village.find({ status: 'pending' }).populate('requestedBy', 'email');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Superadmin: approve village and assign admin who requested it
const approveVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const Admin = require('../models/Admin');

    const village = await Village.findById(id);
    if (!village) return res.status(404).json({ message: 'Village not found' });
    if (village.status === 'approved') return res.status(400).json({ message: 'Village already approved' });

    village.status = 'approved';
    village.assignedAdmin = village.requestedBy || village.assignedAdmin;
    await village.save();

    if (village.requestedBy) {
      const admin = await Admin.findById(village.requestedBy);
      if (admin) {
        admin.status = 'approved';
        admin.role = 'admin';
        admin.village = village._id;
        await admin.save();
      }
    }

    res.json({ message: 'Village approved', village });
  } catch (err) {
    console.error('Error approving village:', err);
    res.status(500).json({ error: err.message });
  }
};

const rejectVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const Admin = require('../models/Admin');

    const village = await Village.findById(id);
    if (!village) return res.status(404).json({ message: 'Village not found' });

    // if there was a requesting admin, delete or mark as rejected
    if (village.requestedBy) {
      await Admin.findByIdAndDelete(village.requestedBy);
    }

    await village.deleteOne();
    res.json({ message: 'Village registration rejected and removed' });
  } catch (err) {
    console.error('Error rejecting village:', err);
    res.status(500).json({ error: err.message });
  }
};

const updateVillageCoordinates = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const village = await Village.findByIdAndUpdate(
      id, 
      { latitude, longitude }, 
      { new: true }
    );

    if (!village) {
      return res.status(404).json({ error: "Village not found" });
    }

    res.json(village);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createVillage, registerVillage, getVillages, updateVillage, deleteVillage, getPendingVillages, approveVillage, rejectVillage, updateVillageCoordinates };
