/**
 * Interface representing a Player entity in the AWS training system.
 */
export interface Player {
  id: string;
  name: string;
  position: string;
  jerseyNumber?: number | null;
  team?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Type representing input required to create a new player profile.
 */
export type PlayerCreateInput = Omit<Player, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Type representing input required to update an existing player profile.
 */
export type PlayerUpdateInput = Partial<PlayerCreateInput> & { id: string };
