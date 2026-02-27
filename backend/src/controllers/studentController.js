const Student = require('../models/Student');
const User = require('../models/User');

// Get student profile
exports.getProfile = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user.id }).populate('userId', ['name', 'email']);
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        res.json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update student profile
exports.updateProfile = async (req, res) => {
    try {
        const { education, skills, projects, certifications, resumeText, availability } = req.body;

        const profileFields = {};
        if (education) profileFields.education = education;
        if (skills) profileFields.skills = skills;
        if (projects) profileFields.projects = projects;
        if (certifications) profileFields.certifications = certifications;
        if (resumeText) profileFields.resumeText = resumeText;
        if (availability) profileFields.availability = availability;

        let student = await Student.findOne({ userId: req.user.id });

        if (student) {
            student = await Student.findOneAndUpdate(
                { userId: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(student);
        }

        res.status(404).json({ message: 'Student profile not found' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
