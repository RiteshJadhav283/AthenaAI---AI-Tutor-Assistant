const express = require('express');
const cors = require('cors');
require('dotenv').config(); // ✅ Important to load .env

const app = express();

app.use(cors());
app.use(express.json());

const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('AI Tutor Backend is running 🚀');
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});