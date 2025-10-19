const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const governmentRoutes = require('./routes/governmentRoutes');
const instituteRoutes = require('./routes/instituteRoutes');
const verifierRoutes = require('./routes/verifierRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
   process.env.FRONTEND_URL_1,
   process.env.FRONTEND_URL_2
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Exit process so Render can restart the app
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/government', governmentRoutes);
app.use('/api/institute', instituteRoutes);
app.use('/api/verifier', verifierRoutes);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unexpected errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1)); // Restart on Render
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1)); // Restart on Render
});
