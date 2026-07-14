import nodemailer from 'nodemailer';
import { EmailProvider, SendEmailOptions } from './email-provider.interface.js';
import logger from '../../config/logger.js';

export class SmtpEmailProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const portStr = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM;

    if (!host || !portStr || !user || !pass || !from) {
      throw new Error('SMTP environment variables are incomplete.');
    }

    const port = parseInt(portStr, 10);
    const secure = port === 465; // standard secure port

    this.from = from;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transportConfig: any = {
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      tls: {
        rejectUnauthorized: false, // Prevents hosting environment TLS rejection
      },
    };

    if (host.toLowerCase().includes('gmail')) {
      transportConfig.service = 'gmail';
    }

    this.transporter = nodemailer.createTransport(transportConfig);
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    logger.info(`Sending email via SMTP to: ${options.to}`);
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      logger.info(
        `Email sent successfully via SMTP to ${options.to}. MessageId: ${info.messageId}`,
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown SMTP error';
      logger.error(`SMTP email delivery failed to ${options.to}. Reason: ${errorMsg}`, {
        error: err,
      });
      throw new Error(`Email delivery failed: ${errorMsg}`);
    }
  }

  async verifyConnection(): Promise<void> {
    logger.info('SMTP connection check initiated...');
    try {
      await this.transporter.verify();
      logger.info('SMTP Connected - Connection health check passed successfully.');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown authentication error';
      logger.error(`SMTP Authentication Failed. Reason: ${errorMsg}`, { error: err });
      throw new Error(`SMTP Authentication Failed: ${errorMsg}`);
    }
  }
}
