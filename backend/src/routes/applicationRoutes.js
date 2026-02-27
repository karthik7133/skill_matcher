const express = require('express');
const router = express.Router();
const {
    applyToInternship,
    getStudentApplications,
    getRecruiterApplications
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/apply/:internshipId', protect, authorize('student'), applyToInternship);
router.get('/student', protect, authorize('student'), getStudentApplications);
router.get('/recruiter/:internshipId', protect, authorize('recruiter', 'admin'), getRecruiterApplications);

module.exports = router;
