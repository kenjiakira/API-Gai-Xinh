const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const imgurImages = [
"https://i.imgur.com/FNRRTy7.jpg",];

let sentImages = [];

io.on('connection', (socket) => {
    console.log('New Socket.IO connection established.');
    
    socket.emit('message', 'Socket.IO connection established. Ready to receive logs or image requests.');
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
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

    io.emit('newImage', `New image sent: ${randomImage}`);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.on('error', (error) => {
    console.error('Server error:', error);
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
}).on('error', (error) => {
    console.error('Error starting server:', error);
});
