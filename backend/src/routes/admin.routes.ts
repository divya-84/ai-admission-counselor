import { Router, RequestHandler } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply JWT authentication and ADMIN role check to all admin endpoints
router.use(authenticateJWT as RequestHandler);
router.use(requireRoles('ADMIN') as RequestHandler);

// 1. Settings (AI + Rules)
router.get('/settings', adminController.getSettings as RequestHandler);
router.post('/ai-settings', adminController.updateAISettings as RequestHandler);
router.post('/rules', adminController.updateAdmissionRules as RequestHandler);

// 2. Users
router.get('/users', adminController.listUsers as RequestHandler);
router.put('/users/:id/role', adminController.updateUserRole as RequestHandler);
router.delete('/users/:id', adminController.deleteUser as RequestHandler);

// 3. Departments
router.get('/departments', adminController.listDepartments as RequestHandler);
router.post('/departments', adminController.createDepartment as RequestHandler);
router.delete('/departments/:id', adminController.deleteDepartment as RequestHandler);

// 4. Courses
router.get('/courses', adminController.listCourses as RequestHandler);
router.post('/courses', adminController.createCourse as RequestHandler);
router.delete('/courses/:id', adminController.deleteCourse as RequestHandler);

// 5. Scholarships
router.get('/scholarships', adminController.listScholarships as RequestHandler);
router.post('/scholarships', adminController.createScholarship as RequestHandler);
router.delete('/scholarships/:id', adminController.deleteScholarship as RequestHandler);

// 6. Documents
router.get('/documents', adminController.listDocuments as RequestHandler);
router.post('/documents/:id/verify', adminController.verifyDocument as RequestHandler);

// 7. Knowledge Base (RAG chunks)
router.get('/kb', adminController.listKnowledgeBaseChunks as RequestHandler);

export default router;
