const { GoogleGenerativeAI } = require('@google/generative-ai');
const Student = require('../models/Student');

// Use gemini-2.0-flash as the primary confirmed model
const CHAT_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash-exp'];

exports.chatWithAssistant = async (req, res) => {
    try {
        const { message, history } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('[ChatAssistant] Request received. API key present:', !!apiKey, '| Key prefix:', apiKey?.slice(0, 10));
        console.log('[ChatAssistant] Message:', message?.slice(0, 50));

        if (!apiKey) {
            return res.status(500).json({ message: 'AI Service configuration missing' });
        }
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const student = await Student.findOne({ userId: req.user.id });

        const genAI = new GoogleGenerativeAI(apiKey);

        // Build conversation history string for context
        const conversationHistory = (history || [])
            .map(m => `${m.role === 'user' ? 'Student' : 'Advisor'}: ${m.content}`)
            .join('\n');

        const skillsList = student?.skills?.map(s => `${s.name} (${s.level})`).join(', ') || 'None listed';
        const projectsList = student?.projects?.map(p => p.title).join(', ') || 'None listed';

        const fullPrompt = `You are a friendly Career Advisor for an internship matching platform. Be helpful, concise (2-4 sentences), and encouraging. Use the student's actual profile data to give personalized advice.

Student Profile:
- Skills: ${skillsList}
- Projects: ${projectsList}
- Education: ${student?.education || 'Not specified'}

Conversation so far:
${conversationHistory || '(New conversation)'}

Student asks: ${message}

Your response:`;

        // Try each model in sequence — fall back if quota is exceeded
        let responseText = null;
        for (const modelName of CHAT_MODELS) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(fullPrompt);
                responseText = result.response.text();
                break;
            } catch (modelErr) {
                const isQuota = modelErr.message?.includes('quota') ||
                    modelErr.message?.includes('RESOURCE_EXHAUSTED') ||
                    modelErr.status === 429;
                if (isQuota) {
                    console.warn(`[ChatAssistant] Quota exceeded for ${modelName}, trying next...`);
                    continue;
                }
                throw modelErr;
            }
        }

        if (!responseText) {
            return res.status(429).json({ message: "I'm a little overloaded right now! Please try again in a minute." });
        }

        res.json({ message: responseText });
    } catch (err) {
        console.error('[ChatAssistant] Error:', err.message);
        res.status(500).json({ message: 'Career Assistant is temporarily unavailable. Please try again.' });
    }
};
