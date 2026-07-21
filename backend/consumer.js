import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

const TABLE_NAME = process.env.TABLE_NAME || 'PlayersDashboard-Data';
const SENDER_EMAIL = process.env.SENDER_EMAIL;

export async function handler(event) {
  console.log(`[Consumer] Processing batch of ${event.Records?.length || 0} SQS messages.`);

  const batchItemFailures = [];

  for (const record of event.Records || []) {
    const messageId = record.messageId;
    try {
      const payload = JSON.parse(record.body || '{}');
      const { teamId, playerId, name, email, eventId, position } = payload;

      console.log(`[Consumer] Processing record - MessageId: ${messageId}, EventId: ${eventId}, PlayerId: ${playerId}, Email: ${email}`);

      if (!teamId || !playerId || !email) {
        console.error(`[Consumer] Invalid payload in record ${messageId}: missing teamId, playerId, or email.`);
        // Don't retry unrecoverable malformed messages
        continue;
      }

      // IDEMPOTENCY CHECK
      // Check if this player registration / event has already been fully processed
      const existingRecord = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { teamId, playerId },
        })
      );

      if (existingRecord.Item && existingRecord.Item.onboardingStatus === 'COMPLETED') {
        console.log(`[Consumer] Idempotency trigger: Player ${playerId} (${teamId}) already onboarded. Skipping SES email.`);
        continue;
      }

      // 1. Save / Update Player in DynamoDB
      const timestamp = new Date().toISOString();
      const playerItem = {
        teamId,
        playerId,
        name: name || 'New Player',
        email,
        position: position || 'Unassigned',
        eventId: eventId || messageId,
        onboardingStatus: 'IN_PROGRESS',
        updatedAt: timestamp,
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: playerItem,
        })
      );
      console.log(`[Consumer] Saved player record to DynamoDB: ${playerId}`);

      // 2. Send Digital "Welcome Package" Email via Amazon SES
      if (!SENDER_EMAIL) {
        throw new Error('SENDER_EMAIL environment variable is not set.');
      }

      const emailParams = {
        Source: SENDER_EMAIL,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: `🚀 Welcome to the Platform, ${name || 'Player'}!`,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
                    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 30px; text-align: center; }
                    .content { padding: 30px; color: #334155; line-height: 1.6; }
                    .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
                    .footer { padding: 20px; background: #f8fafc; text-align: center; font-size: 12px; color: #94a3b8; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="header">
                      <h1>Welcome Package 🏆</h1>
                    </div>
                    <div class="content">
                      <p>Hi <strong>${name || 'Player'}</strong>,</p>
                      <p>Congratulations! You have been successfully added to team <strong>${teamId}</strong> as <strong>${position || 'Player'}</strong>.</p>
                      <p>Your digital onboarding materials and player guidelines are ready. Click below to access your dashboard:</p>
                      <p style="text-align: center;">
                        <a href="https://example.com/onboarding?player=${playerId}" class="button">Access Player Portal</a>
                      </p>
                      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                      <p style="font-size: 12px; color: #64748b;">Event ID: <code>${eventId}</code> | Player ID: <code>${playerId}</code></p>
                    </div>
                    <div class="footer">
                      Automated System Delivery • Amazon SES & SQS Decoupled Engine
                    </div>
                  </div>
                </body>
                </html>
              `,
              Charset: 'UTF-8',
            },
            Text: {
              Data: `Welcome to the Platform, ${name || 'Player'}!\n\nTeam: ${teamId}\nPlayer ID: ${playerId}\n\nYour digital onboarding materials are ready.\nEvent ID: ${eventId}`,
              Charset: 'UTF-8',
            },
          },
        },
      };

      const sesResult = await sesClient.send(new SendEmailCommand(emailParams));
      console.log(`[Consumer] SES Welcome Email sent successfully. MessageId: ${sesResult.MessageId}`);

      // 3. Mark Onboarding Status as COMPLETED in DynamoDB
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            ...playerItem,
            onboardingStatus: 'COMPLETED',
            welcomeEmailSentAt: new Date().toISOString(),
            sesMessageId: sesResult.MessageId,
          },
        })
      );
      console.log(`[Consumer] Successfully completed onboarding for player ${playerId}`);

    } catch (err) {
      console.error(`[Consumer] Error processing SQS message ${messageId}:`, err);
      // Record failure for SQS partial batch retry
      batchItemFailures.push({ itemIdentifier: messageId });
    }
  }

  return { batchItemFailures };
}
