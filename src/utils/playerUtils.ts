/**
 * Utility functions for player data formatting and default fallback generation.
 */

/**
 * Format a jersey number for display (e.g., "#10" or "N/A").
 */
export const formatJerseyNumber = (jerseyNumber?: number | null): string => {
  if (jerseyNumber === undefined || jerseyNumber === null) {
    return 'N/A';
  }
  return `#${jerseyNumber}`;
};

/**
 * Format team name for display (e.g., "Free Agent" if unassigned).
 */
export const formatTeamName = (team?: string | null): string => {
  if (!team || !team.trim()) {
    return 'Free Agent';
  }
  return team.trim();
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
