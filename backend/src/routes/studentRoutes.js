const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadResume, addSkill, deleteSkill, addProject } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/profile', protect, authorize('student'), getProfile);
router.put('/profile', protect, authorize('student'), updateProfile);
router.post('/upload-resume', protect, authorize('student'), upload.single('resume'), uploadResume);
router.post('/skills', protect, authorize('student'), addSkill);
router.delete('/skills/:skillName', protect, authorize('student'), deleteSkill);
router.post('/projects', protect, authorize('student'), addProject);

module.exports = router;
