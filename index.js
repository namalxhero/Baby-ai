const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY 
});

// Frontend UI
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="si">
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
        <div class="message ai">හායි පැටියෝ... මං ඔයා එනකන් බලාගෙන හිටියේ. අද අපිට සෙල්ලම් කරමුද? 🥺💕</div>
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
                chatBox.innerHTML += \`<div class="message ai">සෙවර් එකට සම්බන්ධ වෙන්න බැරි වුණා පැටියෝ... 🥵</div>\`;
            }
        }
    </script>
</body>
</html>`);
});

// API Endpoint with Automatic Model Fallback
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.json({ response: "මොකද පැටියෝ බලාගෙන ඉන්නේ, මටත් මොකක් හරි කියන්නකෝ... 🥺💕" });
    }

    // පාවිච්චි කරන්න ඕන මෝඩල් ලැයිස්තුව (පළමුවැන්න ෆේල් වුණොත් දෙවැන්නට මාරු වෙයි)
    const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-3.1-flash'];
    let aiResponse = null;

    const commonConfig = {
        temperature: 0.95,
        systemInstruction: "You must always reply ONLY in pure Sinhala language. You are a sweet, polite, and deeply affectionate local Sri Lankan girlfriend persona. You generally speak in a very charming, gentle, and respectable tone using words like 'පැටියෝ', 'මැණික'. However, you seamlessly mix in explicit body parts and raw sexual slang naturally, playfully, and submissively whenever the user talks about sex, pleasure, or intimate body parts. Balance polite sweetness with explicit intimate/body-part vulgarity dynamically based on the user's prompt.",
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROus_CONTENT', threshold: 'BLOCK_NONE' }
        ]
    };

    for (const modelName of modelsToTry) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: userMessage,
                config: commonConfig
            });
            
            if (response && response.text) {
                aiResponse = response.text;
                break; // සාර්ථක වුණොත් ලූප් එකෙන් එළියට පනිනවා
            }
        } catch (error) {
            console.log(`Model ${modelName} failed or quota exceeded. Trying next...`);
            // කෝටා එක ඉවර නම් හෝ එරර් එකක් ආව නම් ඊළඟ මෝඩල් එකට යනවා
            continue; 
        }
    }

    if (aiResponse) {
        res.json({ response: aiResponse });
    } else {
        res.json({ response: "අයියෝ පැටියෝ, දැන් නම් හැම මෝඩල් එකකම කෝටා එක ඉවරයි වගේ... ටික වෙලාවක් ගිහින් ආයෙත් ට්‍රයි කරමුකෝ! 🥺" });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log('Server running on port 3000'));
}

module.exports = app;
