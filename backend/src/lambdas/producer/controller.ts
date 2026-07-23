import { APIGatewayProxyEvent } from 'aws-lambda';
import { playerService } from '@shared/services/player.service.js';
import { responses } from '@shared/utils/response.util.js';
import { parseJsonBody, isValidEmail } from '@shared/utils/validator.util.js';
import { ApiResponse } from '@shared/types/api.types.js';

export async function handleProducerRequest(event: APIGatewayProxyEvent): Promise<ApiResponse> {
  const method =
    event.httpMethod ||
    (event as unknown as { requestContext?: { http?: { method?: string } } }).requestContext?.http
      ?.method ||
    'GET';

  switch (method) {
    case 'OPTIONS':
      return responses.success({ message: 'CORS preflight successful' });

    case 'GET': {
      const players = await playerService.getRoster();
      return responses.success(players);
    }

    case 'POST': {
      const body = parseJsonBody<{
        teamId?: string;
        playerId?: string;
        name?: string;
        email?: string;
        position?: string;
        playerNumber?: number;
      }>(event.body);

      if (!body.teamId || !body.playerId || !body.email) {
        return responses.badRequest('Validation Error: teamId, playerId, and email are required.');
      }

      if (!isValidEmail(body.email)) {
        return responses.badRequest('Validation Error: Invalid email format.');
      }

      const result = await playerService.registerPlayer(body);
      return responses.accepted({
        message: 'Player registration accepted and queued for background onboarding.',
        status: 'QUEUED',
        eventId: result.eventId,
        messageId: result.messageId,
        playerId: body.playerId,
        teamId: body.teamId,
      });
    }

    case 'DELETE': {
      const deleteBody = parseJsonBody<{ teamId?: string; playerId?: string }>(event.body);
      if (!deleteBody.teamId || !deleteBody.playerId) {
        return responses.badRequest(
          'Validation Error: teamId and playerId are required for deletion.'
        );
      }

      await playerService.removePlayer(deleteBody.teamId, deleteBody.playerId);
      return responses.success({ message: 'Player deleted successfully!' });
    }

    default:
      return responses.methodNotAllowed();
  }
}
