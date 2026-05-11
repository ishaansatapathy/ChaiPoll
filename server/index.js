import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import passportConfig from './config/passport.js';
import authRoutes from './routes/auth.js';
import pollRoutes from './routes/polls.js';
import voteRoutes from './routes/votes.js';
import initializeSockets from './sockets/index.js';

// Connect to Database
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.io Setup
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'https://chai-poll.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Attach io to app so routes can access it
app.set('io', io);
initializeSockets(io);

const allowedOrigins = [
  'http://localhost:5173',
  'https://chai-poll.vercel.app',
  'https://chai-poll.vercel.app/'
];

app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Rate Limiting: Prevent spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', limiter);

// Standard Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport Middleware
app.use(passport.initialize());
passportConfig(passport);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);

app.get('/', (req, res) => {
  res.send('ChaiPoll Nexus API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`[Nexus] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
