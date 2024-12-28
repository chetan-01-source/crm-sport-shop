import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly transporter;

  constructor() {
    // Initialize Nodemailer Transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT, // Ensure port is cast to number
      secure: process.env.SMTP_PORT === '465', // true for port 465, false otherwise
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Sends an email
   * @param to Recipient email address
   * @param subject Email subject
   * @param htmlContent Email content in HTML format
   */
  async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL, // Sender address
        to, // Recipient email
        subject, // Email subject
        html: htmlContent, // HTML body
      });
      this.logger.log(`Email successfully sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }
}
