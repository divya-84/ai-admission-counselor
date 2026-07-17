import { Response, NextFunction } from 'express';
import { bookAppointmentSchema } from '@project/shared';
import { appointmentService } from '../services/appointment.service.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AppointmentController {
  // 1. Get Counselor List
  async getCounselors(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const counselors = await appointmentService.getCounselors();
      res.status(200).json({
        status: 'success',
        data: {
          counselors,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // 2. Book Slot
  async bookSlot(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = bookAppointmentSchema.parse(req.body);
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const appointment = await appointmentService.bookSlot(userId, payload);

      res.status(201).json({
        status: 'success',
        data: {
          appointment,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // 3. Get User Appointments
  async getMyAppointments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      const role = req.user?.role;
      if (!userId || !role) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const appointments = await appointmentService.getMyAppointments(userId, role);

      res.status(200).json({
        status: 'success',
        data: {
          appointments,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // 4. Cancel Appointment
  async cancelAppointment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const role = req.user?.role;
      if (!userId || !role) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const appointment = await appointmentService.cancelAppointment(id, userId, role);

      res.status(200).json({
        status: 'success',
        data: {
          appointment,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const appointmentController = new AppointmentController();
