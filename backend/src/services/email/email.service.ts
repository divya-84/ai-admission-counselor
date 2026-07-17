import { EmailProvider } from './email-provider.interface.js';
import { ResendEmailProvider } from './resend-provider.js';
import { SmtpEmailProvider } from './smtp-provider.js';
import logger from '../../config/logger.js';

export class EmailService {
  private provider: EmailProvider | null = null;

  constructor() {
    const providerType = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();
    logger.info(`Initializing email service with provider: ${providerType}`);
    try {
      if (providerType === 'resend') {
        this.provider = new ResendEmailProvider();
      } else if (providerType === 'smtp') {
        this.provider = new SmtpEmailProvider();
      } else {
        logger.error(`Unsupported email provider: ${providerType}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown provider instantiation error';
      logger.error(`Failed to instantiate email provider: ${errorMsg}`);
    }
  }

  async verifyConnection(): Promise<void> {
    if (!this.provider) {
      throw new Error('Email provider is not initialized or invalid.');
    }
    if (this.provider.verifyConnection) {
      await this.provider.verifyConnection();
    } else {
      logger.info('Email provider does not support explicit connection verification.');
    }
  }

  private buildEmailTemplate(
    title: string,
    greeting: string,
    contentHtml: string,
    actionButton?: { text: string; url: string },
    warningBox?: string,
  ): string {
    const supportEmail =
      process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || 'support@university.com';

    const buttonHtml = actionButton
      ? `
        <div class="btn-container">
          <a href="${actionButton.url}" class="btn" target="_blank" style="color: #ffffff !important;">${actionButton.text}</a>
        </div>
        <div class="fallback">
          If the button above doesn't work, copy and paste the following URL into your browser:
          <br>
          <a href="${actionButton.url}" target="_blank">${actionButton.url}</a>
        </div>
      `
      : '';

    const warningBoxHtml = warningBox
      ? `
        <div class="expiry">
          ${warningBox}
        </div>
      `
      : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #cbd5e1;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #0b0f19;
      padding-top: 40px;
      padding-bottom: 40px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%);
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 16px;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #94a3b8;
      margin-bottom: 24px;
    }
    .btn-container {
      text-align: center;
      margin-top: 32px;
      margin-bottom: 32px;
    }
    .btn {
      display: inline-block;
      background-color: #4f46e5;
      color: #ffffff !important;
      font-weight: 600;
      font-size: 15px;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
    }
    .expiry {
      font-size: 13px;
      color: #e2e8f0;
      background-color: #1e1b4b;
      border: 1px solid #312e81;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      text-align: center;
    }
    .fallback {
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #1e293b;
    }
    .fallback a {
      color: #6366f1;
      text-decoration: underline;
    }
    .footer {
      padding: 24px 32px;
      background-color: #090d16;
      border-top: 1px solid #1e293b;
      text-align: center;
      font-size: 12px;
      color: #475569;
    }
    .footer a {
      color: #94a3b8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>AI Powered Admission Counselor</h1>
      </div>
      
      <div class="content">
        <div class="greeting">${greeting}</div>
        ${contentHtml}
        ${warningBoxHtml}
        ${buttonHtml}
      </div>
      
      <div class="footer">
        © ${new Date().getFullYear()} AI Powered Admission Counselor. All rights reserved.
        <br>
        If you need assistance, please contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    if (!this.provider) {
      throw new Error('Cannot send email. Email provider is not initialized.');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
    logger.info(`[EMAIL OUTBOX] Verification link for ${to}: ${verifyUrl}`);

    const contentHtml = `
      <p class="text">
        Thank you for registering with the AI Powered Admission Counselor platform!
        To complete your registration and activate your account, please verify your email address by clicking the button below.
      </p>
    `;

    const warningBox = '⚠️ This email verification link will expire in <strong>24 hours</strong>.';

    const html = this.buildEmailTemplate(
      'Verify Your Email Address',
      `Welcome ${name}!`,
      contentHtml,
      { text: 'Verify Email Address', url: verifyUrl },
      warningBox,
    );

    await this.provider.sendEmail({
      to,
      subject: 'Verify Your Email - AI Powered Admission Counselor',
      html,
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    if (!this.provider) {
      throw new Error('Cannot send email. Email provider is not initialized.');
    }

    const contentHtml = `
      <p class="text">
        Your email address has been successfully verified. Welcome to our advisor community!
        Our AI Admission Counselor is ready to help you navigate course selection, eligibility checking, scholarships, and documents vault.
      </p>
      <p class="text">
        You can now log in to your dashboard to complete your admission profile or schedule counseling sessions.
      </p>
    `;

    const html = this.buildEmailTemplate('Welcome!', `Welcome Aboard, ${name}!`, contentHtml);

    await this.provider.sendEmail({
      to,
      subject: 'Welcome to AI Powered Admission Counselor!',
      html,
    });
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    if (!this.provider) {
      throw new Error('Cannot send email. Email provider is not initialized.');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    logger.info(`[EMAIL OUTBOX] Password reset link for ${to}: ${resetUrl}`);

    const contentHtml = `
      <p class="text">
        We received a request to reset the password for your AI Powered Admission Counselor account.
        If you made this request, please click the button below to set a new password.
      </p>
    `;

    const warningBox =
      '⚠️ This password reset link will expire in <strong>1 hour</strong> and can only be used once.';

    const html = this.buildEmailTemplate(
      'Reset Your Password',
      `Hello ${name},`,
      contentHtml,
      { text: 'Reset Password', url: resetUrl },
      warningBox,
    );

    await this.provider.sendEmail({
      to,
      subject: 'Reset Your Password - AI Powered Admission Counselor',
      html,
    });
  }

  async sendPasswordChangedEmail(to: string, name: string): Promise<void> {
    if (!this.provider) {
      throw new Error('Cannot send email. Email provider is not initialized.');
    }

    const contentHtml = `
      <p class="text">
        This is a confirmation that the password for your AI Powered Admission Counselor account was recently updated.
        If you performed this change, no further action is required.
      </p>
      <p class="text" style="color: #ef4444; font-weight: bold;">
        If you did not change your password, please contact our support team immediately as your account might be compromised.
      </p>
    `;

    const html = this.buildEmailTemplate(
      'Password Updated Successfully',
      `Hello ${name},`,
      contentHtml,
    );

    await this.provider.sendEmail({
      to,
      subject: 'Security Alert: Password Changed',
      html,
    });
  }

  async sendAccountLockedEmail(to: string, name: string, lockDurationMin: number): Promise<void> {
    if (!this.provider) {
      throw new Error('Cannot send email. Email provider is not initialized.');
    }

    const contentHtml = `
      <p class="text">
        Your account has been temporarily locked due to too many failed login attempts.
        This is a security precaution designed to protect your data from brute-force attempts.
      </p>
      <p class="text" style="font-weight: bold; color: #f97316;">
        Your account will remain locked for the next ${lockDurationMin} minutes.
      </p>
      <p class="text">
        Once the lock duration expires, you will be able to attempt logging in again. If you have forgotten your password, please use the Forgot Password recovery flow.
      </p>
    `;

    const html = this.buildEmailTemplate(
      'Account Temporarily Locked',
      `Security Alert: ${name}`,
      contentHtml,
    );

    await this.provider.sendEmail({
      to,
      subject: 'Security Alert: Your Account is Temporarily Locked',
      html,
    });
  }

  async sendAccountActivatedEmail(to: string, name: string): Promise<void> {
    if (!this.provider) {
      throw new Error('Cannot send email. Email provider is not initialized.');
    }

    const contentHtml = `
      <p class="text">
        Your AI Powered Admission Counselor account is now active and ready for use.
        If it was previously locked or pending email verification, these checks have been successfully cleared.
      </p>
    `;

    const html = this.buildEmailTemplate('Account Activated', `Hello ${name},`, contentHtml);

    await this.provider.sendEmail({
      to,
      subject: 'Your Account is Active',
      html,
    });
  }
}

export const emailService = new EmailService();
