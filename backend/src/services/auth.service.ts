import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { usersRepository } from '../repositories/users.repository.js';
import logger from '../config/logger.js';
import { Role, User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-replace-in-production';

export class AuthService {
  private generateAccessToken(user: User): string {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '15m',
    });
  }

  private generateRefreshToken(user: User): string {
    return jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  async registerStudent(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    nationality?: string;
  }) {
    const existingUser = await usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user and student profile in a single repository transaction context
    const newUser = await usersRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: Role.STUDENT,
      verificationToken,
      student: {
        create: {
          phone: data.phone,
          nationality: data.nationality,
        },
      },
    });

    // Mock verification email by logging the link
    const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;
    logger.info(
      `[MOCK EMAIL] Verification Email sent to ${data.email}. Click link to verify: ${verificationUrl}`,
    );

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };
  }

  async login(email: string, password: string) {
    const user = await usersRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token to user record
    await usersRepository.update(user.id, { refreshToken });

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

  async logout(userId: string) {
    await usersRepository.update(userId, { refreshToken: null });
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };
      const user = await usersRepository.findById(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      const accessToken = this.generateAccessToken(user);
      return { accessToken };
    } catch {
      throw new Error('Invalid or expired refresh token');
    }
  }

  async verifyEmail(token: string) {
    // Find user with this token
    const prisma = (await import('../config/database.js')).default;
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    await usersRepository.update(user.id, {
      isEmailVerified: true,
      verificationToken: null,
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await usersRepository.findByEmail(email);
    if (!user) {
      // Avoid leaking user existence, return success anyway
      logger.warn(`Forgot password request for non-existent email: ${email}`);
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await usersRepository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires,
    });

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    logger.info(
      `[MOCK EMAIL] Password Reset Email sent to ${email}. Click link to reset: ${resetUrl}`,
    );

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const prisma = (await import('../config/database.js')).default;
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await usersRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      refreshToken: null, // Revoke current sessions for security
    });

    return { message: 'Password reset successfully' };
  }
}

export const authService = new AuthService();
