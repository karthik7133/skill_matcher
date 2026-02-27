const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    internshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['applied', 'shortlisted', 'rejected'],
        default: 'applied'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Application', ApplicationSchema);
