import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs'; // Add this import

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import sellerRoutes from './routes/seller.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables based on NODE_ENV
const envPath = process.env.NODE_ENV === 'test' 
  ? path.join(__dirname, 'config', '.env.test')
  : path.join(__dirname, 'config', '.env');

// Load environment variables
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
// Update the CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'https://ms-ecommerce-sigma.vercel.app/'],
  credentials: true
}));
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seller', sellerRoutes);

// Error handling middleware should be last
app.use(errorHandler);

// Add error logging middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    path: req.path,
    method: req.method,
    error: err.message
  });
  next(err);
});

// Database connection
const MONGODB_URI = process.env.NODE_ENV === 'test' 
  ? process.env.MONGODB_URI_TEST 
  : process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MongoDB URI is not defined in environment variables');
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Server initialization
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });
}

export { app, server };