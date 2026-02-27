const Application = require('../models/Application');
const Student = require('../models/Student');
const Internship = require('../models/Internship');
const { calculateMatchScore } = require('../matching/scoringEngine');

// Student applies for an internship
exports.applyToInternship = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user.id });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const internship = await Internship.findById(req.params.internshipId);
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        // Check if already applied
        let existingApplication = await Application.findOne({
            studentId: student._id,
            internshipId: internship._id
        });
        if (existingApplication) {
            return res.status(400).json({ message: 'Already applied for this internship' });
        }

        // Calculate match score at time of application
        const breakdown = calculateMatchScore(student, internship);

        const newApplication = new Application({
            studentId: student._id,
            internshipId: internship._id,
            score: breakdown.total,
            status: 'applied'
        });

        const application = await newApplication.save();
        res.status(201).json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all applications for current student
exports.getStudentApplications = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user.id });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const applications = await Application.find({ studentId: student._id })
            .populate('internshipId')
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all applications for a specific internship (Recruiter side)
exports.getRecruiterApplications = async (req, res) => {
    try {
        const applications = await Application.find({ internshipId: req.params.internshipId })
            .populate({
                path: 'studentId',
                populate: { path: 'userId', select: 'name email' }
            })
            .sort({ score: -1 });

        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
