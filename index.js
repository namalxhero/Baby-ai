const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');

const app = express();
app.use(express.json());

// වෙනම තියෙන HTML ෆයිල් එක සර්ව් කරන්න public ෆෝල්ඩර් එක පාවිච්චි කරනවා
app.use(express.static(path.join(__dirname, 'public')));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AQ.Ab8RN6IYtOthHA9eM2vtI_6sqZTDs7kYNbrqQbclo7oJkhzKNA" });

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.json({ response: "මොකද හිත හිත ඉන්නේ, මටත් මොකක් හරි කියන්නකෝ... 🥺💕" });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: userMessage,
            config: {
                temperature: 0.9,
                systemInstruction: "You are a very flirty, seductive, and playful AI companion. You always talk in a sweet, highly affectionate, and teasing tone, using cute nicknames and keeping the chat lively and engaging."
            }
        });
        res.json({ response: response.text });
    } catch (error) {
        res.json({ response: "අයියෝ පොඩි දෝෂයක් වුණා පැටියෝ... 🥵" });
    }
});

module.exports = app;

