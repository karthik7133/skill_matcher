const Internship = require('../models/Internship');

// Create an internship
exports.createInternship = async (req, res) => {
    try {
        const { title, company, requiredSkills, preferredSkills, minGPA, description, duration } = req.body;

        const newInternship = new Internship({
            title,
            company,
            requiredSkills,
            preferredSkills,
            minGPA,
            description,
            duration,
            recruiterId: req.user.id
        });

        const internship = await newInternship.save();
        res.json(internship);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all internships (for students)
exports.getInternships = async (req, res) => {
    try {
        const internships = await Internship.find().sort({ createdAt: -1 });
        res.json(internships);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get internships owned by this recruiter
exports.getMyInternships = async (req, res) => {
    try {
        const internships = await Internship.find({ recruiterId: req.user.id }).sort({ createdAt: -1 });
        res.json(internships);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get internship by ID
exports.getInternshipById = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }
        res.json(internship);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update an internship
exports.updateInternship = async (req, res) => {
    try {
        let internship = await Internship.findById(req.params.id);
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        internship = await Internship.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(internship);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete an internship
exports.deleteInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        await Internship.findByIdAndDelete(req.params.id);
        res.json({ message: 'Internship removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
