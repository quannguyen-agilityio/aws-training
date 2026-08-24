import React, { useState } from 'react';
import { PlayerCreateInput } from '../../types/player';

interface PlayerFormProps {
  onSubmit: (playerData: PlayerCreateInput) => Promise<void>;
}

/**
 * PlayerForm Component
 * Form interface allowing authenticated admin users to add a new player profile to the roster.
 */
export const PlayerForm: React.FC<PlayerFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState<string>('');
  const [team, setTeam] = useState('');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!name.trim() || !position.trim()) return;

    setSubmitting(true);
    try {
      const playerData: PlayerCreateInput = {
        name: name.trim(),
        position: position.trim(),
      };

      if (jerseyNumber.trim()) {
        playerData.jerseyNumber = parseInt(jerseyNumber, 10);
      }
      if (team.trim()) {
        playerData.team = team.trim();
      }
      if (bio.trim()) {
        playerData.bio = bio.trim();
      }

      await onSubmit(playerData);

      // Reset Form fields
      setName('');
      setPosition('');
      setJerseyNumber('');
      setTeam('');
      setBio('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h3>➕ Add New Player</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="admin-player-name">Player Name *</label>
          <input
            id="admin-player-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Morgan"
          />
        </div>
        <div className="form-group">
          <label htmlFor="admin-player-position">Position *</label>
          <input
            id="admin-player-position"
            type="text"
            required
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Forward"
          />
        </div>
        <div className="form-group">
          <label htmlFor="admin-player-jersey">Jersey Number</label>
          <input
            id="admin-player-jersey"
            type="number"
            value={jerseyNumber}
            onChange={(e) => setJerseyNumber(e.target.value)}
            placeholder="e.g. 10"
          />
        </div>
        <div className="form-group">
          <label htmlFor="admin-player-team">Team</label>
          <input
            id="admin-player-team"
            type="text"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="e.g. Strikers FC"
          />
        </div>
      </div>
      <div className="form-group full-width">
        <label htmlFor="admin-player-bio">Player Bio</label>
        <textarea
          id="admin-player-bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Brief description of the player..."
        />
      </div>
      <button type="submit" className="submit-btn" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Player Profile'}
      </button>
    </form>
  );
};
