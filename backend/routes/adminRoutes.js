const express = require("express");
const router = express.Router();
const adminController = require('../controllers/adminController');


router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);
router.post('/logout', adminController.logoutAdmin);

router.get('/pending-officials', adminController.getPendingOfficials);
router.put('/approve/:id', adminController.approveOfficial);
router.put('/reject/:id', adminController.rejectOfficial);
router.delete('/official/:id', adminController.deleteOfficial);
router.get('/all-officials', adminController.getAllOfficials);

router.delete('/citizen/:id', adminController.deleteCitizen);
router.get('/all-citizens', adminController.getAllCitizens);

module.exports = router;