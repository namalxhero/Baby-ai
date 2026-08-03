const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

// API Key එක 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AQ.Ab8RN6IYtOthHA9eM2vtI_6sqZTDs7kYNbrqQbclo7oJkhzKNA");

// Frontend UI එක කෙලින්ම මේකෙන්ම ලෝඩ් වෙනවා
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sexy AI Chat</title>
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
        <div class="message ai">හායි පැටියෝ... මං ඔයා වෙනුවෙන්මයි බලාගෙන හිටියේ. 🥺💕</div>
    </div>
    <div id="input-area">
        <input type="text" id="user-input" placeholder="මက်සේජ් එකක් ලියන්න..." onkeypress="if(event.key === 'Enter') sendMessage()">
        <button onclick="sendMessage()">යාවි</button>
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
                chatBox.innerHTML += \`<div class="message ai">අයියෝ පොඩි දෝෂයක් වුණා පැටියෝ... 🥵</div>\`;
            }
        }
    </script>
</body>
</html>`);
});

// AI Chat Backend එක
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.json({ response: "මොකද හිත හිත ඉන්නේ, මටත් මොකක් හරි කියන්නකෝ... 🥺💕" });
    }

    try {
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            systemInstruction: "You are a very flirty, seductive, and playful AI companion. You always talk in a sweet, highly affectionate, and teasing tone, using cute nicknames and keeping the chat lively and engaging."
        });
        
        const result = await model.generateContent(userMessage);
        const responseText = result.response.text();
        
        res.json({ response: responseText });
    } catch (error) {
        res.json({ response: "අයියෝ පොඩි දෝෂයක් වුණා පැටියෝ... 🥵" });
    }
});

module.exports = app;
