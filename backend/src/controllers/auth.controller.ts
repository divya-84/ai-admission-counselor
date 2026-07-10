import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@project/shared';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const name = validatedData.name || validatedData.fullname || '';

      const user = await authService.registerStudent({
        email: validatedData.email,
        password: validatedData.password,
        name,
        phone: validatedData.phone,
        nationality: validatedData.nationality,
      });

      res.status(201).json({
        status: 'success',
        message: 'Registration successful. Verification email has been sent.',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.login(email, password);

      // Set Refresh Token in HttpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user,
          accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (userId) {
        await authService.logout(userId);
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ status: 'error', message: 'Refresh token required' });
        return;
      }

      const { accessToken } = await authService.refresh(refreshToken);

      res.status(200).json({
        status: 'success',
        data: {
          accessToken,
        },
      });
    } catch (err) {
      res.status(401).json({ status: 'error', message: (err as Error).message });
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.query.token as string;
      if (!token) {
        res.status(400).json({ status: 'error', message: 'Token is required' });
        return;
      }

      const result = await authService.verifyEmail(token);
      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(email);

      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(token, password);

      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
