const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const app = express();

app.use(cors());

const port = process.env.PORT || 3000;

const imgurImages = [
"https://i.imgur.com/FNRRTy7.jpg",];

let sentImages = [];

const server = http.createServer(app); 
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection established.');
    
    ws.send('WebSocket connection established. Ready to receive logs or image requests.');
    
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);

    });
});

app.get('/getRandomImage', (req, res) => {
 
    const availableImages = imgurImages.filter(img => !sentImages.includes(img));

    if (availableImages.length === 0) {
     
        sentImages = [];
        return res.json({ error: 'Hết ảnh để gửi, danh sách ảnh đã được làm mới.' });
    }

    const randomIndex = Math.floor(Math.random() * availableImages.length);
    const randomImage = availableImages[randomIndex];

    sentImages.push(randomImage);

    res.json({ imageUrl: randomImage });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(`New image sent: ${randomImage}`);
        }
    });
});

server.on('error', (error) => {
    console.error('Server error:', error);
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
}).on('error', (error) => {
    console.error('Error starting server:', error);
});
