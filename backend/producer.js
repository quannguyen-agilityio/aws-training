import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'node:crypto';

const sqsClient = new SQSClient({ region: process.env.AWS_REGION || 'us-east-1' });
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
const TABLE_NAME = process.env.TABLE_NAME || 'PlayersDashboard-Data';

export async function handler(event) {
  let response;
  const method =
    event.httpMethod ||
    (event.requestContext &&
      event.requestContext.http &&
      event.requestContext.http.method);

  console.log(`[Producer] Incoming request method: ${method}`);

  try {
    switch (method) {
      case 'OPTIONS':
        response = {
          statusCode: 200,
          body: JSON.stringify({ message: 'CORS preflight successful' }),
        };
        break;

      case 'POST': {
        if (!SQS_QUEUE_URL) {
          console.error('[Producer] SQS_QUEUE_URL environment variable is not defined.');
          throw new Error('SQS_QUEUE_URL configuration missing');
        }

        const requestBody = JSON.parse(event.body || '{}');

        if (!requestBody.teamId || !requestBody.playerId || !requestBody.email) {
          response = {
            statusCode: 400,
            body: JSON.stringify({
              message: 'Validation Error: teamId, playerId, and email are required.',
            }),
          };
          break;
        }

        // Generate an Idempotency Key / Event ID for event deduplication & tracking
        const eventId = requestBody.eventId || requestBody.idempotencyKey || crypto.randomUUID();
        const eventPayload = {
          ...requestBody,
          eventId,
          queuedAt: new Date().toISOString(),
        };

        // Send Message asynchronously to SQS Buffer
        const sendParams = {
          QueueUrl: SQS_QUEUE_URL,
          MessageBody: JSON.stringify(eventPayload),
        };

        // Only include FIFO parameters if using a FIFO queue (.fifo suffix)
        if (SQS_QUEUE_URL.endsWith('.fifo')) {
          sendParams.MessageDeduplicationId = eventId;
          sendParams.MessageGroupId = requestBody.teamId;
        }

        const sqsResult = await sqsClient.send(new SendMessageCommand(sendParams));

        console.log(`[Producer] Message enqueued to SQS successfully. MessageId: ${sqsResult.MessageId}, EventId: ${eventId}`);

        // Return immediate client acknowledgment (202 Accepted)
        response = {
          statusCode: 202,
          body: JSON.stringify({
            message: 'Player registration accepted and queued for background onboarding.',
            status: 'QUEUED',
            eventId,
            messageId: sqsResult.MessageId,
            playerId: requestBody.playerId,
            teamId: requestBody.teamId,
          }),
        };
        break;
      }

      case 'GET': {
        const scanRes = await docClient.send(
          new ScanCommand({ TableName: TABLE_NAME })
        );
        response = { statusCode: 200, body: JSON.stringify(scanRes.Items || []) };
        break;
      }

      case 'DELETE': {
        const deleteBody = JSON.parse(event.body || '{}');
        await docClient.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
              teamId: deleteBody.teamId,
              playerId: deleteBody.playerId,
            },
          })
        );
        response = {
          statusCode: 200,
          body: JSON.stringify({ message: 'Player deleted successfully!' }),
        };
        break;
      }

      default:
        response = {
          statusCode: 405,
          body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }
  } catch (err) {
    console.error('[Producer] Error processing request:', err);
    response = {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: err.message,
      }),
    };
  }

  return {
    ...response,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,DELETE',
      'Access-Control-Allow-Headers':
        'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    },
  };
}
