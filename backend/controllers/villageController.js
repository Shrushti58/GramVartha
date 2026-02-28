const Village = require("../models/Village");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;

const createVillage = async (req, res) => {
  try {
    const { name, latitude, longitude, district, state, pincode } = req.body;
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Name and coordinates are required' });
    }
    // prevent duplicates as well
    const existing = await Village.findOne({ name, district, state, pincode });
    if (existing) {
      return res.status(400).json({ message: 'Village already exists' });
    }

    // Superadmin direct create - created as approved by superadmin
    const village = await Village.create({ ...req.body, status: 'approved' });
    res.json(village);
  } catch (err) {
    console.error('Error creating village:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Village already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Public: register a village request along with requester admin details
const registerVillage = async (req, res) => {
  try {
    const { name, district, state, pincode, latitude, longitude, requesterEmail, requesterPassword } = req.body;

    // basic required fields
    if (!name || !requesterEmail || !requesterPassword || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Missing required fields: name, requesterEmail, requesterPassword, latitude and longitude are required' });
    }

    // verify numeric coordinates
    if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      return res.status(400).json({ message: 'Invalid coordinates provided' });
    }

    // prevent duplicate village entries (same name/district/state/pincode)
    const existingVillage = await Village.findOne({ name, district, state, pincode });
    if (existingVillage) {
      return res.status(400).json({ message: 'A village with this name/address is already registered' });
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
      latitude: parseFloat(latitude), 
      longitude: parseFloat(longitude), 
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
    if (err.code === 11000) {
      // duplicate key error
      return res.status(400).json({ message: 'Village registration already exists' });
    }
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

// Get QR code for a village (Citizens can scan this)
const getVillageQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    let village = await Village.findById(id);
    
    if (!village) {
      return res.status(404).json({ error: "Village not found" });
    }

    if (!village.qrCode.uniqueId) {
      return res.status(400).json({ error: "QR code not yet generated for this village" });
    }

    // Auto-generate QR code image if it doesn't exist
    if (!village.qrCode.imageUrl) {
      try {
        const qrCodeDataUri = await QRCode.toDataURL(village.qrCode.uniqueId, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        const base64Data = qrCodeDataUri.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        const uploadResponse = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'gramvartha/qr-codes',
              public_id: `qr_${village._id}_${village.qrCode.uniqueId.substring(0, 8)}`,
              format: 'png',
              resource_type: 'image'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(buffer);
        });

        village.qrCode.imageUrl = uploadResponse.secure_url;
        village.qrCode.generatedAt = new Date();
        await village.save();
      } catch (qrErr) {
        console.error('QR code auto-generation failed:', qrErr);
        // Continue anyway - just return without image URL
      }
    }

    res.json({
      message: "Village QR code retrieved",
      village: {
        _id: village._id,
        name: village.name,
        qrCode: village.qrCode
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get village info by QR code unique ID (used when citizen scans QR)
const getVillageByQRCode = async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    
    console.log('Getting village by QR code:', qrCodeId);
    
    // Find village by QR code unique ID
    const village = await Village.findOne({ "qrCode.uniqueId": qrCodeId });
    
    console.log('Village found:', village ? 'Yes' : 'No');
    
    if (!village) {
      console.log('Village not found with QR code ID:', qrCodeId);
      return res.status(404).json({ error: "Village not found with this QR code" });
    }

    res.json({
      message: "Village found",
      village: {
        _id: village._id,
        name: village.name,
        district: village.district,
        state: village.state,
        pincode: village.pincode,
        latitude: village.latitude,
        longitude: village.longitude,
        status: village.status
      }
    });
  } catch (err) {
    console.error('Error in getVillageByQRCode:', err);
    res.status(500).json({ error: err.message });
  }
};

// Generate and download QR code for a village
const generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const village = await Village.findById(id);
    
    if (!village) {
      return res.status(404).json({ error: "Village not found" });
    }

    // Permission: superadmin OR user linked to same village (admins/officials)
    if (req.user && req.user.role !== 'superadmin') {
      try {
        // req.user.village may be an ObjectId string
        if (!req.user.village || req.user.village.toString() !== village._id.toString()) {
          return res.status(403).json({ message: 'Access denied. You are not authorized to generate QR for this village.' });
        }
      } catch (permErr) {
        return res.status(403).json({ message: 'Access denied.' });
      }
    }

    // If QR code image already exists, return it
    if (village.qrCode.imageUrl) {
      return res.json({
        message: "QR code already generated",
        village: {
          _id: village._id,
          name: village.name,
          qrCode: village.qrCode
        }
      });
    }

    // Generate QR code image from uniqueId
    const qrCodeDataUri = await QRCode.toDataURL(village.qrCode.uniqueId, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Convert data URI to buffer
    const base64Data = qrCodeDataUri.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'gramvartha/qr-codes',
          public_id: `qr_${village._id}_${village.qrCode.uniqueId.substring(0, 8)}`,
          format: 'png',
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    // Update village with QR code image URL
    village.qrCode.imageUrl = uploadResponse.secure_url;
    village.qrCode.generatedAt = new Date();
    await village.save();

    res.json({
      message: "QR code generated successfully",
      village: {
        _id: village._id,
        name: village.name,
        qrCode: village.qrCode,
        downloadUrl: uploadResponse.secure_url
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Download QR code image for a village
const downloadQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const village = await Village.findById(id);
    
    if (!village) {
      return res.status(404).json({ error: "Village not found" });
    }

    // Permission: superadmin OR user linked to same village
    if (req.user && req.user.role !== 'superadmin') {
      try {
        if (!req.user.village || req.user.village.toString() !== village._id.toString()) {
          return res.status(403).json({ message: 'Access denied. You are not authorized to download QR for this village.' });
        }
      } catch (permErr) {
        return res.status(403).json({ message: 'Access denied.' });
      }
    }

    if (!village.qrCode.imageUrl) {
      return res.status(400).json({ error: "QR code has not been generated yet. Call /generate first." });
    }

    // Since we're storing in Cloudinary, we redirect to the image
    res.json({
      message: "QR code image URL",
      village: {
        _id: village._id,
        name: village.name,
        qrCode: {
          uniqueId: village.qrCode.uniqueId,
          imageUrl: village.qrCode.imageUrl,
          generatedAt: village.qrCode.generatedAt
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createVillage, registerVillage, getVillages, updateVillage, deleteVillage, getPendingVillages, approveVillage, rejectVillage, updateVillageCoordinates, getVillageQRCode, getVillageByQRCode, generateQRCode, downloadQRCode };
