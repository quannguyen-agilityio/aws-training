import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleProducerRequest } from '../controller.js';
import { playerService } from '@shared/services/player.service.js';
import { APIGatewayProxyEvent } from 'aws-lambda';

vi.mock('@shared/services/player.service.js');

describe('Producer Controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return 200 OK for OPTIONS preflight request', async () => {
    const event = { httpMethod: 'OPTIONS' } as APIGatewayProxyEvent;
    const response = await handleProducerRequest(event);
    expect(response.statusCode).toBe(200);
  });

  it('should handle GET /players and return roster list', async () => {
    const mockRoster = [{ teamId: 'LAL', playerId: 'LBJ23', name: 'LeBron', email: 'lbj@test.com' }];
    vi.mocked(playerService.getRoster).mockResolvedValue(mockRoster);

    const event = { httpMethod: 'GET' } as APIGatewayProxyEvent;
    const response = await handleProducerRequest(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(mockRoster);
  });

  it('should return 400 Bad Request for POST without email', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ teamId: 'LAL', playerId: 'LBJ23' }),
    } as APIGatewayProxyEvent;

    const response = await handleProducerRequest(event);
    expect(response.statusCode).toBe(400);
  });

  it('should handle POST /players and return 202 Accepted', async () => {
    vi.mocked(playerService.registerPlayer).mockResolvedValue({
      eventId: 'evt-123',
      messageId: 'msg-456',
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        teamId: 'LAL',
        playerId: 'LBJ23',
        email: 'lbj@test.com',
        name: 'LeBron James',
      }),
    } as APIGatewayProxyEvent;

    const response = await handleProducerRequest(event);
    expect(response.statusCode).toBe(202);
    expect(JSON.parse(response.body)).toMatchObject({
      status: 'QUEUED',
      eventId: 'evt-123',
      messageId: 'msg-456',
    });
  });
});
