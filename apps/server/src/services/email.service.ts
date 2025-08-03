import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:8081');
      const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
      const fromEmail = this.configService.get<string>('EMAIL_FROM', 'noreply@jctop-event.com');

      const mailOptions = {
        from: fromEmail,
        to: email,
        subject: 'Reset Your Password - JCTOP EVENT',
        html: this.getPasswordResetEmailTemplate(resetUrl),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      // Don't throw error to prevent revealing email existence
    }
  }

  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - JCTOP EVENT</title>
        <style>
          body {
            font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #0F172A;
            background-color: #F8FAFC;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #2563EB;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            padding: 30px;
          }
          .button {
            display: inline-block;
            background-color: #2563EB;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            background-color: #F8FAFC;
            padding: 20px;
            text-align: center;
            color: #64748B;
            font-size: 14px;
            border-radius: 0 0 8px 8px;
          }
          .warning {
            background-color: #FEF3C7;
            border: 1px solid #F59E0B;
            color: #92400E;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          
          <div class="content">
            <p>Hello,</p>
            
            <p>We received a request to reset your password for your JCTOP EVENT account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
              <strong>Important:</strong> This link will expire in 24 hours for security reasons.
            </div>
            
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
            
            <p style="word-break: break-all; color: #2563EB;">${resetUrl}</p>
            
            <p>Best regards,<br>The JCTOP EVENT Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2025 JCTOP EVENT. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}