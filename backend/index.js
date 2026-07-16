import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'PlayersDashboard-Data';

export async function handler(event) {
  let response;
  // Get method from either REST API (httpMethod) or HTTP API / Function URL
  const method =
    event.httpMethod ||
    (event.requestContext &&
      event.requestContext.http &&
      event.requestContext.http.method);

  console.log(`Incoming request method: ${method}`);

  try {
    switch (method) {
      case 'GET':
        const scanRes = await docClient.send(
          new ScanCommand({ TableName: TABLE_NAME }),
        );

        response = { statusCode: 200, body: JSON.stringify(scanRes.Items) };

        break;
      case 'POST':
        const requestBody = JSON.parse(event.body);

        await docClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: requestBody,
          }),
        );

        response = {
          statusCode: 201,
          body: JSON.stringify({
            message: 'Player created/updated successfully!',
          }),
        };

        break;
      case 'DELETE':
        const deleteBody = JSON.parse(event.body);

        await docClient.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
              teamId: deleteBody.teamId,
              playerId: deleteBody.playerId,
            },
          }),
        );

        response = {
          statusCode: 200,
          body: JSON.stringify({ message: 'Player deleted successfully!' }),
        };

        break;
      default:
        response = {
          statusCode: 405,
          body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }
  } catch (err) {
    console.error(err);
    response = {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: err.message,
      }),
    };
  }

  const finalResponse = {
    ...response,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  };

  console.log(`Response body for method ${method}:`, finalResponse.body);

  return finalResponse;
}
