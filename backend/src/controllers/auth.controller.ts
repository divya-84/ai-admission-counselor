import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { authService } from '../services/auth.service.js';
import { emailService } from '../services/email/email.service.js';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  resendVerificationSchema,
} from '@project/shared';
import { AuthenticatedRequest } from '../middlewares/auth.interface.js';
import logger from '../config/logger.js';

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
        role: validatedData.role,
      });

      res.status(201).json({
        status: 'success',
        message:
          'Registration successful. A verification email has been sent to activate your account.',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, rememberMe } = loginSchema.parse(req.body);

      // Extract client information for session audit log
      const ipAddress = req.ip || req.socket.remoteAddress;
      const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

      const { user, accessToken, refreshToken } = await authService.login(email, password, {
        ipAddress,
        deviceInfo,
      });

      // Set Access Token in HttpOnly cookie
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      // Set Refresh Token in HttpOnly cookie
      const isRememberMe = rememberMe === true;
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: isRememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined, // 7 days or browser session cookie
      });

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user,
          accessToken, // Return for backward-compatibility if client wants to read it
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully from this session.',
      });
    } catch (err) {
      next(err);
    }
  }

  async logoutAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (userId) {
        await authService.logoutAll(userId);
      }

      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully from all active devices and sessions.',
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

      const ipAddress = req.ip || req.socket.remoteAddress;
      const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

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

      res.status(200).json({
        status: 'success',
        data: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (err) {
      res.status(401).json({ status: 'error', message: (err as Error).message });
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = (req.query.token as string) || req.body.token;
      if (!token) {
        res.status(400).json({ status: 'error', message: 'Verification token is required' });
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

  async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = resendVerificationSchema.parse(req.body);
      const result = await authService.resendVerificationEmail(email);

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
      logger.info('Reset password request body:', {
        ...req.body,
        password: req.body?.password ? '***' : undefined,
        confirmPassword: req.body?.confirmPassword ? '***' : undefined,
      });
      const { token, password, confirmPassword } = resetPasswordSchema.parse(req.body);
      logger.info(
        'Password match validation status:',
        confirmPassword ? 'validated' : 'no-confirmation',
      );
      const result = await authService.resetPassword(token, password);

      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const validatedData = changePasswordSchema.parse(req.body);
      const result = await authService.changePassword(userId, {
        currentPassword: validatedData.currentPassword,
        newPassword: validatedData.newPassword,
      });

      // Clear cookies since session is revoked (forces fresh login)
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.status(200).json({
        status: 'success',
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }

  async getActiveSessions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const sessions = await authService.getActiveSessions(userId);
      res.status(200).json({
        status: 'success',
        data: {
          sessions: sessions.map((s) => ({
            id: s.id,
            deviceInfo: s.deviceInfo,
            ipAddress: s.ipAddress,
            createdAt: s.createdAt,
            lastActive: s.lastActive,
            isCurrent: req.cookies?.refreshToken
              ? crypto.createHash('sha256').update(req.cookies.refreshToken).digest('hex') ===
                s.tokenHash
              : false,
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async diagnoseEmail(_req: Request, res: Response): Promise<void> {
    try {
      const emailProvider = process.env.EMAIL_PROVIDER || 'not-set';
      const config = {
        EMAIL_PROVIDER: emailProvider,
        SMTP_HOST: process.env.SMTP_HOST || 'not-set',
        SMTP_PORT: process.env.SMTP_PORT || 'not-set',
        SMTP_USER: process.env.SMTP_USER ? `defined (value: ${process.env.SMTP_USER})` : 'not-set',
        SMTP_PASS: process.env.SMTP_PASS
          ? `defined (length: ${process.env.SMTP_PASS.length})`
          : 'not-set',
        EMAIL_FROM: process.env.EMAIL_FROM || 'not-set',
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'defined' : 'not-set',
        NODE_ENV: process.env.NODE_ENV || 'not-set',
      };

      let connectionResult = 'Not tested';
      try {
        await emailService.verifyConnection();
        connectionResult = 'SUCCESS: Connection verified successfully';
      } catch (err) {
        connectionResult = 'FAILED: ' + (err instanceof Error ? err.message : String(err));
      }

      let liveTestResult = 'Not run';
      try {
        const testRecipient = process.env.SMTP_USER || 'maheshwari.divya84@gmail.com';
        await emailService.sendWelcomeEmail(testRecipient, 'Diagnostics Test');
        liveTestResult = `SUCCESS: Test email sent successfully to ${testRecipient}!`;
      } catch (err) {
        liveTestResult = 'FAILED: ' + (err instanceof Error ? err.message : String(err));
      }

      res.status(200).json({
        status: 'success',
        config,
        connectionResult,
        liveTestResult,
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

export const authController = new AuthController();
