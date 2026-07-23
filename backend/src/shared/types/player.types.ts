export interface PlayerItem {
  teamId: string;
  playerId: string;
  name: string;
  email: string;
  position?: string;
  playerNumber?: number;
  eventId?: string;
  onboardingStatus?: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  welcomeEmailSentAt?: string;
  sesMessageId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerRegistrationPayload {
  teamId: string;
  playerId: string;
  name: string;
  email: string;
  position?: string;
  playerNumber?: number;
  idempotencyKey?: string;
  eventId?: string;
  queuedAt?: string;
}
