import { Prisma, UserSession } from '@prisma/client';
import prisma from '../config/database.js';

export class SessionsRepository {
  async createSession(data: Prisma.UserSessionUncheckedCreateInput): Promise<UserSession> {
    return prisma.userSession.create({
      data,
    });
  }

  async findSessionByHash(tokenHash: string): Promise<UserSession | null> {
    return prisma.userSession.findUnique({
      where: { tokenHash },
      include: {
        user: true,
      },
    });
  }

  async deleteSessionByHash(tokenHash: string): Promise<UserSession | null> {
    try {
      return await prisma.userSession.delete({
        where: { tokenHash },
      });
    } catch {
      return null;
    }
  }

  async deleteUserSessions(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.userSession.deleteMany({
      where: { userId },
    });
  }

  async deleteExpiredSessions(): Promise<Prisma.BatchPayload> {
    return prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActive: 'desc' },
    });
  }
}

export const sessionsRepository = new SessionsRepository();
