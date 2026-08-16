import { Injectable } from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private brevo: BrevoClient;

  constructor() {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not defined in environment variables');
    }

    this.brevo = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY,
    });
  }

  async sendEmail(to: string, subject: string, content: string): Promise<any> {
    try {
      const result = await this.brevo.transactionalEmails.sendTransacEmail({
        subject,
        htmlContent: content,
        sender: {
          name: 'E-Commerce App',
          email: process.env.USER_EMAIL,
        },
        to: [{ email: to }],
      });

      console.log('Email sent successfully via Brevo:', result);
      return result;
    } catch (error) {
      console.error('Error sending email via Brevo:', error);
      throw error;
    }
  }
}