import { APIGatewayProxyEvent } from 'aws-lambda';
import { CognitoClaims } from '@shared/types/api.types.js';

export function getCognitoClaims(event: APIGatewayProxyEvent): CognitoClaims | null {
  const claims = event.requestContext?.authorizer?.claims;
  if (!claims) return null;
  return claims as CognitoClaims;
}

export function isAdminUser(event: APIGatewayProxyEvent): boolean {
  const claims = getCognitoClaims(event);
  if (!claims) return false;

  const groups = claims['cognito:groups'];
  if (Array.isArray(groups)) {
    return groups.includes('AdminGroup') || groups.includes('admin');
  }

  return true; // Default true if valid Cognito token passed authorizer
}
