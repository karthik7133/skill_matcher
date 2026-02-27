const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const server = require('http').createServer(app);
const socketService = require('./src/services/socketService');

// Initialize Sockets
socketService.init(server);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/students', require('./src/routes/studentRoutes'));
app.use('/api/recruiters', require('./src/routes/recruiterRoutes'));
app.use('/api/internships', require('./src/routes/internshipRoutes'));
app.use('/api/match', require('./src/routes/matchingRoutes'));
app.use('/api/applications', require('./src/routes/applicationRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend server is running' });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
