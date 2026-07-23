import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handleProducerRequest } from './controller.js';
import { responses } from '@shared/utils/response.util.js';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log(`[Producer Lambda] Method: ${event.httpMethod}, Path: ${event.path}`);

  try {
    const response = await handleProducerRequest(event);
    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body,
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[Producer Lambda Error]:', error);
    const errRes = responses.internalError(error.message || 'Internal Server Error');
    return {
      statusCode: errRes.statusCode,
      headers: errRes.headers,
      body: errRes.body,
    };
  }
}
