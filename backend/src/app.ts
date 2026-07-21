import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ZodError } from 'zod';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import logger from './config/logger.js';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import ragRoutes from './routes/rag.routes.js';
import recommendationRoutes from './routes/recommendation.routes.js';
import eligibilityRoutes from './routes/eligibility.routes.js';
import scholarshipRoutes from './routes/scholarship.routes.js';
import documentRoutes from './routes/document.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import adminRoutes from './routes/admin.routes.js';
import counselorRoutes from './routes/counselor.routes.js';
import studentRoutes from './routes/student.routes.js';

dotenv.config();

const app = express();

// Security Middlewares
app.use(helmet());
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive CORS for development & Vercel
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Register Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/counselor', counselorRoutes);
app.use('/api/student', studentRoutes);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AI Admission Counselor API is healthy',
    timestamp: new Date().toISOString(),
  });
});

interface HttpError extends Error {
  status?: number;
}

// Global Error Handler
app.use(
  (err: HttpError, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error(`Error: ${err.message}`, { stack: err.stack });

    if (err instanceof ZodError || err.name === 'ZodError') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const issues = (err as any).errors || (err as any).issues || [];
      const firstIssue = issues[0];
      const cleanMessage = firstIssue ? firstIssue.message : 'Validation failed';
      res.status(400).json({
        status: 'error',
        message: cleanMessage,
      });
      return;
    }

    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'Internal Server Error',
    });
  },
);

export default app;
