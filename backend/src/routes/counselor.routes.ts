import { Router, RequestHandler } from 'express';
import { counselorController } from '../controllers/counselor.controller.js';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply JWT authentication and enforce COUNSELOR or ADMIN role access
router.use(authenticateJWT as RequestHandler);
router.use(requireRoles('COUNSELOR', 'ADMIN') as RequestHandler);

// Endpoint to list all registered students
router.get('/students', counselorController.listStudents as RequestHandler);

export default router;
