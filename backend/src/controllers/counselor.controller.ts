import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import prisma from '../config/database.js';
import logger from '../config/logger.js';
import { AdmissionStatus } from '@prisma/client';

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
                  id: true,
                  name: true,
                  code: true,
                  tuitionFee: true,
                  requirements: true,
                  department: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          documents: true,
          scholarships: {
            include: {
              scholarship: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const formattedStudents = students.map((student) => {
        const firstAdmission = student.admissions[0];
        return {
          ...student,
          _id: student.id,
          id: student.id,
          applicationId: firstAdmission?.id || student.id,
          name: student.user?.name || student.user?.email || 'Anonymous Student',
          email: student.user?.email || '',
          status: firstAdmission?.status || 'PENDING',
        };
      });

      logger.info(`Retrieved ${formattedStudents.length} students from the database.`);
      res.status(200).json({
        status: 'success',
        data: { students: formattedStudents },
      });
    } catch (err) {
      logger.error('Error fetching students for counselor dashboard:', err);
      next(err);
    }
  }

  async getStudentDetails(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const studentId = req.params.studentId || req.params.id;
      logger.info(`Counselor getStudentDetails called for studentId: ${studentId}`);

      if (!studentId) {
        res.status(400).json({
          status: 'error',
          message: 'Student ID is required.',
        });
        return;
      }

      let student = await prisma.student.findUnique({
        where: { id: studentId },
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
                include: {
                  department: true,
                },
              },
            },
          },
          documents: true,
          scholarships: {
            include: {
              scholarship: true,
            },
          },
        },
      });

      if (!student) {
        student = await prisma.student.findUnique({
          where: { userId: studentId },
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
                  include: {
                    department: true,
                  },
                },
              },
            },
            documents: true,
            scholarships: {
              include: {
                scholarship: true,
              },
            },
          },
        });
      }

      if (!student) {
        res.status(404).json({
          status: 'error',
          message: 'Student record not found in database.',
        });
        return;
      }

      // Automatically create counselor profile if missing for counselor role
      if (req.user?.role === 'COUNSELOR') {
        const counselor = await prisma.counselor.findUnique({
          where: { userId: req.user.id },
        });

        if (!counselor) {
          await prisma.counselor
            .create({
              data: {
                userId: req.user.id,
                specialization: 'General Admissions',
                bio: 'Academic Counselor',
              },
            })
            .catch((e) => logger.warn(`Auto-create counselor profile skipped: ${e.message}`));
        }
      }

      const formattedStudent = {
        ...student,
        _id: student.id,
        id: student.id,
        name: student.user?.name || 'Anonymous Student',
        email: student.user?.email || '',
      };

      res.status(200).json({
        status: 'success',
        data: { student: formattedStudent },
      });
    } catch (err) {
      logger.error('Error fetching student details for counselor:', err);
      next(err);
    }
  }

  async listCourses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info(`Counselor listCourses called by user: ${req.user?.email}`);
      const courses = await prisma.course.findMany({
        include: {
          department: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          code: 'asc',
        },
      });

      res.status(200).json({
        status: 'success',
        data: { courses },
      });
    } catch (err) {
      logger.error('Error fetching courses for counselor:', err);
      next(err);
    }
  }

  async offerCourse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.params.id || req.params.studentId;
      const { courseId, status, appliedIntake, notes } = req.body;

      logger.info(
        `Counselor offerCourse called for student ${studentId} by counselor user: ${req.user?.email}`,
      );

      let student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        student = await prisma.student.findUnique({
          where: { userId: studentId },
        });
      }

      if (!student) {
        res.status(404).json({
          status: 'error',
          message: 'Student not found.',
        });
        return;
      }

      // Find or create counselor record associated with user
      let counselor = await prisma.counselor.findUnique({
        where: { userId: req.user?.id },
      });

      if (!counselor && req.user?.id) {
        counselor = await prisma.counselor
          .create({
            data: {
              userId: req.user.id,
              specialization: 'General Admissions',
            },
          })
          .catch(() => null);
      }

      // Check for existing admissions
      const existingAdmissions = await prisma.admission.findMany({
        where: { studentId: student.id },
      });

      let admission;
      let admissionStatus: AdmissionStatus = AdmissionStatus.UNDER_REVIEW;
      if (status && Object.values(AdmissionStatus).includes(status as AdmissionStatus)) {
        admissionStatus = status as AdmissionStatus;
      }

      if (existingAdmissions.length > 0) {
        admission = await prisma.admission.update({
          where: { id: existingAdmissions[0].id },
          data: {
            courseId: courseId || existingAdmissions[0].courseId,
            counselorId: counselor?.id || existingAdmissions[0].counselorId,
            status: admissionStatus,
            appliedIntake: appliedIntake || existingAdmissions[0].appliedIntake || 'Fall 2026',
            notes: notes !== undefined ? notes : existingAdmissions[0].notes,
          },
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                tuitionFee: true,
                requirements: true,
                department: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });
      } else {
        let targetCourseId = courseId;
        if (!targetCourseId) {
          const firstCourse = await prisma.course.findFirst();
          targetCourseId = firstCourse?.id;
        }

        if (!targetCourseId) {
          res.status(400).json({
            status: 'error',
            message: 'No courses present in database to assign admission.',
          });
          return;
        }

        admission = await prisma.admission.create({
          data: {
            studentId: student.id,
            courseId: targetCourseId,
            counselorId: counselor?.id,
            status: admissionStatus,
            appliedIntake: appliedIntake || 'Fall 2026',
            notes: notes || 'Updated by counselor',
          },
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                tuitionFee: true,
                requirements: true,
                department: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });
      }

      res.status(200).json({
        status: 'success',
        data: { admission },
      });
    } catch (err) {
      logger.error('Error offering course or saving remarks:', err);
      next(err);
    }
  }
}

export const counselorController = new CounselorController();
