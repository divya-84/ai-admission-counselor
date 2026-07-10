import { Request, Response, NextFunction } from 'express';
import { eligibilitySchema } from '@project/shared';
import { eligibilityService } from '../services/eligibility.service.js';

export class EligibilityController {
  async checkEligibility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Validate request body parameters using Zod schema
      const payload = eligibilitySchema.parse(req.body);

      // 2. Evaluate eligibility metrics
      const results = await eligibilityService.checkEligibility(payload);

      res.status(200).json({
        status: 'success',
        data: {
          results,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const eligibilityController = new EligibilityController();
