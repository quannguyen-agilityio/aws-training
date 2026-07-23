import { describe, it, expect } from 'vitest';
import { responses, buildResponse } from '@shared/utils/response.util.js';

describe('response.util', () => {
  it('should build a standard API response with CORS headers', () => {
    const res = buildResponse(200, { data: 'test' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(JSON.parse(res.body)).toEqual({ data: 'test' });
  });

  it('should build specific helper responses', () => {
    const okRes = responses.success({ ok: true });
    expect(okRes.statusCode).toBe(200);

    const createdRes = responses.accepted({ status: 'QUEUED' });
    expect(createdRes.statusCode).toBe(202);

    const badReq = responses.badRequest('Invalid payload');
    expect(badReq.statusCode).toBe(400);
    expect(JSON.parse(badReq.body)).toEqual({ message: 'Invalid payload' });

    const unauth = responses.unauthorized();
    expect(unauth.statusCode).toBe(401);
  });
});
