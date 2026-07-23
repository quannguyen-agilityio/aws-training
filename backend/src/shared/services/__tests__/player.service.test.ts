import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlayerService } from '@shared/services/player.service.js';
import { PlayerRepository } from '@shared/repositories/player.repository.js';
import { QueueService } from '@shared/services/queue.service.js';

describe('PlayerService', () => {
  let mockRepo: PlayerRepository;
  let mockQueue: QueueService;
  let service: PlayerService;

  beforeEach(() => {
    mockRepo = {
      getAllPlayers: vi.fn(),
      getPlayerById: vi.fn(),
      savePlayer: vi.fn(),
      deletePlayer: vi.fn(),
    } as unknown as PlayerRepository;

    mockQueue = {
      enqueuePlayerRegistration: vi.fn(),
    } as unknown as QueueService;

    service = new PlayerService(mockRepo, mockQueue);
  });

  it('should return all players from repository', async () => {
    const mockData = [{ teamId: 'LAL', playerId: 'LBJ23', name: 'LeBron', email: 'lbj@test.com' }];
    vi.mocked(mockRepo.getAllPlayers).mockResolvedValue(mockData);

    const result = await service.getRoster();
    expect(result).toEqual(mockData);
    expect(mockRepo.getAllPlayers).toHaveBeenCalledOnce();
  });

  it('should throw an error when registering player without required fields', async () => {
    await expect(service.registerPlayer({ teamId: 'LAL' })).rejects.toThrow(
      'Validation Error: teamId, playerId, and email are required.'
    );
  });

  it('should enqueue player registration successfully', async () => {
    vi.mocked(mockQueue.enqueuePlayerRegistration).mockResolvedValue('msg-123');

    const result = await service.registerPlayer({
      teamId: 'LAL',
      playerId: 'LBJ23',
      email: 'lbj@test.com',
      name: 'LeBron James',
    });

    expect(result.messageId).toBe('msg-123');
    expect(result.eventId).toBeDefined();
    expect(mockQueue.enqueuePlayerRegistration).toHaveBeenCalledOnce();
  });
});
