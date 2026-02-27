const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/profile', protect, authorize('student'), getProfile);
router.put('/profile', protect, authorize('student'), updateProfile);

module.exports = router;
