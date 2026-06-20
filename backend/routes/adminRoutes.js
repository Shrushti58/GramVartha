const express = require("express");
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require("../utlis/jwt");
const {
  rejectMongoOperators,
  validateRequest,
  objectIdParam,
  authValidators,
  adminValidators,
} = require("../middlewares/validators");

router.use(rejectMongoOperators);

router.post('/register', authValidators.adminRegister, validateRequest, adminController.registerAdmin);
router.post('/login', authValidators.loginEmail, validateRequest, adminController.loginAdmin);
router.post('/logout', adminController.logoutAdmin);
router.get('/me', verifyToken, adminController.getAdminMe);

router.get('/pending-admins', verifyToken, adminController.getPendingAdmins);
router.put('/approve-admin/:id', objectIdParam("id"), validateRequest, verifyToken, adminController.approveAdmin);
router.put('/reject-admin/:id', objectIdParam("id"), validateRequest, verifyToken, adminController.rejectAdmin);

// Admin management routes
router.get('/all-admins', verifyToken, adminController.getAllAdmins);
router.put('/edit-admin/:id', adminValidators.editAdmin, validateRequest, verifyToken, adminController.editAdmin);
router.delete('/delete-admin/:id', objectIdParam("id"), validateRequest, verifyToken, adminController.deleteAdmin);

// Official management routes
router.get('/all-officials', verifyToken, adminController.getAllOfficials);
router.put('/edit-official/:id', adminValidators.editOfficial, validateRequest, verifyToken, adminController.editOfficial);
router.delete('/delete-official/:id', objectIdParam("id"), validateRequest, verifyToken, adminController.deleteOfficialWithPermissions);

module.exports = router;
