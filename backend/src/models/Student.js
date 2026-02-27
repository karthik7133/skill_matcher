const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    education: {
        type: String
    },
    skills: [{
        name: String,
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced']
        }
    }],
    projects: [{
        title: String,
        description: String,
        technologies: [String]
    }],
    certifications: [String],
    resumeText: String,
    availability: String
});

module.exports = mongoose.model('Student', StudentSchema);
