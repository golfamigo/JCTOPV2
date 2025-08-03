import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SendEmailDto } from '../dto/send-email.dto';

@Injectable()
export class EmailService {
  private n8nWebhookUrl: string;
  private n8nApiKey: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.n8nWebhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL');
    this.n8nApiKey = this.configService.get<string>('N8N_API_KEY');
  }

  async sendEmail(emailData: SendEmailDto): Promise<void> {
    const n8nPayload = {
      to: emailData.to,
      subject: emailData.subject,
      template: emailData.template,
      data: emailData.templateData,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.n8nWebhookUrl, n8nPayload, {
          headers: {
            'Authorization': `Bearer ${this.n8nApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        })
      );

      if (response.status !== 200) {
        throw new Error(`n8n returned status ${response.status}`);
      }

      console.log(`Email sent successfully to ${emailData.to}`);
    } catch (error) {
      console.error('Failed to send email via n8n:', error.message);
      
      await this.addToRetryQueue(emailData);
      
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  private async addToRetryQueue(emailData: SendEmailDto): Promise<void> {
    // TODO: Implement proper retry queue with Redis or database
    // For now, log the retry attempt
    console.log(`Adding email to retry queue for ${emailData.to}`, {
      recipient: emailData.to,
      subject: emailData.subject,
      template: emailData.template,
      timestamp: new Date().toISOString()
    });
  }

  async sendBulkEmails(emailDataArray: SendEmailDto[]): Promise<void> {
    const promises = emailDataArray.map(emailData => 
      this.sendEmail(emailData).catch(error => {
        console.error(`Failed to send email to ${emailData.to}:`, error);
        return { success: false, error: error.message };
      })
    );

    await Promise.all(promises);
  }
}