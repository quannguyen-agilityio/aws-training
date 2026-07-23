import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient } from '@shared/clients/ses.client.js';
import { config } from '@config/environment.js';

export class EmailService {
  private senderEmail: string;

  constructor(senderEmail = config.senderEmail) {
    this.senderEmail = senderEmail;
  }

  async sendWelcomePackage(
    email: string,
    name: string,
    teamId: string,
    playerId: string,
    eventId: string
  ): Promise<string> {
    if (!this.senderEmail) {
      throw new Error('SENDER_EMAIL configuration missing.');
    }

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 30px; text-align: center; }
          .content { padding: 30px; color: #334155; line-height: 1.6; }
          .footer { padding: 20px; background: #f8fafc; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header"><h1>Welcome Package 🏆</h1></div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>You have been onboarded to team <strong>${teamId}</strong> as player ID <strong>${playerId}</strong>.</p>
            <p>Event ID: <code>${eventId}</code></p>
          </div>
          <div class="footer">Automated System Delivery • Amazon SES & SQS Pipeline</div>
        </div>
      </body>
      </html>
    `;

    const result = await sesClient.send(
      new SendEmailCommand({
        Source: this.senderEmail,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: `🏆 Welcome to Team ${teamId}, ${name}!`, Charset: 'UTF-8' },
          Body: {
            Html: { Data: htmlBody, Charset: 'UTF-8' },
            Text: {
              Data: `Welcome ${name}! Team: ${teamId}, Player ID: ${playerId}`,
              Charset: 'UTF-8',
            },
          },
        },
      })
    );

    return result.MessageId || '';
  }
}

export const emailService = new EmailService();
