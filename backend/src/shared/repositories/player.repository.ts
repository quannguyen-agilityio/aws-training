import { ScanCommand, GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@shared/clients/dynamodb.client.js';
import { config } from '@config/environment.js';
import { PlayerItem } from '@shared/types/player.types.js';

export class PlayerRepository {
  private tableName: string;

  constructor(tableName = config.tableName) {
    this.tableName = tableName;
  }

  async getAllPlayers(): Promise<PlayerItem[]> {
    const response = await docClient.send(new ScanCommand({ TableName: this.tableName }));
    return (response.Items as PlayerItem[]) || [];
  }

  async getPlayerById(teamId: string, playerId: string): Promise<PlayerItem | null> {
    const response = await docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { teamId, playerId },
      })
    );
    return (response.Item as PlayerItem) || null;
  }

  async savePlayer(player: PlayerItem): Promise<void> {
    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: player,
      })
    );
  }

  async deletePlayer(teamId: string, playerId: string): Promise<void> {
    await docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { teamId, playerId },
      })
    );
  }
}

export const playerRepository = new PlayerRepository();
