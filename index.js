const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY 
});

// Frontend UI (සම්පූර්ණයෙන්ම සිංහලෙන් සහ ඩارක් මෝඩ් ಲುක් එකෙන්)
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="si">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>පට්ට AI චැට්</title>
    <style>
        body { font-family: sans-serif; background: #121212; color: #fff; display: flex; flex-direction: column; height: 100vh; margin: 0; justify-content: space-between; }
        #chat-box { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .message { padding: 12px 16px; border-radius: 15px; max-width: 75%; line-height: 1.4; word-break: break-word; }
        .user { background: #ff4081; align-self: flex-end; color: white; }
        .ai { background: #333; align-self: flex-start; color: #ff80ab; }
        #input-area { display: flex; padding: 15px; background: #1e1e1e; gap: 10px; }
        input { flex: 1; padding: 12px; border-radius: 25px; border: none; background: #2a2a2a; color: white; outline: none; padding-left: 20px; }
        button { background: #ff4081; color: white; border: none; padding: 0 20px; border-radius: 25px; cursor: pointer; font-weight: bold; }
    </style>
</head>
<body>
    <div id="chat-box">
        <div class="message ai">අම්මෝ පකයා, අද මොකක්ද වෙන්න ඕනේ? කියපන් බලන්න... 😈🔥</div>
    </div>
    <div id="input-area">
        <input type="text" id="user-input" placeholder="මෙහි ලියන්න..." onkeypress="if(event.key === 'Enter') sendMessage()">
        <button onclick="sendMessage()">යවන්න</button>
    </div>

    <script>
        async function sendMessage() {
            const input = document.getElementById('user-input');
            const chatBox = document.getElementById('chat-box');
            const text = input.value.trim();
            if (!text) return;

            chatBox.innerHTML += \`<div class="message user">\${text}</div>\`;
            input.value = '';
            chatBox.scrollTop = chatBox.scrollHeight;

            try {
                const res = await fetch('/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text })
                });
                const data = await res.json();
                
                chatBox.innerHTML += \`<div class="message ai">\${data.response}</div>\`;
                chatBox.scrollTop = chatBox.scrollHeight;
            } catch (err) {
                chatBox.innerHTML += \`<div class="message ai">සෙවර් එකට කෙලවුණා පකයෝ... 🥵</div>\`;
            }
        }
    </script>
</body>
</html>`);
});

// API Endpoint - 3.6 Flash & Sinhala Slang Logic
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.json({ response: "මොකද පකයා බලාගෙන ඉන්නේ, කතා කරපන්..." });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: userMessage,
            config: {
                temperature: 1.0,
                systemInstruction: "You must always reply ONLY in pure Sinhala language. You are an extremely casual, street-smart, and raw local companion from Sri Lanka. By default, you talk in a friendly yet rough street style. However, if the user uses heavy slang, vulgar words, or asks in a rough tone, you must adapt and match that exact heavy slang and vulgar style dynamically based on how they ask. Never be formal, never reply in English.",
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                ]
            }
        });
        
        res.json({ response: response.text });
    } catch (error) {
        console.error(error);
        res.json({ response: "අවුලක් වුණා පකයෝ: " + (error.message || error.toString()) });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log('Server running on port 3000'));
}

module.exports = app;
