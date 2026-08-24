import React, { useState } from 'react';
import { Player, PlayerUpdateInput } from '../../types/player';

interface PlayerEditModalProps {
  player: Player;
  onClose: () => void;
  onSave: (updatedData: PlayerUpdateInput) => Promise<void>;
}

/**
 * PlayerEditModal Component
 * Modal dialog component for editing details of an existing player profile.
 */
export const PlayerEditModal: React.FC<PlayerEditModalProps> = ({
  player,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(player.name);
  const [position, setPosition] = useState(player.position);
  const [jerseyNumber, setJerseyNumber] = useState<string>(
    player.jerseyNumber !== null && player.jerseyNumber !== undefined
      ? String(player.jerseyNumber)
      : ''
  );
  const [team, setTeam] = useState(player.team || '');
  const [bio, setBio] = useState(player.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedData: PlayerUpdateInput = {
        id: player.id,
        name: name.trim(),
        position: position.trim(),
        jerseyNumber: jerseyNumber.trim() ? parseInt(jerseyNumber, 10) : null,
        team: team.trim() || null,
        bio: bio.trim() || null,
      };

      await onSave(updatedData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>✏️ Edit Player: {player.name}</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="edit-player-name">Name</label>
            <input
              id="edit-player-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-player-position">Position</label>
            <input
              id="edit-player-position"
              type="text"
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-player-jersey">Jersey Number</label>
            <input
              id="edit-player-jersey"
              type="number"
              value={jerseyNumber}
              onChange={(e) => setJerseyNumber(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-player-team">Team</label>
            <input
              id="edit-player-team"
              type="text"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-player-bio">Bio</label>
            <textarea
              id="edit-player-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
