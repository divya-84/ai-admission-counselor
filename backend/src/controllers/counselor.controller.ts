import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import prisma from '../config/database.js';
import logger from '../config/logger.js';

export class CounselorController {
  async listStudents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info(
        `Counselor listStudents called by user: ${req.user?.email} (ID: ${req.user?.id})`,
      );

      const students = await prisma.student.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          admissions: {
            include: {
              course: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      logger.info(`Retrieved ${students.length} students from the database.`);
      res.status(200).json({
        status: 'success',
        data: { students },
      });
    } catch (err) {
      logger.error('Error fetching students for counselor dashboard:', err);
      next(err);
    }
  }
}

export const counselorController = new CounselorController();
