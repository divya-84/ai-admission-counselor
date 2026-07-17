import { Prisma, User } from '@prisma/client';
import prisma from '../config/database.js';

export class UsersRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        student: true,
        counselor: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        student: true,
        counselor: true,
      },
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { verificationToken: token },
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { resetPasswordToken: token },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, updates: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: updates,
    });
  }

  async incrementFailedAttempts(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        failedLoginAttempts: {
          increment: 1,
        },
      },
    });
  }

  async resetFailedAttempts(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  async lockAccount(id: string, lockedUntil: Date): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        lockedUntil,
      },
    });
  }
}

export const usersRepository = new UsersRepository();
