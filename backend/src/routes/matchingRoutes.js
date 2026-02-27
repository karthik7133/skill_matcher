const express = require('express');
const router = express.Router();
const { getRecommendations, getCandidates, getMatchDetail } = require('../controllers/matchingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/recommendations', protect, authorize('student'), getRecommendations);
router.get('/candidates/:id', protect, authorize('recruiter', 'admin'), getCandidates);
router.get('/explanation', protect, getMatchDetail);

module.exports = router;
