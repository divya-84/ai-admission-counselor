import logger from './logger.js';

export function validateEnv(): void {
  logger.info('Validating environment configurations...');

  const errors: string[] = [];

  // Core configuration checks
  if (!process.env.FRONTEND_URL) {
    errors.push('FRONTEND_URL is missing. Required for password reset links.');
  }

  const emailProvider = (process.env.EMAIL_PROVIDER || '').trim().toLowerCase();

  if (!emailProvider) {
    errors.push('EMAIL_PROVIDER is not set. Must be either "resend" or "smtp".');
  } else if (emailProvider !== 'resend' && emailProvider !== 'smtp') {
    errors.push(
      `Invalid EMAIL_PROVIDER "${emailProvider}". Supported providers are: "resend", "smtp".`,
    );
  } else {
    // Shared email from address check
    if (!process.env.EMAIL_FROM) {
      errors.push('EMAIL_FROM is missing. E.g. "AI Admission Counselor <onboarding@resend.dev>".');
    }

    if (emailProvider === 'resend') {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey || apiKey.startsWith('your-') || apiKey === 're_...') {
        errors.push('RESEND_API_KEY is missing or contains placeholder value.');
      }
    } else if (emailProvider === 'smtp') {
      if (!process.env.SMTP_HOST) errors.push('SMTP_HOST is missing.');
      if (!process.env.SMTP_PORT) errors.push('SMTP_PORT is missing.');
      if (!process.env.SMTP_USER || process.env.SMTP_USER.startsWith('your-')) {
        errors.push('SMTP_USER is missing or contains placeholder value.');
      }
      if (!process.env.SMTP_PASS || process.env.SMTP_PASS.startsWith('your-')) {
        errors.push('SMTP_PASS is missing or contains placeholder value.');
      }
    }
  }

  if (errors.length > 0) {
    logger.error('=== ENVIRONMENT VARIABLE VALIDATION ERROR ===');
    errors.forEach((err) => logger.error(`- ${err}`));
    logger.error('==============================================');
    logger.error('CRITICAL: Server startup aborted due to missing configuration values.');
    process.exit(1);
  }

  logger.info('Environment configurations validated successfully.');
}
