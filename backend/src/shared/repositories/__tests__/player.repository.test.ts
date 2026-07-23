import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { ScanCommand, GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@shared/clients/dynamodb.client.js';
import { PlayerRepository } from '@shared/repositories/player.repository.js';

const ddbMock = mockClient(docClient);

describe('PlayerRepository', () => {
  let repository: PlayerRepository;

  beforeEach(() => {
    ddbMock.reset();
    repository = new PlayerRepository('TestTable');
  });

  it('should fetch all players using ScanCommand', async () => {
    const mockItems = [
      { teamId: 'LAL', playerId: 'LBJ23', name: 'LeBron James', email: 'lbj@example.com' },
    ];
    ddbMock.on(ScanCommand).resolves({ Items: mockItems });

    const players = await repository.getAllPlayers();
    expect(players).toEqual(mockItems);
    expect(ddbMock.commandCalls(ScanCommand).length).toBe(1);
  });

  it('should fetch a single player by teamId and playerId', async () => {
    const mockItem = { teamId: 'LAL', playerId: 'LBJ23', name: 'LeBron James', email: 'lbj@example.com' };
    ddbMock.on(GetCommand).resolves({ Item: mockItem });

    const player = await repository.getPlayerById('LAL', 'LBJ23');
    expect(player).toEqual(mockItem);
  });

  it('should save a player using PutCommand', async () => {
    ddbMock.on(PutCommand).resolves({});

    const playerItem = { teamId: 'LAL', playerId: 'LBJ23', name: 'LeBron James', email: 'lbj@example.com' };
    await repository.savePlayer(playerItem);

    expect(ddbMock.commandCalls(PutCommand).length).toBe(1);
  });

  it('should delete a player using DeleteCommand', async () => {
    ddbMock.on(DeleteCommand).resolves({});

    await repository.deletePlayer('LAL', 'LBJ23');

    expect(ddbMock.commandCalls(DeleteCommand).length).toBe(1);
  });
});
