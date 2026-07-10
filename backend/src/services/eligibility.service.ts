import prisma from '../config/database.js';
import logger from '../config/logger.js';

interface EligibilityInput {
  marks: number;
  reservation: string;
  entranceExam?: string;
  entranceScore?: number;
  age: number;
  subjects: string[];
}

interface ChecklistItem {
  passed: boolean;
  message: string;
}

interface EligibilityResult {
  id: string;
  code: string;
  name: string;
  departmentName: string;
  isEligible: boolean;
  checklist: {
    marks: ChecklistItem;
    age: ChecklistItem;
    subjects: ChecklistItem;
    entranceExam: ChecklistItem;
  };
  reasons: string[];
}

export class EligibilityService {
  // Static fallback courses with explicit admission criteria
  private static staticFallbackCourses = [
    {
      id: 'fallback-cs-1',
      code: 'CS-501',
      name: 'M.S. in Computer Science',
      departmentName: 'Computer Science & AI',
      gpaRequired: 75,
      minAge: 20,
      maxAge: 45,
      requiredSubjects: ['Mathematics', 'Programming'],
      entranceExam: 'GRE',
      minEntranceScore: 300,
    },
    {
      id: 'fallback-ai-2',
      code: 'AI-603',
      name: 'Ph.D. in Artificial Intelligence',
      departmentName: 'Computer Science & AI',
      gpaRequired: 85,
      minAge: 22,
      maxAge: 50,
      requiredSubjects: ['Mathematics', 'Programming', 'Machine Learning'],
      entranceExam: 'GRE',
      minEntranceScore: 315,
    },
    {
      id: 'fallback-robotics-3',
      code: 'ME-402',
      name: 'B.S. in Robotics Engineering',
      departmentName: 'Mechanical Engineering',
      gpaRequired: 70,
      minAge: 16,
      maxAge: 25,
      requiredSubjects: ['Mathematics', 'Physics'],
      entranceExam: 'SAT',
      minEntranceScore: 1200,
    },
    {
      id: 'fallback-marketing-4',
      code: 'MKT-301',
      name: 'B.B.A. in Marketing',
      departmentName: 'Administration & Commerce',
      gpaRequired: 60,
      minAge: 16,
      maxAge: 25,
      requiredSubjects: ['English'],
      entranceExam: undefined,
      minEntranceScore: 0,
    },
  ];

  async checkEligibility(input: EligibilityInput): Promise<EligibilityResult[]> {
    try {
      // 1. Fetch courses from database
      const dbCourses = await prisma.course.findMany({
        include: {
          department: true,
        },
      });

      // 2. Map database courses or fallback to static list
      let coursesToCheck: {
        id: string;
        code: string;
        name: string;
        departmentName: string;
        gpaRequired: number;
        minAge: number;
        maxAge: number;
        requiredSubjects: string[];
        entranceExam: string | undefined;
        minEntranceScore: number;
      }[] = [];

      if (dbCourses.length > 0) {
        coursesToCheck = dbCourses.map((c) => {
          // Parse course requirements from DB or apply realistic defaults
          const isGrad = c.code.startsWith('CS-') || c.code.startsWith('AI-');
          return {
            id: c.id,
            code: c.code,
            name: c.name,
            departmentName: c.department?.name || 'General',
            gpaRequired: isGrad ? 75 : 60,
            minAge: isGrad ? 20 : 16,
            maxAge: 45,
            requiredSubjects: isGrad ? ['Mathematics', 'Programming'] : ['Mathematics'],
            entranceExam: isGrad ? 'GRE' : undefined,
            minEntranceScore: isGrad ? 300 : 0,
          };
        });
      } else {
        logger.warn(
          'No courses found in database. Using static fallback courses for eligibility check.',
        );
        coursesToCheck = EligibilityService.staticFallbackCourses;
      }

      const results: EligibilityResult[] = [];

      // 3. Process each course against eligibility checks
      for (const course of coursesToCheck) {
        const reasons: string[] = [];
        let allPassed = true;

        // Apply Reservation Category Marks Relaxation:
        // SC/ST gets 10% relaxation, OBC gets 5% relaxation
        let relaxation = 0;
        const category = input.reservation.toUpperCase();
        if (category === 'SC' || category === 'ST') {
          relaxation = 10;
        } else if (category === 'OBC') {
          relaxation = 5;
        }

        const effectiveGpaRequired = Math.max(0, course.gpaRequired - relaxation);
        const marksPassed = input.marks >= effectiveGpaRequired;

        let marksMsg = `Requires min ${course.gpaRequired}% marks.`;
        if (relaxation > 0) {
          marksMsg += ` (Relaxed to ${effectiveGpaRequired}% for ${category} category).`;
        }

        if (marksPassed) {
          reasons.push(`Marks check passed (${input.marks}% >= ${effectiveGpaRequired}%)`);
        } else {
          allPassed = false;
          reasons.push(
            `Academic score is below requirement (${input.marks}% < ${effectiveGpaRequired}%)`,
          );
        }

        const marksCheck: ChecklistItem = {
          passed: marksPassed,
          message: marksPassed ? `Passed: ${marksMsg}` : `Failed: ${marksMsg}`,
        };

        // Age Check
        const agePassed = input.age >= course.minAge && input.age <= course.maxAge;
        const ageMsg = `Requires age between ${course.minAge} and ${course.maxAge}.`;

        if (agePassed) {
          reasons.push(`Age requirement satisfied (${input.age} years old)`);
        } else {
          allPassed = false;
          reasons.push(`Age is outside required range (${input.age} years old)`);
        }

        const ageCheck: ChecklistItem = {
          passed: agePassed,
          message: agePassed ? `Passed: ${ageMsg}` : `Failed: ${ageMsg}`,
        };

        // Required Subjects Check
        const studentSubjectsLower = input.subjects.map((s) => s.toLowerCase());
        const missingSubjects = course.requiredSubjects.filter(
          (sub) => !studentSubjectsLower.includes(sub.toLowerCase()),
        );
        const subjectsPassed = missingSubjects.length === 0;
        const subjectsMsg = `Requires subjects: ${course.requiredSubjects.join(', ')}.`;

        if (subjectsPassed) {
          reasons.push(`All required pre-requisite subjects completed`);
        } else {
          allPassed = false;
          reasons.push(`Missing required pre-requisite subjects: ${missingSubjects.join(', ')}`);
        }

        const subjectsCheck: ChecklistItem = {
          passed: subjectsPassed,
          message: subjectsPassed
            ? `Passed: ${subjectsMsg}`
            : `Failed: Missing ${missingSubjects.join(', ')}`,
        };

        // Entrance Exam Check
        let examPassed = true;
        let examMsg = 'No entrance exam required.';

        if (course.entranceExam) {
          const reqExam = course.entranceExam.toLowerCase();
          const hasExam = input.entranceExam && input.entranceExam.toLowerCase() === reqExam;
          const scoreOk =
            hasExam &&
            input.entranceScore !== undefined &&
            input.entranceScore >= course.minEntranceScore;
          examPassed = !!scoreOk;
          examMsg = `Requires ${course.entranceExam} score of at least ${course.minEntranceScore}.`;

          if (examPassed) {
            reasons.push(
              `Satisfied ${course.entranceExam} threshold (${input.entranceScore} >= ${course.minEntranceScore})`,
            );
          } else if (!hasExam) {
            allPassed = false;
            reasons.push(`This course requires the ${course.entranceExam} entrance exam`);
          } else {
            allPassed = false;
            reasons.push(
              `Entrance score is below threshold (${input.entranceScore} < ${course.minEntranceScore})`,
            );
          }
        }

        const entranceExamCheck: ChecklistItem = {
          passed: examPassed,
          message: examPassed ? `Passed: ${examMsg}` : `Failed: ${examMsg}`,
        };

        results.push({
          id: course.id,
          code: course.code,
          name: course.name,
          departmentName: course.departmentName,
          isEligible: allPassed,
          checklist: {
            marks: marksCheck,
            age: ageCheck,
            subjects: subjectsCheck,
            entranceExam: entranceExamCheck,
          },
          reasons,
        });
      }

      return results;
    } catch (err) {
      logger.error('Eligibility check service exception:', err);
      throw err;
    }
  }
}

export const eligibilityService = new EligibilityService();
