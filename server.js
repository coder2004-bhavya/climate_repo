const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the old Flask directories
app.use('/static', express.static(path.join(__dirname, 'static')));
// Serve HTML templates as static files for now
app.use(express.static(path.join(__dirname, 'templates')));

// In-Memory Database for Demonstration (To avoid requiring user to install MongoDB immediately)
const users = []; // { id, username, password }
const history = []; // { userId, prediction, timestamp }

// Basic JWT mock for simplicity
const generateToken = (userId) => Buffer.from(`token-${userId}`).toString('base64');

// Auth Routes
app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: "User already exists" });
    }
    const newUser = { id: Date.now().toString(), username, password };
    users.push(newUser);
    res.json({ token: generateToken(newUser.id), user: { username } });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ token: generateToken(user.id), user: { username } });
});

// Middleware for auth
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing token" });
    const token = authHeader.split(' ')[1];
    const userId = Buffer.from(token, 'base64').toString('ascii').replace('token-', '');
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(401).json({ error: "Invalid token" });
    req.user = user;
    next();
};

// Prediction Proxy
app.post('/api/predict', authenticate, async (req, res) => {
    try {
        // Forward to Flask Server running on port 5000
        const pythonResponse = await axios.post('http://127.0.0.1:5000/api/predict', req.body);
        
        // Save to History
        const predictionRecord = {
            userId: req.user.id,
            input: req.body,
            output: pythonResponse.data,
            timestamp: new Date().toISOString()
        };
        history.push(predictionRecord);
        
        res.json(pythonResponse.data);
    } catch (error) {
        console.error("Python Server Error:", error.message);
        res.status(500).json({ error: "Failed to communicate with ML Model." });
    }
});

// History Route
app.get('/api/history', authenticate, (req, res) => {
    const userHistory = history.filter(h => h.userId === req.user.id);
    res.json(userHistory);
});

// Chatbot Proxy
app.post('/api/chat', async (req, res) => {
    try {
        const pythonResponse = await axios.post('http://127.0.0.1:5000/api/chat', req.body);
        res.json(pythonResponse.data);
    } catch (error) {
        res.status(500).json({ error: "Chat service unavailable." });
    }
});

// WebSocket Real-time Alerts
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Simulate real-time critical alerts randomly
    const alertInterval = setInterval(() => {
        const alerts = [
            { type: 'warning', message: 'Sudden pressure drop detected in your region. Possible incoming storm.' },
            { type: 'error', message: 'Critical Phase: Global carbon spike detected from 3 major industrial zones.' },
            { type: 'warning', message: 'Significant UV Index increase expected in the next 2 hours.' }
        ];
        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        socket.emit('climate_alert', randomAlert);
    }, 45000); // Emits every 45 secs for testing

    socket.on('disconnect', () => {
        clearInterval(alertInterval);
        console.log('Client disconnected:', socket.id);
    });
});

// Explicit Page Routes
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'dashboard.html'));
});

app.get('/prediction.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'prediction.html'));
});

// Fallback to index.html for SPA-like navigation if needed
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Node.js Enterprise Server running on port ${PORT}`);
});
