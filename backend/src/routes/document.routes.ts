import { Router, RequestHandler } from 'express';
import multer from 'multer';
import { documentController } from '../controllers/document.controller.js';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Configure Multer memory storage (extracts buffer directly for OCR)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Student document vault uploads and list
router.post(
  '/upload',
  authenticateJWT as RequestHandler,
  upload.single('file') as RequestHandler,
  documentController.uploadDocument as RequestHandler,
);

router.get(
  '/list',
  authenticateJWT as RequestHandler,
  documentController.listDocuments as RequestHandler,
);

// Counselor/Admin manual verification endpoints
router.post(
  '/verify/:id',
  authenticateJWT as RequestHandler,
  requireRoles('COUNSELOR', 'ADMIN') as RequestHandler,
  documentController.verifyDocument as RequestHandler,
);

// Global Institutional PDF Upload/List
router.post(
  '/global-upload',
  authenticateJWT as RequestHandler,
  requireRoles('COUNSELOR', 'ADMIN') as RequestHandler,
  upload.single('file') as RequestHandler,
  documentController.uploadGlobalDocument as RequestHandler,
);

router.get(
  '/global-list',
  authenticateJWT as RequestHandler,
  documentController.listGlobalDocuments as RequestHandler,
);

export default router;
