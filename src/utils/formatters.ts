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


