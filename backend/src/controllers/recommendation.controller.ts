import { Request, Response, NextFunction } from 'express';
import { recommendationSchema } from '@project/shared';
import { recommendationService } from '../services/recommendation.service.js';

export class RecommendationController {
  async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Validate request body parameters using Zod schema
      const payload = recommendationSchema.parse(req.body);

      // 2. Process recommendations
      const recommendations = await recommendationService.recommendCourses(payload);

      res.status(200).json({
        status: 'success',
        data: {
          recommendations,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const recommendationController = new RecommendationController();
