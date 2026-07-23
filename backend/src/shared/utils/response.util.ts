import { ApiResponse } from '@shared/types/api.types.js';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,DELETE',
  'Access-Control-Allow-Headers':
    'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
};

export function buildResponse<T>(statusCode: number, body: T): ApiResponse<T> {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
    data: body,
  };
}

export const responses = {
  success: <T>(data: T) => buildResponse(200, data),
  accepted: <T>(data: T) => buildResponse(202, data),
  badRequest: (message: string) => buildResponse(400, { message }),
  unauthorized: (message = 'Unauthorized') => buildResponse(401, { message }),
  forbidden: (message = 'Forbidden') => buildResponse(403, { message }),
  notFound: (message = 'Resource Not Found') => buildResponse(404, { message }),
  methodNotAllowed: () => buildResponse(405, { message: 'Method Not Allowed' }),
  internalError: (message = 'Internal Server Error') => buildResponse(500, { message }),
};
