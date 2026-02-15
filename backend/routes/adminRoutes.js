const express = require("express");
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require("../utlis/jwt");

router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);
router.post('/logout', adminController.logoutAdmin);
router.get('/me', verifyToken, adminController.getAdminMe);

router.delete('/citizen/:id', adminController.deleteCitizen);
router.get('/all-citizens', adminController.getAllCitizens);

router.get('/pending-admins', verifyToken, adminController.getPendingAdmins);
router.put('/approve-admin/:id', verifyToken, adminController.approveAdmin);
router.put('/reject-admin/:id', verifyToken, adminController.rejectAdmin);

module.exports = router;