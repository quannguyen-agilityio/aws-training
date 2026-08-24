/**
 * Format jersey number for UI display.
 * Returns '#<number>' if provided, or 'N/A' if null/undefined.
 */
export const formatJerseyNumber = (jerseyNumber?: number | null): string => {
  if (jerseyNumber === undefined || jerseyNumber === null) {
    return 'N/A';
  }
  return `#${jerseyNumber}`;
};

/**
 * Format team name for UI display.
 * Returns the trimmed team name, or 'Free Agent' if unassigned/empty.
 */
export const formatTeamName = (team?: string | null): string => {
  if (!team || team.trim() === '') {
    return 'Free Agent';
  }
  return team;
};

/**
 * Generate a deterministic avatar URL for a player using DiceBear API if avatarUrl is missing.
 */
export const getPlayerAvatarUrl = (
  name: string,
  avatarUrl?: string | null,
): string => {
  if (avatarUrl && avatarUrl.trim()) {
    return avatarUrl.trim();
  }
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'player')}`;
};

