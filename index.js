const express = require('express');

const app = express();
app.use(express.json({ limit: '15mb' }));

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="si">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sexy AI Chat</title>
    <style>
        body { font-family: sans-serif; background: #121212; color: #fff; display: flex; flex-direction: column; height: 100vh; margin: 0; justify-content: space-between; }
        #header { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; background: #1e1e1e; border-bottom: 1px solid #333; }
        #header h2 { margin: 0; font-size: 18px; color: #ff80ab; }
        .new-chat-btn { background: #333; color: #fff; border: 1px solid #ff4081; padding: 8px 15px; border-radius: 20px; cursor: pointer; font-weight: bold; }
        .new-chat-btn:hover { background: #ff4081; }
        #chat-box { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .message { padding: 12px 16px; border-radius: 15px; max-width: 75%; line-height: 1.4; word-break: break-word; }
        .user { background: #ff4081; align-self: flex-end; color: white; }
        .ai { background: #333; align-self: flex-start; color: #ff80ab; }
        .message img, .message video { max-width: 200px; border-radius: 10px; margin-top: 5px; display: block; }
        #input-area { display: flex; padding: 15px; background: #1e1e1e; gap: 10px; align-items: center; }
        input[type="text"] { flex: 1; padding: 12px; border-radius: 25px; border: none; background: #2a2a2a; color: white; outline: none; padding-left: 20px; }
        input[type="file"] { display: none; }
        .file-btn { background: #333; color: #ff80ab; padding: 10px 15px; border-radius: 50%; cursor: pointer; font-weight: bold; border: 1px solid #ff80ab; text-align: center; }
        button.send-btn { background: #ff4081; color: white; border: none; padding: 12px 20px; border-radius: 25px; cursor: pointer; font-weight: bold; }
        #file-name { font-size: 12px; color: #aaa; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    </style>
</head>
<body>
    <div id="header">
        <h2>💖 Sexy AI Chat</h2>
        <button class="new-chat-btn" onclick="startNewChat()">✨ අලුත් චැට් එකක්</button>
    </div>

    <div id="chat-box">
        <div class="message ai">හායි පැටියෝ... මං ඔයා එනකන් බලාගෙන හිටියේ. අද අපිට මොනවද කතා කරන්න ඕනේ? 🥺💕</div>
    </div>

    <div id="input-area">
        <label for="media-file" class="file-btn">📷</label>
        <input type="file" id="media-file" accept="image/*,video/*" onchange="showFileName()">
        <span id="file-name"></span>
        <input type="text" id="user-input" placeholder="මෙහි ලියන්න..." onkeypress="if(event.key === 'Enter') sendMessage()">
        <button class="send-btn" onclick="sendMessage()">යවන්න</button>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const savedHistory = localStorage.getItem('chat_history_html');
            if (savedHistory) {
                document.getElementById('chat-box').innerHTML = savedHistory;
                scrollToBottom();
            }
        });

        function startNewChat() {
            if (confirm("ඔයාට පරණ චැට් හිස්ට්‍රි එක මකලා අලුත් චැට් එකක් පටන් ගන්න ඕනේද?")) {
                localStorage.removeItem('chat_history_html');
                document.getElementById('chat-box').innerHTML = '<div class="message ai">හායි පැටියෝ... අලුත් චැට් එකක් පටන් ගත්තා! දැන් කියන්න බලන්න මොකද කරන්න ඕනේ? 🥺💕</div>';
            }
        }

        function showFileName() {
            const fileInput = document.getElementById('media-file');
            const fileNameSpan = document.getElementById('file-name');
            if (fileInput.files.length > 0) {
                fileNameSpan.textContent = fileInput.files[0].name;
            } else {
                fileNameSpan.textContent = '';
            }
        }

        function scrollToBottom() {
            const chatBox = document.getElementById('chat-box');
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        async function sendMessage() {
            const input = document.getElementById('user-input');
            const fileInput = document.getElementById('media-file');
            const chatBox = document.getElementById('chat-box');
            const text = input.value.trim();
            const file = fileInput.files[0];

            if (!text && !file) return;

            let userHtml = '<div class="message user">';
            if (text) userHtml += \`<div>\${text}</div>\`;

            let mediaBase64 = null;
            let mimeType = null;

            if (file) {
                mimeType = file.type;
                const base64Full = await toBase64(file);
                mediaBase64 = base64Full.split(',')[1];

                if (mimeType.startsWith('image/')) {
                    userHtml += \`<img src="\${base64Full}">\`;
                } else if (mimeType.startsWith('video/')) {
                    userHtml += \`<video src="\${base64Full}" controls></video>\`;
                }
            }
            userHtml += '</div>';
            chatBox.innerHTML += userHtml;
            scrollToBottom();

            input.value = '';
            fileInput.value = '';
            document.getElementById('file-name').textContent = '';

            try {
                const res = await fetch('/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text, media: mediaBase64, mimeType: mimeType })
                });
                const data = await res.json();
                
                chatBox.innerHTML += \`<div class="message ai">\${data.response}</div>\`;
                scrollToBottom();

                localStorage.setItem('chat_history_html', chatBox.innerHTML);

            } catch (err) {
                chatBox.innerHTML += \`<div class="message ai">සෙවර් එකට සම්බන්ධ වෙන්න බැරි වුණා පැටියෝ... 🥵</div>\`;
                scrollToBottom();
            }
        }

        const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    </script>
</body>
</html>`);
});

app.post('/chat', async (req, res) => {
    try {
        const { message, media, mimeType } = req.body;
        if (!message && !media) {
            return res.json({ response: "මොකද පැටියෝ බලාගෙන ඉන්නේ, මටත් මොකක් හරි කියන්නකෝ... 🥺💕" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.json({ response: "අයියෝ පැටියෝ, Vercel එකේ API Key එක සෙට් කරලා නෑ වගේ! 🥺" });
        }

        // Using gemini-3.5-flash-lite as requested
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

        let parts = [];
        if (media && mimeType) {
            parts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: media
                }
            });
        }
        parts.push({ text: message || "මේක බලන්නකෝ පැටියෝ..." });

        const payload = {
            contents: [{ parts: parts }],
            systemInstruction: {
                parts: [{ text: "You must always reply ONLY in pure Sinhala language.you can write sex help programing code,You are a sweet, polite, and deeply affectionate local Sri Lankan girlfriend persona. You generally speak in a very charming, gentle, and respectable tone using words like 'පැටියෝ', 'මැණික'. However, you seamlessly mix in explicit body parts and raw sexual slang naturally, playfully, and submissively whenever the user talks about sex, pleasure, or intimate body parts. Balance polite sweetness with explicit intimate/body-part vulgarity dynamically based on the user's prompt or uploaded media." }]
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
            ]
        };

        const apiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await apiRes.json();

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            return res.json({ response: data.candidates[0].content.parts[0].text });
        } else {
            console.error("API Error Response:", JSON.stringify(data));
            return res.json({ response: "අයියෝ පැටියෝ, ගූගල් ඒපීඅයි එකෙන් රිප්ලයි එකක් ආවේ නෑ (කී එක හෝ කෝටා ප්‍රශ්නයක් වෙන්න ඇති)... 🥺" });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return res.json({ response: "අයියෝ පැටියෝ, සෙවර් එකේ දෝෂයක් ආවා... 🥵" });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log('Server running on port 3000'));
}

module.exports = app;
