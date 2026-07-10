import prisma from '../config/database.js';
import logger from '../config/logger.js';

interface RecommendationInput {
  marks: number; // 0 to 100 percentage
  interest: string;
  budget: number;
  careerGoal: string;
  entranceExam?: string;
  entranceScore?: number;
}

interface RecommendedCourseResult {
  id: string;
  code: string;
  name: string;
  tuitionFee: number;
  departmentName: string;
  confidenceScore: number;
  reasons: string[];
}

export class RecommendationService {
  // Static fallback courses in case the database is not populated yet
  private static staticFallbackCourses = [
    {
      id: 'fallback-cs-1',
      code: 'CS-501',
      name: 'M.S. in Computer Science',
      tuitionFee: 22000,
      description:
        'Advanced computer science course with specializations in systems, data science, and cloud computing.',
      departmentName: 'Computer Science & AI',
      tags: ['programming', 'software', 'technology', 'engineer', 'developer', 'coding'],
      gpaRequired: 75,
    },
    {
      id: 'fallback-ai-2',
      code: 'AI-603',
      name: 'Ph.D. in Artificial Intelligence',
      tuitionFee: 25000,
      description:
        'Research focus on deep learning, machine learning models, neural networks, and NLP systems.',
      departmentName: 'Computer Science & AI',
      tags: ['ai', 'research', 'scientist', 'data science', 'machine learning', 'deep learning'],
      gpaRequired: 85,
    },
    {
      id: 'fallback-robotics-3',
      code: 'ME-402',
      name: 'B.S. in Robotics Engineering',
      tuitionFee: 19500,
      description:
        'Undergraduate engineering track in robotics, controls, industrial automation, and kinematics.',
      departmentName: 'Mechanical Engineering',
      tags: ['robotics', 'engineering', 'hardware', 'developer', 'industrial'],
      gpaRequired: 70,
    },
    {
      id: 'fallback-marketing-4',
      code: 'MKT-301',
      name: 'B.B.A. in Marketing',
      tuitionFee: 18000,
      description:
        'Business administration track covering digital marketing, brand management, and consumer analytics.',
      departmentName: 'Administration & Commerce',
      tags: ['marketing', 'business', 'management', 'analytics', 'brand', 'sales'],
      gpaRequired: 65,
    },
    {
      id: 'fallback-fin-5',
      code: 'FIN-401',
      name: 'M.B.A. in Finance',
      tuitionFee: 24000,
      description:
        'Corporate finance management, portfolio analysis, risk management, and banking controls.',
      departmentName: 'Administration & Commerce',
      tags: ['finance', 'business', 'banking', 'investment', 'consultant', 'analyst'],
      gpaRequired: 75,
    },
  ];

  async recommendCourses(input: RecommendationInput): Promise<RecommendedCourseResult[]> {
    try {
      // 1. Fetch courses from database
      const dbCourses = await prisma.course.findMany({
        include: {
          department: true,
        },
      });

      // 2. Map database courses or fallback to static list
      let coursesToScore: {
        id: string;
        code: string;
        name: string;
        tuitionFee: number;
        description: string;
        departmentName: string;
        tags: string[];
        gpaRequired: number;
      }[] = [];
      if (dbCourses.length > 0) {
        coursesToScore = dbCourses.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          tuitionFee: Number(c.tuitionFee),
          description: c.description || '',
          departmentName: c.department?.name || 'General',
          tags: (c.name + ' ' + (c.description || '')).toLowerCase().split(/\s+/),
          gpaRequired: 70, // Default minimum score for DB courses
        }));
      } else {
        logger.warn(
          'No courses found in database for recommendations. Using static fallback courses list.',
        );
        coursesToScore = RecommendationService.staticFallbackCourses;
      }

      const results: RecommendedCourseResult[] = [];

      // 3. Process each course and calculate similarity score
      for (const course of coursesToScore) {
        let score = 0;
        const reasons: string[] = [];

        // Interest Match (30% weight)
        const queryInterest = input.interest.toLowerCase();
        const courseName = course.name.toLowerCase();
        const courseDept = course.departmentName.toLowerCase();

        let interestMatched = false;
        if (courseName.includes(queryInterest) || courseDept.includes(queryInterest)) {
          score += 30;
          interestMatched = true;
        } else {
          // Check tags or description keywords
          const matchedTags = course.tags.filter(
            (tag) => queryInterest.includes(tag) || tag.includes(queryInterest),
          );
          if (matchedTags.length > 0) {
            score += 20;
            interestMatched = true;
          }
        }
        if (interestMatched) {
          reasons.push(`Aligns with your academic interest in "${input.interest}"`);
        }

        // Career Goal Match (30% weight)
        const queryGoal = input.careerGoal.toLowerCase();
        const goalWords = queryGoal.split(/\s+/).filter((w) => w.length > 3);
        let goalWordsMatched = 0;

        for (const word of goalWords) {
          if (
            courseName.includes(word) ||
            course.description.toLowerCase().includes(word) ||
            course.tags.includes(word)
          ) {
            goalWordsMatched++;
          }
        }

        if (goalWordsMatched > 0) {
          const matchPercent = Math.min(
            (goalWordsMatched / Math.max(goalWords.length, 1)) * 30,
            30,
          );
          score += matchPercent;
          reasons.push(`Offers curriculum matching your career goal: "${input.careerGoal}"`);
        }

        // Budget Match (20% weight)
        if (course.tuitionFee <= input.budget) {
          score += 20;
          reasons.push(
            `Tuition fee ($${course.tuitionFee.toLocaleString()}/yr) is fully within your budget limit`,
          );
        } else {
          // Soft penalty if slightly above budget
          const diff = course.tuitionFee - input.budget;
          if (diff <= 3000) {
            score += 10;
            reasons.push(
              `Tuition fee is slightly above budget (by $${diff.toLocaleString()}/yr) but has financial aid options`,
            );
          } else {
            // High budget exceed, exclude or heavily penalize
            score -= 10;
          }
        }

        // Academic Entry Requirements / Marks Match (20% weight)
        if (input.marks >= course.gpaRequired) {
          score += 20;
          reasons.push(
            `Your academic score (${input.marks}%) satisfies course requirements (Min: ${course.gpaRequired}%)`,
          );
        } else {
          const gap = course.gpaRequired - input.marks;
          if (gap <= 10) {
            score += 5;
            reasons.push(
              `Your score is close to the requirements (gap: ${gap}%) - admission possible with counselor review`,
            );
          } else {
            score -= 15;
          }
        }

        // Normalize score between 0 and 100
        const confidenceScore = Math.max(0, Math.min(100, Math.round(score)));

        // Filter out courses that are highly irrelevant
        if (confidenceScore >= 35) {
          results.push({
            id: course.id,
            code: course.code,
            name: course.name,
            tuitionFee: course.tuitionFee,
            departmentName: course.departmentName,
            confidenceScore,
            reasons,
          });
        }
      }

      // 4. Sort by confidence score descending
      return results.sort((a, b) => b.confidenceScore - a.confidenceScore);
    } catch (err) {
      logger.error('Recommendation engine processing exception:', err);
      throw err;
    }
  }
}

export const recommendationService = new RecommendationService();
