import { SQSRecord } from 'aws-lambda';
import { playerRepository } from '@shared/repositories/player.repository.js';
import { emailService } from '@shared/services/email.service.js';
import { PlayerRegistrationPayload } from '@shared/types/player.types.js';

export async function processSqsRecord(record: SQSRecord): Promise<void> {
  const messageId = record.messageId;
  const payload = JSON.parse(record.body || '{}') as PlayerRegistrationPayload;

  const { teamId, playerId, name, email, eventId } = payload;
  console.log(
    `[Consumer Processor] Record MessageId: ${messageId}, EventId: ${eventId}, PlayerId: ${playerId}`
  );

  if (!teamId || !playerId || !email) {
    console.warn(`[Consumer Processor] Skipping malformed record ${messageId}`);
    return;
  }

  // Idempotency Check
  const existingPlayer = await playerRepository.getPlayerById(teamId, playerId);
  if (existingPlayer && existingPlayer.onboardingStatus === 'COMPLETED') {
    console.log(
      `[Consumer Processor] Idempotent trigger: Player ${playerId} already onboarded. Skipping email.`
    );
    return;
  }

  // Step 1: Save player with status IN_PROGRESS
  const timestamp = new Date().toISOString();
  await playerRepository.savePlayer({
    teamId,
    playerId,
    name: name || 'New Player',
    email,
    position: payload.position || 'Unassigned',
    playerNumber: payload.playerNumber,
    eventId: eventId || messageId,
    onboardingStatus: 'IN_PROGRESS',
    updatedAt: timestamp,
  });

  // Step 2: Send Welcome Email via SES
  const sesMessageId = await emailService.sendWelcomePackage(
    email,
    name || 'Player',
    teamId,
    playerId,
    eventId || messageId
  );

  // Step 3: Update onboarding status to COMPLETED
  await playerRepository.savePlayer({
    teamId,
    playerId,
    name: name || 'New Player',
    email,
    position: payload.position || 'Unassigned',
    playerNumber: payload.playerNumber,
    eventId: eventId || messageId,
    onboardingStatus: 'COMPLETED',
    welcomeEmailSentAt: new Date().toISOString(),
    sesMessageId,
    updatedAt: new Date().toISOString(),
  });

  console.log(`[Consumer Processor] Successfully completed onboarding for player ${playerId}`);
}
