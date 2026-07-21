import { Router, RequestHandler } from 'express';
import { counselorController } from '../controllers/counselor.controller.js';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply JWT authentication and enforce COUNSELOR or ADMIN role access
router.use(authenticateJWT as RequestHandler);
router.use(requireRoles('COUNSELOR', 'ADMIN') as RequestHandler);

// Endpoint to list all registered students
router.get('/students', counselorController.listStudents as RequestHandler);

// Endpoint to fetch complete student details
router.get('/students/:studentId', counselorController.getStudentDetails as RequestHandler);
router.get('/students/id/:studentId', counselorController.getStudentDetails as RequestHandler);

// Endpoint to list all available courses for counselors
router.get('/courses', counselorController.listCourses as RequestHandler);

// Endpoint to offer/assign a course to a student or update remarks
router.post('/students/:id/offer', counselorController.offerCourse as RequestHandler);
router.post('/students/:studentId/offer', counselorController.offerCourse as RequestHandler);

export default router;
