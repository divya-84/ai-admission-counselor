import { Router, RequestHandler } from 'express';
import { scholarshipController } from '../controllers/scholarship.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protected scholarship recommendation API
router.post(
  '/recommend',
  authenticateJWT as RequestHandler,
  scholarshipController.getRecommendations as RequestHandler,
);

export default router;
