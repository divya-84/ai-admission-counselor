import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import prisma from '../config/database.js';
import logger from '../config/logger.js';

export class StudentController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      logger.info(`Fetching student profile for user ID: ${userId}`);

      const student = await prisma.student.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          admissions: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!student) {
        res.status(404).json({
          status: 'error',
          message: 'Student profile not found.',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: { student },
      });
    } catch (err) {
      logger.error('Error fetching student profile:', err);
      next(err);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      logger.info(`Updating student profile for user ID: ${userId}`);

      const student = await prisma.student.findUnique({
        where: { userId },
      });

      if (!student) {
        res.status(404).json({
          status: 'error',
          message: 'Student record not found.',
        });
        return;
      }

      const {
        phone,
        dateOfBirth,
        gender,
        address,
        city,
        state,
        pinCode,
        nationality,
        academicLevel,
        highSchoolName,
        gpa,
        testScores,
        preferredCountry,
        preferredIntake,
        preferredCampus,
        qualification,
        boardUniversity,
        passingYear,
        percentage,
        backlogs,
        fatherName,
        motherName,
        guardianContact,
        fullname,
      } = req.body;

      // Update student profile
      const updatedStudent = await prisma.student.update({
        where: { id: student.id },
        data: {
          phone: phone !== undefined ? phone : student.phone,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : student.dateOfBirth,
          gender: gender !== undefined ? gender : student.gender,
          address: address !== undefined ? address : student.address,
          city: city !== undefined ? city : student.city,
          state: state !== undefined ? state : student.state,
          pinCode: pinCode !== undefined ? pinCode : student.pinCode,
          nationality: nationality !== undefined ? nationality : student.nationality,
          academicLevel: academicLevel !== undefined ? academicLevel : student.academicLevel,
          highSchoolName: highSchoolName !== undefined ? highSchoolName : student.highSchoolName,
          gpa: gpa !== undefined ? Number(gpa) : student.gpa,
          testScores: testScores !== undefined ? testScores : student.testScores,
          preferredCountry:
            preferredCountry !== undefined ? preferredCountry : student.preferredCountry,
          preferredIntake:
            preferredIntake !== undefined ? preferredIntake : student.preferredIntake,
          preferredCampus:
            preferredCampus !== undefined ? preferredCampus : student.preferredCampus,
          qualification: qualification !== undefined ? qualification : student.qualification,
          boardUniversity:
            boardUniversity !== undefined ? boardUniversity : student.boardUniversity,
          passingYear: passingYear !== undefined ? Number(passingYear) : student.passingYear,
          percentage: percentage !== undefined ? Number(percentage) : student.percentage,
          backlogs: backlogs !== undefined ? Number(backlogs) : student.backlogs,
          fatherName: fatherName !== undefined ? fatherName : student.fatherName,
          motherName: motherName !== undefined ? motherName : student.motherName,
          guardianContact:
            guardianContact !== undefined ? guardianContact : student.guardianContact,
        },
      });

      // Update user full name if provided
      if (fullname) {
        await prisma.user.update({
          where: { id: userId },
          data: { name: fullname },
        });
      }

      res.status(200).json({
        status: 'success',
        data: { student: updatedStudent },
      });
    } catch (err) {
      logger.error('Error updating student profile:', err);
      next(err);
    }
  }
}

export const studentController = new StudentController();
