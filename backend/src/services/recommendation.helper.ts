import logger from '../config/logger.js';

/**
 * Automatically recommends a course based on the following rules:
 * - 12th PCM >= 85 and JEE >= 80 -> CSE (AI & ML)
 * - 12th PCM >= 80 and JEE >= 80 -> CSE (Core)
 * - 12th PCM >= 80 and JEE >= 75 -> CSE (Data Science)
 * - Else -> "Currently Not Eligible"
 */
export function getCourseRecommendation(pcm12: number | null | undefined, jee: number | null | undefined): string {
  if (pcm12 === null || pcm12 === undefined || jee === null || jee === undefined) {
    return 'Currently Not Eligible';
  }

  const pcmVal = typeof pcm12 === 'number' ? pcm12 : parseFloat(String(pcm12));
  const jeeVal = typeof jee === 'number' ? jee : parseFloat(String(jee));

  if (isNaN(pcmVal) || isNaN(jeeVal)) {
    return 'Currently Not Eligible';
  }

  logger.info(`Calculating recommendation: PCM = ${pcmVal}, JEE = ${jeeVal}`);

  if (pcmVal >= 85 && jeeVal >= 80) {
    return 'CSE (AI & ML)';
  } else if (pcmVal >= 80 && jeeVal >= 80) {
    return 'CSE (Core)';
  } else if (pcmVal >= 80 && jeeVal >= 75) {
    return 'CSE (Data Science)';
  } else {
    return 'Currently Not Eligible';
  }
}
