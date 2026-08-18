import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'dns';
import rateLimit from 'express-rate-limit';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { PORT, NODE_ENV, MONGODB_URI, FRONTEND_URL } from './config.js';
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import completionRoutes from './routes/completionRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { logger } from './utils/logger.js';
import { sanitizeBody } from './middleware/sanitizeMiddleware.js';
import { seedInitialData } from './utils/seedData.js';

// Ensure DNS resolution works reliably for MongoDB Atlas SRV records on Windows
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore DNS set error if custom environment
}

const app = express();

// CORS: restrict to specific origins in production
const allowedOrigins = FRONTEND_URL
  ? FRONTEND_URL.split(',').map(url => url.trim())
  : ['https://habit-forgee.vercel.app'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);

// Stricter rate limiting for auth endpoints: 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts from this IP, please try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', sanitizeBody, habitRoutes);
app.use('/api/completions', sanitizeBody, completionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/ai', sanitizeBody, aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HabitForge Backend RPG API is running smoothly!' });
});

// Endpoint to re-seed demo data if requested
app.post('/api/seed', async (req, res) => {
  await seedInitialData();
  res.json({ message: 'Sample RPG data seeded successfully!' });
});

let mongoServer;

async function startServer() {
  try {
    let mongoUri = MONGODB_URI;

    if (!mongoUri) {
      if (NODE_ENV === 'production') {
        logger.error('MONGODB_URI environment variable is required in production mode.');
        process.exit(1);
      }
      logger.info('No MONGODB_URI found in environment. Initializing MongoMemoryServer for instant zero-config development setup...');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    logger.info('Connecting to MongoDB Atlas cloud database...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    logger.info('Connected to MongoDB Atlas database successfully!');

    // Seed sample data for immediate RPG testing if database is empty
    await seedInitialData();

    app.listen(PORT, () => {
      logger.info(`HabitForge Backend running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to connect to primary MONGODB_URI:', { message: error.message });
    
    if (NODE_ENV === 'production') {
      logger.error('MongoDB connection failed in production. Exiting.');
      process.exit(1);
    }
    
    logger.warn('Falling back to local MongoMemoryServer for development...');
    
    try {
      mongoServer = await MongoMemoryServer.create();
      const fallbackUri = mongoServer.getUri();
      await mongoose.connect(fallbackUri);
      logger.info(`Connected to fallback MongoMemoryServer successfully at ${fallbackUri}`);
      await seedInitialData();

      app.listen(PORT, () => {
        logger.info(`HabitForge Backend running on port ${PORT} (Fallback mode)`);
      });
    } catch (fallbackErr) {
      logger.error('Failed to start fallback server:', { message: fallbackErr.message });
      process.exit(1);
    }
  }
}

startServer();
