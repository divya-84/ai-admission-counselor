import logger from '../config/logger.js';

interface ScholarshipInput {
  marks: number;
  annualIncome: number; // in INR
  category: string; // e.g. General, OBC, SC, ST
  religion: string; // e.g. Hindu, Muslim, Christian, Sikh, Buddhist, Jain
  isSportsPlayer: boolean;
  ewsCertificate: boolean;
  aktuRegistered: boolean;
}

interface RecommendedScholarship {
  id: string;
  name: string;
  type: 'Government' | 'Merit' | 'Minority' | 'Sports' | 'EWS' | 'University';
  coverage: string;
  explanation: string;
}

export class ScholarshipService {
  async recommendScholarships(input: ScholarshipInput): Promise<RecommendedScholarship[]> {
    try {
      const recommendations: RecommendedScholarship[] = [];

      // 1. Government Scholarships
      // UP Post-Matric Scholarship
      if (input.annualIncome <= 250000) {
        recommendations.push({
          id: 'gov-up-post-matric',
          name: 'UP Post-Matric Scholarship Scheme',
          type: 'Government',
          coverage: 'Full Tuition Reimbursement + Maintenance Allowance',
          explanation: `Qualified due to family income (₹${input.annualIncome.toLocaleString()} <= ₹2,50,000/yr). Reimburses university fees via UP state DBT portal.`,
        });
      }

      // National Merit-cum-Means (NSP)
      if (input.marks >= 80 && input.annualIncome <= 600000) {
        recommendations.push({
          id: 'gov-nsp-mcm',
          name: 'NSP National Merit-cum-Means Scholarship',
          type: 'Government',
          coverage: '₹50,000 per annum',
          explanation: `Qualified with academic marks (${input.marks}% >= 80%) and family income (₹${input.annualIncome.toLocaleString()} <= ₹6,00,000/yr) under National Scholarship Portal guidelines.`,
        });
      }

      // 2. Merit Scholarships
      // Chancellor's Merit Award
      if (input.marks >= 90) {
        recommendations.push({
          id: 'merit-chancellor',
          name: "Chancellor's Academic Excellence Award",
          type: 'Merit',
          coverage: '50% Tuition Fee Waiver',
          explanation: `Awarded for exceptional academic performance with an aggregate score of ${input.marks}% (Requirement: >= 90%).`,
        });
      } else if (input.marks >= 85) {
        recommendations.push({
          id: 'merit-academic',
          name: 'University Academic Honors Scholarship',
          type: 'Merit',
          coverage: '25% Tuition Fee Waiver',
          explanation: `Awarded for high academic achievement with a score of ${input.marks}% (Requirement: >= 85%).`,
        });
      }

      // 3. Minority Scholarships
      // MOMA Post-Matric Scholarship
      const minorityReligions = ['muslim', 'christian', 'sikh', 'buddhist', 'jain', 'parsi'];
      if (
        minorityReligions.includes(input.religion.toLowerCase()) &&
        input.annualIncome <= 200000 &&
        input.marks >= 50
      ) {
        recommendations.push({
          id: 'minority-moma',
          name: 'MOMA Post-Matric Scholarship for Minorities',
          type: 'Minority',
          coverage: '₹20,000 per annum',
          explanation: `Qualified as a minority category candidate (${input.religion}) with family income (₹${input.annualIncome.toLocaleString()} <= ₹2,00,000/yr) and marks satisfying MOMA criteria.`,
        });
      }

      // 4. Sports Scholarships
      // Sports Talent Award
      if (input.isSportsPlayer) {
        recommendations.push({
          id: 'sports-talent',
          name: 'State/National Sports Authority Scholarship',
          type: 'Sports',
          coverage: '₹25,000 stipend per semester + Gym Membership Waiver',
          explanation:
            'Awarded to state/national level athletes representing recognized sports federations.',
        });
      }

      // 5. EWS Scholarships
      // EWS Fee Waiver Scheme
      if (input.ewsCertificate && input.annualIncome <= 800000) {
        recommendations.push({
          id: 'ews-reimbursement',
          name: 'Economically Weaker Section (EWS) Fee Waiver',
          type: 'EWS',
          coverage: '100% Registration & Admission Fee Reimbursement',
          explanation: `Eligible with EWS Certificate and family income under ₹8,00,000/yr.`,
        });
      }

      // 6. University Scholarships (As per AKTU Guidelines)
      if (input.aktuRegistered) {
        // AKTU Tuition Fee Waiver (TFW) Scheme
        if (input.ewsCertificate && input.annualIncome <= 800000 && input.marks >= 75) {
          recommendations.push({
            id: 'aktu-tfw',
            name: 'AKTU Tuition Fee Waiver (TFW) Scheme',
            type: 'University',
            coverage: '100% Tuition Fee Waiver (AKTU Seats)',
            explanation: `Matches AKTU TFW guidelines: registered student with EWS verification, family income under ₹8,0,000/yr, and academic marks (${input.marks}% >= 75%).`,
          });
        }

        // AKTU Merit-cum-Means Scheme
        if (input.marks >= 80 && input.annualIncome <= 250000) {
          recommendations.push({
            id: 'aktu-mcm',
            name: 'AKTU Merit-cum-Means Assistance',
            type: 'University',
            coverage: '₹30,000 per annum assistance',
            explanation: `Matches AKTU Merit-cum-Means criteria for registered students with marks (${input.marks}% >= 80%) and family income under ₹2.5 Lakhs.`,
          });
        }
      }

      return recommendations;
    } catch (err) {
      logger.error('Scholarship recommendations processing exception:', err);
      throw err;
    }
  }
}

export const scholarshipService = new ScholarshipService();
