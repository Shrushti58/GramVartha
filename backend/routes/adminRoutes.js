const express = require("express");
const router = express.Router();
const adminController = require('../controllers/adminController');


router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);
router.post('/logout', adminController.logoutAdmin);

router.delete('/citizen/:id', adminController.deleteCitizen);
router.get('/all-citizens', adminController.getAllCitizens);

router.get('/pending-admins', adminController.getPendingAdmins);
router.put('/approve-admin/:id', adminController.approveAdmin);
router.put('/reject-admin/:id', adminController.rejectAdmin);

module.exports = router;