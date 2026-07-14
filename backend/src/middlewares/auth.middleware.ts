import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from './auth.interface.js';
export { AuthenticatedRequest };
import logger from '../config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production';

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  let token = req.cookies?.accessToken;

  // Header takes precedence
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    // If no access token, try refreshing silently using refresh token cookie
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        logger.info('Access token missing. Attempting silent token refresh via cookie...');
        const { authService } = await import('../services/auth.service.js');
        const ipAddress = req.ip || req.socket.remoteAddress;
        const deviceInfo = req.headers['user-agent'];

        const tokens = await authService.refresh(refreshToken, { ipAddress, deviceInfo });

        // Set rotated cookies
        res.cookie('accessToken', tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000, // 15 mins
        });

        res.cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        const decoded = jwt.verify(tokens.accessToken, JWT_SECRET) as {
          id: string;
          email: string;
          role: Role;
        };
        req.user = decoded;
        return next();
      } catch (err) {
        logger.warn(`Silent refresh failed: ${(err as Error).message}`);
      }
    }

    res.status(401).json({ status: 'error', message: 'Access token required. Please log in.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: Role;
    };
    req.user = decoded;
    next();
  } catch (err) {
    const errorMsg = err instanceof Error ? err.name : 'Invalid';

    // If access token is expired, try silent refresh
    if (errorMsg === 'TokenExpiredError') {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        try {
          logger.info('Access token expired. Attempting silent token refresh via cookie...');
          const { authService } = await import('../services/auth.service.js');
          const ipAddress = req.ip || req.socket.remoteAddress;
          const deviceInfo = req.headers['user-agent'];

          const tokens = await authService.refresh(refreshToken, { ipAddress, deviceInfo });

          res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
          });

          res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          const decoded = jwt.verify(tokens.accessToken, JWT_SECRET) as {
            id: string;
            email: string;
            role: Role;
          };
          req.user = decoded;
          return next();
        } catch (refreshErr) {
          logger.warn(`Silent refresh after expiry failed: ${(refreshErr as Error).message}`);
        }
      }
    }

    res.status(403).json({ status: 'error', message: 'Invalid or expired access token' });
    return;
  }
};

export const requireRoles = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Authorization failure: User ${req.user.email} (Role: ${req.user.role}) tried to access resource requiring [${roles.join(', ')}]`,
      );
      res.status(403).json({ status: 'error', message: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};
