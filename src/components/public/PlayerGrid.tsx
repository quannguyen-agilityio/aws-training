import React from 'react';
import { Player } from '../../types/player';
import { PlayerCard } from './PlayerCard';

interface PlayerGridProps {
  players: Player[];
}

/**
 * PlayerGrid Component
 * Renders a grid container populated with PlayerCard items or displays an empty state if no players are found.
 */
export const PlayerGrid: React.FC<PlayerGridProps> = ({ players }) => {
  if (players.length === 0) {
    return (
      <div className="empty-state">
        <p>No players found in the roster.</p>
      </div>
    );
  }

  return (
    <div className="player-grid">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
};
