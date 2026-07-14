import { Resend } from 'resend';
import { EmailProvider, SendEmailOptions } from './email-provider.interface.js';
import logger from '../../config/logger.js';

export class ResendEmailProvider implements EmailProvider {
  private resend: Resend;
  private from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined in environment variables');
    }
    if (!from) {
      throw new Error('EMAIL_FROM is not defined in environment variables');
    }

    this.resend = new Resend(apiKey);
    this.from = from;
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    logger.info(`Sending email via Resend to: ${options.to}`);
    try {
      const response = await this.resend.emails.send({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      logger.info(`Email sent successfully via Resend to ${options.to}. ID: ${response.data?.id}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown Resend error';
      logger.error(`Resend email delivery failed to ${options.to}. Reason: ${errorMsg}`, {
        error: err,
      });
      throw new Error(`Email delivery failed: ${errorMsg}`);
    }
  }

  async verifyConnection(): Promise<void> {
    // Resend doesn't have a direct transporter verify, but we can check if api key is non-empty
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey.startsWith('your-') || apiKey === 're_...') {
      logger.error('Resend API key is missing or is placeholder.');
      throw new Error('Invalid Resend API Key configuration.');
    }
    logger.info('Resend Email Provider initialized and validated.');
  }
}
