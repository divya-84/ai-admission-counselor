import { Router, RequestHandler } from 'express';
import { appointmentController } from '../controllers/appointment.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protected appointment scheduling APIs
router.get(
  '/counselors',
  authenticateJWT as RequestHandler,
  appointmentController.getCounselors as RequestHandler,
);

router.post(
  '/book',
  authenticateJWT as RequestHandler,
  appointmentController.bookSlot as RequestHandler,
);

router.get(
  '/my-appointments',
  authenticateJWT as RequestHandler,
  appointmentController.getMyAppointments as RequestHandler,
);

router.post(
  '/cancel/:id',
  authenticateJWT as RequestHandler,
  appointmentController.cancelAppointment as RequestHandler,
);

export default router;
