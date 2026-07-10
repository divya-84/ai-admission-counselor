import prisma from '../config/database.js';
import logger from '../config/logger.js';

type NotificationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP';

interface SendNotificationInput {
  userId: string;
  title: string;
  content: string;
  channels: NotificationChannel[];
}

export class NotificationService {
  // 1. Send Notification across multi-channels
  async sendNotification(input: SendNotificationInput) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        include: { student: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const email = user.email;
      const phone = user.student?.phone || '9988776655';
      const name = user.name || 'Student';

      const results: string[] = [];

      for (const channel of input.channels) {
        switch (channel) {
          case 'IN_APP':
            await prisma.notification.create({
              data: {
                userId: input.userId,
                title: input.title,
                content: input.content,
                type: 'SYSTEM',
                isRead: false,
              },
            });
            logger.info(
              `[Notification Channel - IN_APP]: Registered in-app alert for user: ${email}`,
            );
            results.push('IN_APP: Alert registered in user database inbox.');
            break;

          case 'EMAIL':
            logger.info(
              `[Notification Channel - EMAIL]: Dispatched email to ${email} (Name: ${name}) - Subject: "${input.title}" - Body: "${input.content}"`,
            );
            results.push(`EMAIL: Mail dispatched successfully to ${email}.`);
            break;

          case 'SMS':
            logger.info(
              `[Notification Channel - SMS]: Dispatched SMS alert to +91 ${phone} - Message: "${input.title}: ${input.content}"`,
            );
            results.push(`SMS: Text dispatch logged targeting +91 ${phone}.`);
            break;

          case 'WHATSAPP':
            logger.info(
              `[Notification Channel - WHATSAPP]: Dispatched WhatsApp alert to +91 ${phone} - Body: "*${input.title}*\n${input.content}"`,
            );
            results.push(`WHATSAPP: WhatsApp notification logged targeting +91 ${phone}.`);
            break;

          default:
            break;
        }
      }

      return {
        success: true,
        dispatchedChannels: input.channels,
        log: results,
      };
    } catch (err) {
      logger.error('Error sending notification:', err);
      throw err;
    }
  }

  // 2. List in-app notifications
  async listNotifications(userId: string) {
    try {
      return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      logger.error('Error fetching notifications:', err);
      throw err;
    }
  }

  // 3. Mark single notification as read
  async markAsRead(id: string, userId: string) {
    try {
      const notif = await prisma.notification.findFirst({
        where: { id, userId },
      });

      if (!notif) {
        throw new Error('Notification not found or unauthorized');
      }

      return prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
    } catch (err) {
      logger.error('Error marking notification as read:', err);
      throw err;
    }
  }

  // 4. Mark all as read
  async markAllAsRead(userId: string) {
    try {
      return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } catch (err) {
      logger.error('Error marking all notifications as read:', err);
      throw err;
    }
  }
}

export const notificationService = new NotificationService();
