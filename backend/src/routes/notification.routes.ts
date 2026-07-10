import { Router, RequestHandler } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Protected notification APIs
router.get(
  '/list',
  authenticateJWT as RequestHandler,
  notificationController.listNotifications as RequestHandler,
);

router.post(
  '/read/:id',
  authenticateJWT as RequestHandler,
  notificationController.markAsRead as RequestHandler,
);

router.post(
  '/read-all',
  authenticateJWT as RequestHandler,
  notificationController.markAllAsRead as RequestHandler,
);

router.post(
  '/send',
  authenticateJWT as RequestHandler,
  notificationController.sendNotification as RequestHandler,
);

export default router;
