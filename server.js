// server.js (CommonJS version)
const dotenv = require('dotenv');
const { EventEmitter } = require('events');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/userRoute');
const productRoutes = require('./routes/productRoute');
const dealRoutes = require('./routes/dealRoute');
const comboRoutes = require('./routes/comboRoute');
const categoryRoutes = require('./routes/categoryRoute');
// const testRoutes = require('./routes/test');
const connectDB = require('./config/db');

const allowedOrigins = [
  'https://alula-client.vercel.app',
  'https://alula-admin.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

// Prevent memory leak warning
EventEmitter.defaultMaxListeners = 20;

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));

// app.use(cors());

app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/combos', comboRoutes);
app.use('/api/prodcat', categoryRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("API is running...");
});
