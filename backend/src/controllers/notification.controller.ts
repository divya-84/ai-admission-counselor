import { Response, NextFunction } from 'express';
import { sendNotificationSchema } from '@project/shared';
import { notificationService } from '../services/notification.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class NotificationController {
  // 1. Get Notification List
  async listNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const notifications = await notificationService.listNotifications(userId);
      res.status(200).json({
        status: 'success',
        data: {
          notifications,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // 2. Mark as read
  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const notification = await notificationService.markAsRead(id, userId);

      res.status(200).json({
        status: 'success',
        data: {
          notification,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // 3. Mark all as read
  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      await notificationService.markAllAsRead(userId);

      res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read',
      });
    } catch (err) {
      next(err);
    }
  }

  // 4. Send Notification (Simulator Endpoint)
  async sendNotification(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const payload = sendNotificationSchema.parse(req.body);
      const result = await notificationService.sendNotification(payload);

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
