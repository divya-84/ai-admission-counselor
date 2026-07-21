import { Router, RequestHandler } from 'express';
import { studentController } from '../controllers/student.controller.js';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply JWT authentication and enforce STUDENT role access
router.use(authenticateJWT as RequestHandler);
router.use(requireRoles('STUDENT') as RequestHandler);

// Profile routes
router.get('/profile', studentController.getProfile as RequestHandler);
router.put('/profile', studentController.updateProfile as RequestHandler);

export default router;
