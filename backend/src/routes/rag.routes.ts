import { Router, RequestHandler } from 'express';
import multer from 'multer';
import { ragController } from '../controllers/rag.controller.js';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Multer memory storage configuration for single file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit 10MB
  },
});

router.post(
  '/upload',
  authenticateJWT as RequestHandler,
  requireRoles('ADMIN', 'COUNSELOR', 'HOD') as RequestHandler,
  upload.single('file') as RequestHandler,
  ragController.uploadDocument as RequestHandler,
);

export default router;
