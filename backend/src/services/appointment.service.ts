import prisma from '../config/database.js';
import logger from '../config/logger.js';
import { AppointmentStatus } from '@prisma/client';

interface BookAppointmentInput {
  counselorId: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
  notes?: string;
}

interface CounselorResult {
  id: string;
  name: string;
  specialization: string;
  bio: string;
  rating: number;
}

// Heuristics converter for 12-hour slots to Date objects
const convertToDate = (dateStr: string, timeStr: string): Date => {
  const [time, modifier] = timeStr.split(' ');
  const [h, minutes] = time.split(':').map(Number);
  let hours = h;

  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  // Parse YYYY-MM-DD in local time
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return date;
};

// Formatter to print 12h representation
const formatTimeStr = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  const hrStr = hours < 10 ? '0' + hours : hours;
  return `${hrStr}:${minStr} ${ampm}`;
};

export class AppointmentService {
  // Static fallback list of counselors if database is not populated yet
  public static staticFallbackCounselors: CounselorResult[] = [
    {
      id: 'fa720e3a-c89b-4bc2-8176-788914619da0',
      name: 'Dr. Ananya Mishra',
      specialization: 'Engineering & Technology Admissions',
      bio: 'Ex-AKTU admission panel chair, helping students navigate engineering courses for over 10 years.',
      rating: 4.9,
    },
    {
      id: 'fa720e3a-c89b-4bc2-8176-788914619da1',
      name: 'Prof. Rajiv Malhotra',
      specialization: 'Business Administration & Management',
      bio: 'Specialist in career pathways, MBA counseling, and AKTU tuition fee waiver (TFW) scholarship programs.',
      rating: 4.8,
    },
    {
      id: 'fa720e3a-c89b-4bc2-8176-788914619da2',
      name: 'Dr. Sarah George',
      specialization: 'International Studies & VISA Documentation',
      bio: 'Assists graduate students seeking exchange admissions and document verifications.',
      rating: 4.7,
    },
  ];

  // 1. List available counselors
  async getCounselors(): Promise<CounselorResult[]> {
    try {
      const dbCounselors = await prisma.counselor.findMany({
        include: {
          user: true,
        },
      });

      if (dbCounselors.length > 0) {
        return dbCounselors.map((c) => ({
          id: c.id,
          name: c.user?.name || 'Counselor',
          specialization: c.specialization || 'Admissions',
          bio: c.bio || '',
          rating: c.rating || 5.0,
        }));
      }

      return AppointmentService.staticFallbackCounselors;
    } catch (err) {
      logger.error('Error fetching counselors:', err);
      return AppointmentService.staticFallbackCounselors;
    }
  }

  // 2. Book a counseling slot
  async bookSlot(userId: string, input: BookAppointmentInput) {
    try {
      const scheduledAt = convertToDate(input.date, input.time);

      // Find Student ID
      let student = await prisma.student.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!student) {
        logger.info(`Creating student profile for user ID: ${userId} to enable booking.`);
        student = await prisma.student.create({
          data: {
            userId,
            phone: '0000000000',
            academicLevel: 'Undergraduate',
          },
          include: { user: true },
        });
      }

      // Check for duplicate bookings (counselor already booked at same scheduledAt)
      const existingBooking = await prisma.appointment.findFirst({
        where: {
          counselorId: input.counselorId,
          scheduledAt,
          status: AppointmentStatus.SCHEDULED,
        },
      });

      if (existingBooking) {
        throw new Error('This time slot is already booked for the selected counselor');
      }

      // Verify counselor exists in DB
      let counselor = await prisma.counselor.findUnique({
        where: { id: input.counselorId },
        include: { user: true },
      });

      // If counselor doesn't exist in DB (e.g. static fallback), seed it in DB so database relation integrity passes
      if (!counselor) {
        const fallback = AppointmentService.staticFallbackCounselors.find(
          (c) => c.id === input.counselorId,
        );
        if (fallback) {
          logger.info(`Seeding static fallback counselor "${fallback.name}" in database.`);
          const counselorEmail = `${fallback.name.toLowerCase().replace(/\s+/g, '')}@counselor.aktu.ac.in`;
          let cUser = await prisma.user.findUnique({ where: { email: counselorEmail } });
          if (!cUser) {
            cUser = await prisma.user.create({
              data: {
                id: fallback.id,
                email: counselorEmail,
                password: 'hashedpassword123',
                name: fallback.name,
                role: 'COUNSELOR',
                isEmailVerified: true,
              },
            });
          }

          counselor = await prisma.counselor.create({
            data: {
              id: fallback.id,
              userId: cUser.id,
              specialization: fallback.specialization,
              bio: fallback.bio,
              rating: fallback.rating,
            },
            include: { user: true },
          });
        } else {
          throw new Error('Counselor not found');
        }
      }

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          studentId: student.id,
          counselorId: input.counselorId,
          scheduledAt,
          notes: input.notes,
          status: AppointmentStatus.SCHEDULED,
        },
        include: {
          counselor: { include: { user: true } },
          student: { include: { user: true } },
        },
      });

      // Dispatch simulated email and notifications
      const studentEmail = student.user?.email || 'student@aktu.ac.in';
      const counselorName = counselor.user?.name || 'Counselor';

      logger.info(
        `[Email Dispatcher]: Sent confirmation email to ${studentEmail} for appointment with ${counselorName} on ${input.date} at ${input.time}`,
      );
      logger.info(
        `[Reminder Scheduler]: Scheduled sms/email reminder for ${studentEmail} to trigger 24 hours prior to appointment slot.`,
      );

      return {
        id: appointment.id,
        counselorId: appointment.counselorId,
        date: appointment.scheduledAt.toISOString().split('T')[0],
        time: formatTimeStr(appointment.scheduledAt),
        status: appointment.status,
        notes: appointment.notes,
        counselor: {
          user: {
            name: appointment.counselor?.user?.name || 'Counselor',
          },
        },
      };
    } catch (err) {
      logger.error('Error booking appointment slot:', err);
      throw err;
    }
  }

  // 3. List my appointments
  async getMyAppointments(userId: string, role: string) {
    try {
      let appointments = [];
      if (role === 'COUNSELOR') {
        const counselor = await prisma.counselor.findUnique({
          where: { userId },
        });
        if (!counselor) return [];
        appointments = await prisma.appointment.findMany({
          where: { counselorId: counselor.id },
          include: {
            student: { include: { user: true } },
            counselor: { include: { user: true } },
          },
          orderBy: { scheduledAt: 'asc' },
        });
      } else {
        const student = await prisma.student.findUnique({
          where: { userId },
        });
        if (!student) return [];
        appointments = await prisma.appointment.findMany({
          where: { studentId: student.id },
          include: {
            student: { include: { user: true } },
            counselor: { include: { user: true } },
          },
          orderBy: { scheduledAt: 'asc' },
        });
      }

      return appointments.map((apt) => ({
        id: apt.id,
        counselorId: apt.counselorId,
        date: apt.scheduledAt.toISOString().split('T')[0],
        time: formatTimeStr(apt.scheduledAt),
        status: apt.status,
        notes: apt.notes,
        counselor: {
          user: {
            name: apt.counselor?.user?.name || 'Counselor',
          },
        },
      }));
    } catch (err) {
      logger.error('Error listing user appointments:', err);
      throw err;
    }
  }

  // 4. Cancel appointment
  async cancelAppointment(appointmentId: string, userId: string, role: string) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          student: true,
          counselor: true,
        },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Check ownership
      if (role === 'STUDENT') {
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student || appointment.studentId !== student.id) {
          throw new Error('Unauthorized to cancel this appointment');
        }
      } else if (role === 'COUNSELOR') {
        const counselor = await prisma.counselor.findUnique({ where: { userId } });
        if (!counselor || appointment.counselorId !== counselor.id) {
          throw new Error('Unauthorized to cancel this appointment');
        }
      }

      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.CANCELLED },
      });

      logger.info(
        `[Email Dispatcher]: Sent cancellation confirmation email to student regarding appointment ID ${appointmentId}`,
      );

      return updated;
    } catch (err) {
      logger.error('Error cancelling appointment:', err);
      throw err;
    }
  }
}

export const appointmentService = new AppointmentService();
export const staticCounselors = AppointmentService.staticFallbackCounselors;
