const express = require('express');
const router = express.Router();
const {
    applyToInternship,
    getStudentApplications,
    getRecruiterApplications,
    updateApplicationStatus,
    getAllRecruiterApplications
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/apply/:internshipId', protect, authorize('student'), applyToInternship);
router.get('/student', protect, authorize('student'), getStudentApplications);
router.get('/recruiter/:internshipId', protect, authorize('recruiter', 'admin'), getRecruiterApplications);
router.get('/recruiter-all', protect, authorize('recruiter', 'admin'), getAllRecruiterApplications);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);

module.exports = router;
