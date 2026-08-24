import React from 'react';
import { Player } from '../../types/player';
import { formatJerseyNumber, formatTeamName } from '../../utils/formatters';

interface PlayerTableProps {
  players: Player[];
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
}

/**
 * PlayerTable Component
 * Displays player records in a structured tabular format with options to Edit or Delete records.
 */
export const PlayerTable: React.FC<PlayerTableProps> = ({
  players,
  onEdit,
  onDelete,
}) => {
  if (players.length === 0) {
    return <p className='empty-table-msg'>No players registered yet.</p>;
  }

  return (
    <div className='table-responsive'>
      <table className='admin-table'>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Position</th>
            <th>Team</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id}>
              <td>{formatJerseyNumber(player.jerseyNumber)}</td>
              <td className='font-semibold'>{player.name}</td>
              <td>{player.position}</td>
              <td>{formatTeamName(player.team)}</td>
              <td>
                <div className='action-buttons'>
                  <button
                    type='button'
                    className='edit-btn'
                    onClick={() => onEdit(player)}
                    title='Edit player'
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type='button'
                    className='delete-btn'
                    onClick={() => onDelete(player.id)}
                    title='Delete player'
                  >
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
