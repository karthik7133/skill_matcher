const Student = require('../models/Student');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const { calculateMatchScore } = require('../matching/scoringEngine');
const { generateExplanation } = require('../matching/explainability');

// Get internship recommendations for a student
exports.getRecommendations = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user.id });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const internships = await Internship.find();

        const recommendations = internships.map(internship => {
            const breakdown = calculateMatchScore(student, internship);
            return {
                internship,
                matchScore: breakdown.total,
                explanation: generateExplanation(breakdown)
            };
        });

        // Sort by match score descending
        recommendations.sort((a, b) => b.matchScore - a.matchScore);

        res.json(recommendations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get candidate recommendations for an internship (Recruiter side)
exports.getCandidates = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        const students = await Student.find().populate('userId', ['name', 'email']);

        const candidates = students.map(student => {
            const breakdown = calculateMatchScore(student, internship);
            return {
                student,
                matchScore: breakdown.total,
                explanation: generateExplanation(breakdown)
            };
        });

        candidates.sort((a, b) => b.matchScore - a.matchScore);

        res.json(candidates);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get detailed explanation for a match
exports.getMatchDetail = async (req, res) => {
    try {
        const { studentId, internshipId } = req.query;
        const student = await Student.findById(studentId);
        const internship = await Internship.findById(internshipId);

        if (!student || !internship) {
            return res.status(404).json({ message: 'Student or Internship not found' });
        }

        const breakdown = calculateMatchScore(student, internship);
        res.json({
            breakdown,
            explanation: generateExplanation(breakdown)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
