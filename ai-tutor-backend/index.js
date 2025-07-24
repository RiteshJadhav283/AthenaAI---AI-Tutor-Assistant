const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// ✅ Load environment variables from .env file
dotenv.config();

// ✅ Initialize Express app
const app = express();
const PORT = process.env.PORT || 3550; // Default to 3550 if PORT is not set

// ✅ CORS Middleware — allow requests from React frontend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3003',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:3005',
    'http://localhost:3006',
    'http://localhost:8080',
    'http://localhost:8092',
    'http://localhost:8082',

  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Routes
const aiRoutes = require('./routes/aiRoutes');
const imageRoutes = require('./routes/imageRoutes');

app.use('/api', aiRoutes);
app.use('/api/image', imageRoutes);

// ✅ Serve static images (if needed)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ✅ Default health route
app.get('/', (req, res) => {
  res.status(200).send('🚀 AI Tutor Backend is Running!');
});

// ✅ 404 Route Handler (for undefined routes)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ Error handler middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server started at http://localhost:${PORT}`);
});