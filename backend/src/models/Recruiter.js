const mongoose = require('mongoose');

const RecruiterSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    website: String
});

module.exports = mongoose.model('Recruiter', RecruiterSchema);
