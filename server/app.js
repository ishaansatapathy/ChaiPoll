import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import passportConfig from './config/passport.js';
import authRoutes from './routes/auth.js';
import pollRoutes from './routes/polls.js';
import voteRoutes from './routes/votes.js';
import { getAllowedOrigins } from './utils/allowedOrigins.js';

export function createApp() {
  const app = express();
  const allowedOrigins = getAllowedOrigins();

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    })
  );

  app.use(helmet());

  if (process.env.VITEST !== 'true') {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
    });
    app.use('/api/', limiter);
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(passport.initialize());
  passportConfig(passport);

  app.use('/api/auth', authRoutes);
  app.use('/api/polls', pollRoutes);
  app.use('/api/votes', voteRoutes);

  app.get('/', (req, res) => {
    res.send('ChaiPoll Nexus API is running...');
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  return app;
}
