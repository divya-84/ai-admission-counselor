import { Student, Prisma } from '@prisma/client';
import prisma from '../config/database.js';

export class StudentsRepository {
  async createStudent(data: Prisma.StudentCreateInput): Promise<Student> {
    return prisma.student.create({
      data,
    });
  }

  async findByUserId(userId: string): Promise<Student | null> {
    return prisma.student.findUnique({
      where: { userId },
    });
  }

  async update(id: string, updates: Prisma.StudentUpdateInput): Promise<Student> {
    return prisma.student.update({
      where: { id },
      data: updates,
    });
  }
}

export const studentsRepository = new StudentsRepository();
