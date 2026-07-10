import { Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class AnalyticsController {
  // 1. Get Analytics Statistics
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await analyticsService.calculateStats();
      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();
