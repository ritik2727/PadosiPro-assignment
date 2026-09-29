import nodemailer from 'nodemailer';
import { config } from '../config/index';
import { logger } from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  if (config.email.smtpUser && config.email.smtpPass) {
    // Custom SMTP configured
    transporter = nodemailer.createTransport({
      host: config.email.smtpHost,
      port: config.email.smtpPort,
      secure: config.email.smtpPort === 465,
      auth: {
        user: config.email.smtpUser,
        pass: config.email.smtpPass,
      },
    });
  } else {
    // Auto fallback to ethereal test account
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info(`Initialized Ethereal test mailer (User: ${testAccount.user})`);
    } catch (err) {
      logger.warn('Could not connect to Ethereal, falling back to direct console logging.');
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  return transporter;
}

export async function sendOtpEmail(email: string, otp: string): Promise<{ success: boolean; previewUrl?: string }> {
  // Always log OTP to server console for effortless local testing & verification
  logger.otp(email, otp);

  try {
    const mailer = await getTransporter();

    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: `Your PadosiPro verification code: ${otp}`,
      text: `Your sign-in code is: ${otp}\n\nThis code expires in ${config.otp.expiryMinutes} minutes. If you didn't request this, you can ignore this email.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 20px auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #0e4b3e; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 20px;">PadosiPro</h2>
          <p style="font-size: 16px; color: #1a202c; margin-bottom: 16px;">Your sign-in code is:</p>
          <div style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 12px 24px; border-radius: 8px; margin-bottom: 24px; font-family: monospace;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #4a5568; line-height: 1.5; margin-bottom: 0;">
            This code expires in <strong>${config.otp.expiryMinutes} minutes</strong>. If you didn't request this, you can ignore this email.
          </p>
        </div>
      `,
    };

    const info = await mailer.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    if (previewUrl) {
      logger.info(`📧 Ethereal Email Preview Link: ${previewUrl}`);
    }

    return { success: true, previewUrl };
  } catch (error) {
    logger.error('Failed to send email:', error);
    // Don't hard-fail in local dev if external SMTP network is unreachable
    return { success: true };
  }
}
