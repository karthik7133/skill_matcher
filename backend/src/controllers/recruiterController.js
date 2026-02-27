const Recruiter = require('../models/Recruiter');

// Get recruiter profile
exports.getProfile = async (req, res) => {
    try {
        const recruiter = await Recruiter.findOne({ userId: req.user.id }).populate('userId', ['name', 'email']);
        if (!recruiter) {
            return res.status(404).json({ message: 'Recruiter profile not found' });
        }
        res.json(recruiter);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update recruiter profile
exports.updateProfile = async (req, res) => {
    try {
        const { companyName, website } = req.body;

        const profileFields = {};
        if (companyName) profileFields.companyName = companyName;
        if (website) profileFields.website = website;

        let recruiter = await Recruiter.findOne({ userId: req.user.id });

        if (recruiter) {
            recruiter = await Recruiter.findOneAndUpdate(
                { userId: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(recruiter);
        }

        res.status(404).json({ message: 'Recruiter profile not found' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
