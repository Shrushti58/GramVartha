const express = require("express");
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require("../utlis/jwt");
const { authLimiter } = require("../src/middleware/rateLimiter");

router.post('/register', authLimiter, adminController.registerAdmin);
router.post('/login', authLimiter, adminController.loginAdmin);
router.post('/logout', adminController.logoutAdmin);
router.get('/me', verifyToken, adminController.getAdminMe);

router.get('/pending-admins', verifyToken, adminController.getPendingAdmins);
router.put('/approve-admin/:id', verifyToken, adminController.approveAdmin);
router.put('/reject-admin/:id', verifyToken, adminController.rejectAdmin);

// Admin management routes
router.get('/all-admins', verifyToken, adminController.getAllAdmins);
router.put('/edit-admin/:id', verifyToken, adminController.editAdmin);
router.delete('/delete-admin/:id', verifyToken, adminController.deleteAdmin);

// Official management routes
router.get('/all-officials', verifyToken, adminController.getAllOfficials);
router.put('/edit-official/:id', verifyToken, adminController.editOfficial);
router.delete('/delete-official/:id', verifyToken, adminController.deleteOfficialWithPermissions);

module.exports = router;
