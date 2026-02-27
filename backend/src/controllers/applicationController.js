const Application = require('../models/Application');
const Student = require('../models/Student');
const Internship = require('../models/Internship');
const Notification = require('../models/Notification');
const socketService = require('../services/socketService');
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

        // Trigger Notification for Recruiter
        if (internship.recruiterId) {
            const notification = new Notification({
                userId: internship.recruiterId,
                type: 'application_received',
                message: `${req.user.name} applied for ${internship.title} (Match Score: ${breakdown.total}%)`,
                relatedInternshipId: internship._id
            });
            await notification.save();
            socketService.sendNotification(internship.recruiterId, notification);
        }

        res.status(201).json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update application status (Recruiter side)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['shortlisted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const application = await Application.findById(req.params.id)
            .populate('internshipId')
            .populate({
                path: 'studentId',
                populate: { path: 'userId' }
            });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Ensure the recruiter updating is the one who owns the internship
        if (application.internshipId.recruiterId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        application.status = status;
        await application.save();

        // Trigger Notification for Student
        const studentUserId = application.studentId.userId._id;
        const notification = new Notification({
            userId: studentUserId,
            type: 'status_updated',
            message: `Your application for ${application.internshipId.title} was ${status}!`,
            relatedInternshipId: application.internshipId._id
        });
        await notification.save();
        socketService.sendNotification(studentUserId, notification);

        res.json(application);
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

// Get all applications for ALL internships owned by the recruiter
exports.getAllRecruiterApplications = async (req, res) => {
    try {
        // Find all internships owned by this recruiter
        const internships = await Internship.find({ recruiterId: req.user.id });
        const internshipIds = internships.map(i => i._id);

        const applications = await Application.find({ internshipId: { $in: internshipIds } })
            .populate('internshipId')
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
