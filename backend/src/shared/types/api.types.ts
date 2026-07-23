export interface ApiResponse<T = unknown> {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
  data?: T;
}

export interface CognitoClaims {
  sub?: string;
  email?: string;
  'cognito:groups'?: string[];
  'cognito:username'?: string;
  [key: string]: unknown;
}
