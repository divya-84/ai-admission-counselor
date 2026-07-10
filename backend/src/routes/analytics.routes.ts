import { Router, RequestHandler } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticateJWT, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Protected analytics APIs, restricted to COUNSELOR, HOD, and ADMIN roles
router.get(
  '/stats',
  authenticateJWT as RequestHandler,
  requireRoles('COUNSELOR', 'HOD', 'ADMIN') as RequestHandler,
  analyticsController.getStats as RequestHandler,
);

export default router;
