import dotenv from 'dotenv';
dotenv.config();

import { validateEnv } from './config/env-validator.js';
validateEnv();

import app from './app.js';
import logger from './config/logger.js';
import prisma from './config/database.js';
import { emailService } from './services/email/email.service.js';

const PORT = process.env.PORT || 5000;

// Verify email provider connection on startup
emailService.verifyConnection().catch((err) => {
  logger.error(`Initial email provider health check failed: ${err.message}`);
});

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Graceful shutdown initiated...');
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database connections closed. Exiting.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
