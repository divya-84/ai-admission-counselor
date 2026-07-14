import { Router, RequestHandler } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rate-limiter.middleware.js';

const router = Router();

// Public routes (Rate limited for security)
router.post('/register', authLimiter as RequestHandler, authController.register as RequestHandler);
router.post('/login', authLimiter as RequestHandler, authController.login as RequestHandler);
router.post('/refresh', authController.refresh as RequestHandler);
router.get(
  '/verify-email',
  authLimiter as RequestHandler,
  authController.verifyEmail as RequestHandler,
);
router.post(
  '/resend-verification',
  authLimiter as RequestHandler,
  authController.resendVerification as RequestHandler,
);
router.post(
  '/forgot-password',
  authLimiter as RequestHandler,
  authController.forgotPassword as RequestHandler,
);
router.post(
  '/reset-password',
  authLimiter as RequestHandler,
  authController.resetPassword as RequestHandler,
);
router.get('/diagnose', authController.diagnoseEmail as RequestHandler);

// Protected routes
router.post('/logout', authenticateJWT as RequestHandler, authController.logout as RequestHandler);
router.post(
  '/logout-all',
  authenticateJWT as RequestHandler,
  authController.logoutAll as RequestHandler,
);
router.post(
  '/change-password',
  authenticateJWT as RequestHandler,
  authController.changePassword as RequestHandler,
);
router.get(
  '/sessions',
  authenticateJWT as RequestHandler,
  authController.getActiveSessions as RequestHandler,
);

export default router;
