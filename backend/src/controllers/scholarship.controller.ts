import { Request, Response, NextFunction } from 'express';
import { scholarshipRecommendationSchema } from '@project/shared';
import { scholarshipService } from '../services/scholarship.service.js';

export class ScholarshipController {
  async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Validate request body parameters using Zod schema
      const payload = scholarshipRecommendationSchema.parse(req.body);

      // 2. Evaluate scholarship matches
      const scholarships = await scholarshipService.recommendScholarships(payload);

      res.status(200).json({
        status: 'success',
        data: {
          scholarships,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const scholarshipController = new ScholarshipController();
