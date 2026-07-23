import crypto from 'node:crypto';
import { PlayerRepository, playerRepository } from '@shared/repositories/player.repository.js';
import { QueueService, queueService } from '@shared/services/queue.service.js';
import { PlayerItem, PlayerRegistrationPayload } from '@shared/types/player.types.js';

export class PlayerService {
  constructor(
    private repository: PlayerRepository = playerRepository,
    private queue: QueueService = queueService
  ) {}

  async getRoster(): Promise<PlayerItem[]> {
    return this.repository.getAllPlayers();
  }

  async registerPlayer(
    payload: Partial<PlayerRegistrationPayload>
  ): Promise<{ eventId: string; messageId: string }> {
    if (!payload.teamId || !payload.playerId || !payload.email) {
      throw new Error('Validation Error: teamId, playerId, and email are required.');
    }

    const eventId = payload.eventId || payload.idempotencyKey || crypto.randomUUID();
    const fullPayload: PlayerRegistrationPayload = {
      teamId: payload.teamId,
      playerId: payload.playerId,
      name: payload.name || 'New Player',
      email: payload.email,
      position: payload.position,
      playerNumber: payload.playerNumber,
      eventId,
      queuedAt: new Date().toISOString(),
    };

    const messageId = await this.queue.enqueuePlayerRegistration(fullPayload);
    return { eventId, messageId };
  }

  async removePlayer(teamId: string, playerId: string): Promise<void> {
    if (!teamId || !playerId) {
      throw new Error('Validation Error: teamId and playerId are required for deletion.');
    }
    await this.repository.deletePlayer(teamId, playerId);
  }
}

export const playerService = new PlayerService();
