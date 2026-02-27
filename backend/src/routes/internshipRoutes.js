const express = require('express');
const router = express.Router();
const {
    createInternship,
    getInternships,
    getInternshipById,
    updateInternship,
    deleteInternship
} = require('../controllers/internshipController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getInternships);
router.get('/:id', protect, getInternshipById);
router.post('/', protect, authorize('recruiter', 'admin'), createInternship);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateInternship);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteInternship);

module.exports = router;
