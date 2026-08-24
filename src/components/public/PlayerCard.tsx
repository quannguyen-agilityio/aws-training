import React from 'react';
import { Player } from '../../types/player';
import { formatJerseyNumber, formatTeamName } from '../../utils/formatters';

interface PlayerCardProps {
  player: Player;
}

/**
 * PlayerCard Component
 * Displays individual player information including jersey number, avatar image or default icon,
 * name, position, team, and optional biography.
 */
export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  return (
    <div className="player-card">
      <div className="player-badge">{formatJerseyNumber(player.jerseyNumber)}</div>
      {player.avatarUrl ? (
        <img
          src={player.avatarUrl}
          alt={player.name}
          className="player-avatar"
        />
      ) : (
        <div className="player-avatar default-avatar-icon">👤</div>
      )}
      <div className="player-info">
        <h3 className="player-name">{player.name}</h3>
        <p className="player-position">{player.position}</p>
        <div className="player-team-tag">{formatTeamName(player.team)}</div>
        {player.bio && <p className="player-bio">{player.bio}</p>}
      </div>
    </div>
  );
};
