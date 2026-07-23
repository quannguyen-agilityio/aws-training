import { describe, it, expect } from 'vitest';
import { handler } from './handler.js';

describe('Producer Handler Unit Tests', () => {
  it('should return 200 status code with success message', async () => {
    const event = { httpMethod: 'GET' };
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('Producer Lambda function working properly');
    expect(body.method).toBe('GET');
  });
});
