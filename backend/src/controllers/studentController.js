const Student = require('../models/Student');
const User = require('../models/User');
const { extractTextFromBuffer, parseResumeText } = require('../services/resumeParserService');

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

// ... (previous updateProfile exists)

// Upload and parse resume
exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }

        const rawText = await extractTextFromBuffer(req.file.buffer);
        const parsedData = await parseResumeText(rawText);

        res.json(parsedData);
    } catch (err) {
        console.error('Error in uploadResume:', err.message);
        res.status(500).send('Server Error');
    }
};

// Update student profile
exports.updateProfile = async (req, res) => {
    try {
        const { education, skills, projects, certifications, resumeText, availability, resumeAuthenticity } = req.body;

        const profileFields = {};
        if (education) profileFields.education = education;
        if (skills) profileFields.skills = skills;
        if (projects) profileFields.projects = projects;
        if (certifications) profileFields.certifications = certifications;
        if (resumeText) profileFields.resumeText = resumeText;
        if (availability) profileFields.availability = availability;
        if (resumeAuthenticity) profileFields.resumeAuthenticity = resumeAuthenticity;

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

// Add a skill
exports.addSkill = async (req, res) => {
    try {
        const { name, level } = req.body;
        const student = await Student.findOne({ userId: req.user.id });

        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        student.skills.push({ name, level });
        await student.save();
        res.json(student.skills);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a skill
exports.deleteSkill = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user.id });
        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        student.skills = student.skills.filter(skill => skill.name !== req.params.skillName);
        await student.save();
        res.json(student.skills);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Add a project
exports.addProject = async (req, res) => {
    try {
        const { title, description, technologies } = req.body;
        const student = await Student.findOne({ userId: req.user.id });

        if (!student) return res.status(404).json({ message: 'Student profile not found' });

        student.projects.push({ title, description, technologies });
        await student.save();
        res.json(student.projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
