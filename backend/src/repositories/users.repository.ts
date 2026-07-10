import { Prisma, User } from '@prisma/client';
import prisma from '../config/database.js';

export class UsersRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
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
}

export const usersRepository = new UsersRepository();
