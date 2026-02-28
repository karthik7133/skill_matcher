const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../src/models/Student');
const { parseResumeText } = require('../src/services/resumeParserService');

dotenv.config();

async function runBatchAnalysis() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const students = await Student.find({
            resumeText: { $exists: true, $ne: '' },
            $or: [
                { 'resumeAuthenticity.aiProbability': 0 },
                { 'resumeAuthenticity.aiProbability': { $exists: false } }
            ]
        });

        console.log(`Found ${students.length} students needing resume authenticity analysis.`);

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            console.log(`[${i + 1}/${students.length}] Analyzing resume for student: ${student._id}`);

            try {
                // We use parseResumeText which now includes authenticity analysis
                const analysis = await parseResumeText(student.resumeText);

                student.resumeAuthenticity = analysis.resumeAuthenticity;

                // Also update skills and projects if they were empty? 
                // Better to just update authenticity for safety of existing data
                await student.save();
                console.log(`  Success: AI Probability ${student.resumeAuthenticity.aiProbability}%`);
            } catch (err) {
                console.error(`  Error analyzing student ${student._id}:`, err.message);
            }
        }

        console.log('Batch analysis complete.');
        process.exit(0);
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

runBatchAnalysis();
