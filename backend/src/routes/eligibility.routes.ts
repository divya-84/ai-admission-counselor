import { Router, RequestHandler } from 'express';
import { eligibilityController } from '../controllers/eligibility.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protected eligibility check API
router.post(
  '/check',
  authenticateJWT as RequestHandler,
  eligibilityController.checkEligibility as RequestHandler,
);

export default router;
