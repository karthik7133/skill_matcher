const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');

// Register User
exports.register = async (req, res) => {
    try {
        const { role, name, email, password, companyName, website } = req.body;

        console.log('[Register] Received body:', { role, name, email, companyName });

        // Validate required fields
        if (!role || !name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, password, and role' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('[Register] User already exists:', email);
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            role,
            name,
            email,
            passwordHash
        });

        await user.save();
        console.log('[Register] User saved:', user._id);

        // Create profile based on role
        if (role === 'student') {
            const student = new Student({
                userId: user._id
            });
            await student.save();
            console.log('[Register] Student profile created');
        } else if (role === 'recruiter') {
            const recruiter = new Recruiter({
                userId: user._id,
                companyName: companyName || 'TBD',
                website: website || ''
            });
            await recruiter.save();
            console.log('[Register] Recruiter profile created');
        }

        // Return JWT
        const payload = {
            user: {
                id: user._id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                console.log('[Register] Token issued successfully');
                res.status(201).json({ token });
            }
        );
    } catch (err) {
        console.error('[Register] Error:', err.message, err);
        res.status(500).send('Server error');
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user._id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
