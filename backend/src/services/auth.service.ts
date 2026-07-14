import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { usersRepository } from '../repositories/users.repository.js';
import { sessionsRepository } from '../repositories/sessions.repository.js';
import logger from '../config/logger.js';
import { Role, User } from '@prisma/client';
import { emailService } from './email/email.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-replace-in-production';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

export class AuthService {
  private hashSha256(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  generateAccessToken(user: User): string {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
    });
  }

  generateRefreshToken(user: User): string {
    return jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
    });
  }

  async registerStudent(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    nationality?: string;
    role?: Role;
  }) {
    logger.info(
      `Processing registration request for: ${data.email} as role: ${data.role || Role.STUDENT}`,
    );

    // Validate duplicate email
    const existingUser = await usersRepository.findByEmail(data.email);
    if (existingUser) {
      logger.warn(`Registration failed: Email already exists: ${data.email}`);
      throw new Error('Email is already registered');
    }

    // Validate duplicate phone if provided
    if (data.phone) {
      const prisma = (await import('../config/database.js')).default;
      const studentPhone = await prisma.student.findFirst({ where: { phone: data.phone } });
      const counselorPhone = await prisma.counselor.findFirst({ where: { phone: data.phone } });
      if (studentPhone || counselorPhone) {
        logger.warn(`Registration failed: Mobile number already exists: ${data.phone}`);
        throw new Error('Mobile number is already registered');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = this.hashSha256(rawVerificationToken);
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const selectedRole =
      data.role && Object.values(Role).includes(data.role) ? data.role : Role.STUDENT;

    // Create user and profile in a single repository transaction context
    const newUser = await usersRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: selectedRole,
      isEmailVerified: false,
      verificationToken: hashedVerificationToken,
      verificationTokenExpires,
      ...(selectedRole === Role.STUDENT
        ? {
            student: {
              create: {
                phone: data.phone,
                nationality: data.nationality,
              },
            },
          }
        : selectedRole === Role.COUNSELOR
          ? {
              counselor: {
                create: {
                  phone: data.phone,
                },
              },
            }
          : {}),
    });

    try {
      await emailService.sendVerificationEmail(data.email, data.name, rawVerificationToken);
      logger.info(`Verification email sent to registered user: ${data.email}`);
    } catch (err) {
      logger.error(
        `Failed to send verification email during registration to ${data.email}. Error: ${(err as Error).message}`,
      );
    }

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      isEmailVerified: newUser.isEmailVerified,
    };
  }

  async verifyEmail(token: string) {
    logger.info('Processing email verification token...');
    const hashedToken = this.hashSha256(token);
    const prisma = (await import('../config/database.js')).default;

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: hashedToken,
        verificationTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      logger.warn('Email verification failed: Token invalid or expired');
      throw new Error('Invalid or expired verification token');
    }

    await usersRepository.update(user.id, {
      isEmailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    });

    logger.info(`Email verified and account activated for user ID: ${user.id}`);

    try {
      await emailService.sendWelcomeEmail(user.email, user.name || 'Applicant');
    } catch (err) {
      logger.error(
        `Failed to send welcome email to verified user: ${user.email}. Error: ${(err as Error).message}`,
      );
    }

    return { message: 'Email verified successfully. Your account is now active.' };
  }

  async resendVerificationEmail(email: string) {
    logger.info(`Resend verification request for: ${email}`);
    const user = await usersRepository.findByEmail(email);

    if (!user) {
      // Don't leak details, return success anyway
      logger.warn(`Resend verification for non-existent email: ${email}`);
      return { message: 'If the account exists, a new verification link has been sent.' };
    }

    if (user.isEmailVerified) {
      throw new Error('This account is already verified.');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = this.hashSha256(rawToken);
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await usersRepository.update(user.id, {
      verificationToken: hashedToken,
      verificationTokenExpires,
    });

    try {
      await emailService.sendVerificationEmail(user.email, user.name || 'Applicant', rawToken);
      logger.info(`Resent verification email successfully to ${email}`);
    } catch (err) {
      logger.error(
        `Resend verification email failed for ${email}. Error: ${(err as Error).message}`,
      );
      throw new Error('Failed to send verification email. Please try again.');
    }

    return { message: 'If the account exists, a new verification link has been sent.' };
  }

  async login(
    email: string,
    password: string,
    clientInfo: { ipAddress?: string; deviceInfo?: string },
  ) {
    logger.info(`Processing login request for email: ${email}`);
    const user = await usersRepository.findByEmail(email);

    if (!user) {
      logger.warn(`Login failed: No user found with email: ${email}`);
      throw new Error('Invalid email or password');
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      logger.warn(
        `Login block: Account is temporarily locked for: ${email} until ${user.lockedUntil.toISOString()}`,
      );
      const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new Error(
        `Account is temporarily locked. Please try again in ${remainingTime} minutes.`,
      );
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed: Invalid password attempt for: ${email}`);
      const updatedUser = await usersRepository.incrementFailedAttempts(user.id);

      if (updatedUser.failedLoginAttempts >= 5) {
        const lockDurationMin = 15;
        const lockedUntil = new Date(Date.now() + lockDurationMin * 60 * 1000);
        await usersRepository.lockAccount(user.id, lockedUntil);
        logger.error(
          `Security Alert: Account locked for email: ${email} due to 5+ failed attempts.`,
        );

        try {
          await emailService.sendAccountLockedEmail(
            user.email,
            user.name || 'User',
            lockDurationMin,
          );
        } catch (err) {
          logger.error(
            `Failed to send account lock email to: ${user.email}. Error: ${(err as Error).message}`,
          );
        }
      }
      throw new Error('Invalid email or password');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      logger.warn(`Login block: Email not verified for: ${email}`);
      throw new Error('Please verify your email address to activate your account.');
    }

    // Reset failed attempts upon successful login
    await usersRepository.resetFailedAttempts(user.id);

    // Update lastLogin
    await usersRepository.update(user.id, {
      lastLogin: new Date(),
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    const hashedRefreshToken = this.hashSha256(refreshToken);

    // Save refresh token session in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days matching token
    await sessionsRepository.createSession({
      userId: user.id,
      tokenHash: hashedRefreshToken,
      deviceInfo: clientInfo.deviceInfo,
      ipAddress: clientInfo.ipAddress,
      expiresAt,
    });

    logger.info(`Successful login for user: ${email} (ID: ${user.id}). Session created.`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string) {
    const hashedToken = this.hashSha256(refreshToken);
    const deleted = await sessionsRepository.deleteSessionByHash(hashedToken);
    if (deleted) {
      logger.info(`Session invalidated and logged out for user ID: ${deleted.userId}`);
    }
  }

  async logoutAll(userId: string) {
    await sessionsRepository.deleteUserSessions(userId);
    // Invalidate refresh token field on User too for legacy sessions
    await usersRepository.update(userId, { refreshToken: null });
    logger.info(`All active sessions revoked for user ID: ${userId}`);
  }

  async refresh(oldRefreshToken: string, clientInfo: { ipAddress?: string; deviceInfo?: string }) {
    const hashedToken = this.hashSha256(oldRefreshToken);
    const session = await sessionsRepository.findSessionByHash(hashedToken);

    if (!session || session.expiresAt < new Date()) {
      logger.warn('Token refresh failed: Session not found or token expired.');
      throw new Error('Invalid or expired refresh token');
    }

    // Verify JWT payload matches database
    try {
      jwt.verify(oldRefreshToken, JWT_REFRESH_SECRET);
    } catch {
      await sessionsRepository.deleteSessionByHash(hashedToken);
      logger.warn('Token refresh failed: JWT signature invalid. Revoked session.');
      throw new Error('Invalid or expired refresh token');
    }

    const user = await usersRepository.findById(session.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new Access and Refresh tokens (Token Rotation)
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);
    const newHashedToken = this.hashSha256(newRefreshToken);

    // Rotate session: delete old and create new
    await sessionsRepository.deleteSessionByHash(hashedToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await sessionsRepository.createSession({
      userId: user.id,
      tokenHash: newHashedToken,
      deviceInfo: clientInfo.deviceInfo || session.deviceInfo,
      ipAddress: clientInfo.ipAddress || session.ipAddress,
      expiresAt,
    });

    logger.info(`Session rotated successfully for user ID: ${user.id}`);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async forgotPassword(email: string) {
    logger.info(`Forgot password request received for email: ${email}`);
    const user = await usersRepository.findByEmail(email);

    if (!user) {
      // Avoid leaking user existence
      logger.warn(`Forgot password request for non-existent email: ${email}`);
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = this.hashSha256(rawToken);
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await usersRepository.update(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires,
    });
    logger.info(`Database updated with reset token for user ID: ${user.id}`);

    try {
      await emailService.sendPasswordResetEmail(email, user.name || 'Applicant', rawToken);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (err) {
      logger.error(
        `Failed to send password reset email to ${email}. Error: ${(err as Error).message}`,
      );
      throw new Error('Failed to send password reset email. Please try again.');
    }

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    logger.info('Processing password reset request...');
    const hashedToken = this.hashSha256(token);
    const prisma = (await import('../config/database.js')).default;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      logger.warn('Password reset failed: Invalid or expired reset token.');
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user details
    await usersRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      passwordChangedAt: new Date(),
    });

    // Invalidate ALL sessions for this user (force fresh login)
    await sessionsRepository.deleteUserSessions(user.id);

    logger.info(`Password reset complete and all sessions revoked for user ID: ${user.id}`);

    try {
      await emailService.sendPasswordChangedEmail(user.email, user.name || 'User');
    } catch {
      logger.error(`Failed to send password changed confirmation to: ${user.email}`);
    }

    return { message: 'Password reset successfully. Please log in with your new credentials.' };
  }

  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    logger.info(`Processing change password request for user ID: ${userId}`);
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      logger.warn(`Change password failed: Current password mismatch for user ID: ${userId}`);
      throw new Error('Incorrect current password');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await usersRepository.update(userId, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    });

    // Invalidate all other active sessions (keep this session if desired, or wipe all to be secure. Let's wipe all for maximum security)
    await sessionsRepository.deleteUserSessions(userId);

    logger.info(`Password changed and all sessions revoked for user ID: ${userId}`);

    try {
      await emailService.sendPasswordChangedEmail(user.email, user.name || 'User');
    } catch {
      logger.error(`Failed to send password changed confirmation to: ${user.email}`);
    }

    return { message: 'Password changed successfully. Please log in again.' };
  }

  async getActiveSessions(userId: string) {
    return sessionsRepository.getUserSessions(userId);
  }
}

export const authService = new AuthService();
