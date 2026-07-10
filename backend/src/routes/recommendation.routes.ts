import { Router, RequestHandler } from 'express';
import { recommendationController } from '../controllers/recommendation.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protected course recommendation API
router.post(
  '/recommend',
  authenticateJWT as RequestHandler,
  recommendationController.getRecommendations as RequestHandler,
);

export default router;
