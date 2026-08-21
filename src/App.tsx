import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import {
  formatJerseyNumber,
  formatTeamName,
  getPlayerAvatarUrl,
} from './utils/playerUtils';
import './App.css';

// Initialize the AWS Amplify Gen 2 Data Client with schema type safety
const client = generateClient<Schema>();

// Type alias for Player record based on generated Amplify Schema
type Player = Schema['Player']['type'];

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [team, setTeam] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // UI state for search and filter controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('Ready');

  useEffect(() => {
    fetchPlayers();
  }, []);

  /**
   * Fetch all player records from AWS AppSync / DynamoDB using Amplify Data Client.
   * Handles errors gracefully with fallback notification if backend is offline or sandbox is initializing.
   */
  const fetchPlayers = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data: items } = await client.models.Player.list();
      if (items) {
        setPlayers(items);
        setStatus('Connected to AWS Cloud');
      }
    } catch (err: unknown) {
      console.warn('Amplify list players notice:', err);
      setStatus('Offline / Sandbox Mode');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new player record to the cloud database.
   * Performs client side validation and fallback local state update for instant UI feedback.
   */
  const handleAddPlayer = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!name.trim() || !position.trim()) return;

    const playerInput = {
      name: name.trim(),
      position: position.trim(),
      jerseyNumber: jerseyNumber ? parseInt(jerseyNumber, 10) : undefined,
      team: team.trim() || undefined,
      bio: bio.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
    };

    // Reset input fields immediately
    setName('');
    setPosition('');
    setJerseyNumber('');
    setTeam('');
    setBio('');
    setAvatarUrl('');

    try {
      const { data: newPlayer } =
        await client.models.Player.create(playerInput);
      if (newPlayer) {
        setPlayers((prev) => [...prev, newPlayer]);
      } else {
        // Fallback optimistic object if API returns empty item
        const tempPlayer: Player = {
          id: Date.now().toString(),
          ...playerInput,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setPlayers((prev) => [...prev, tempPlayer]);
      }
    } catch (err: unknown) {
      console.warn('Amplify create player fallback notice:', err);
      const tempPlayer: Player = {
        id: Date.now().toString(),
        ...playerInput,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPlayers((prev) => [...prev, tempPlayer]);
    }
  };

  /**
   * Delete a player record by ID from DynamoDB and remove it from local component state.
   */
  const handleDeletePlayer = async (id: string): Promise<void> => {
    try {
      await client.models.Player.delete({ id });
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      console.warn('Amplify delete player fallback notice:', err);
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Derive unique player positions for the filter dropdown
  const positionsList = Array.from(
    new Set(players.map((p) => p.position).filter(Boolean)),
  );

  // Filter players based on search query and selected position
  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.team &&
        player.team.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPosition =
      selectedPosition === 'ALL' || player.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  return (
    <div className='app-container'>
      {/* App Header */}
      <header className='header'>
        <div className='badge-row'>
          <span className='badge badge-aws'>AWS Amplify Gen 2</span>
          <span className='badge badge-vite'>React + Vite + TS</span>
        </div>
        <h1 className='title'>🏆 Player Roster Management</h1>
        <p className='subtitle'>
          Connected to Amplify Data (AppSync GraphQL DynamoDB) & Auth (Cognito)
        </p>
      </header>

      {/* Cloud CLI Sandbox Info Card */}
      <section className='glass-card'>
        <div className='card-header'>
          <h2 className='card-title'>🚀 Amplify Backend Cloud Commands</h2>
          <span className='status-indicator'>{status}</span>
        </div>
        <p className='card-description'>
          Run your personal cloud sandbox stack to sync backend GraphQL models
          with your frontend:
        </p>
        <div className='cli-box'>
          <span>npx ampx sandbox</span>
          <span className='cli-code'>
            Deploy backend & sync amplify_outputs.json
          </span>
        </div>
        <div className='cli-box'>
          <span>npx ampx generate outputs</span>
          <span className='cli-code'>Generate configuration output file</span>
        </div>
      </section>

      {/* Add Player Form Card */}
      <section className='glass-card'>
        <div className='card-header'>
          <h2 className='card-title'>➕ Add New Player Profile</h2>
        </div>

        <form onSubmit={handleAddPlayer} className='player-form'>
          <div className='form-grid'>
            <div className='form-group'>
              <label htmlFor='name-input'>Player Name *</label>
              <input
                id='name-input'
                type='text'
                className='input-field'
                placeholder='e.g. Lionel Messi'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='position-input'>Position *</label>
              <input
                id='position-input'
                type='text'
                className='input-field'
                placeholder='e.g. Forward / Midfielder'
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='jersey-input'>Jersey Number</label>
              <input
                id='jersey-input'
                type='number'
                className='input-field'
                placeholder='e.g. 10'
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='team-input'>Team / Club</label>
              <input
                id='team-input'
                type='text'
                className='input-field'
                placeholder='e.g. Inter Miami'
                value={team}
                onChange={(e) => setTeam(e.target.value)}
              />
            </div>
          </div>

          <div className='form-grid' style={{ marginTop: '0.75rem' }}>
            <div className='form-group'>
              <label htmlFor='avatar-input'>Avatar Image URL (Optional)</label>
              <input
                id='avatar-input'
                type='url'
                className='input-field'
                placeholder='https://example.com/avatar.jpg'
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='bio-input'>Player Bio</label>
              <input
                id='bio-input'
                type='text'
                className='input-field'
                placeholder='Short bio or highlights...'
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          <button type='submit' className='btn-primary form-submit-btn'>
            Create Player Profile
          </button>
        </form>
      </section>

      {/* Player Catalog Roster Card */}
      <section className='glass-card'>
        <div className='card-header'>
          <h2 className='card-title'>
            ⚽ Player Roster Catalog ({filteredPlayers.length})
          </h2>
        </div>

        {/* Filter and Search Bar */}
        <div className='filter-row'>
          <input
            type='text'
            className='input-field search-input'
            placeholder='🔍 Search player by name or team...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className='input-field select-field'
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
          >
            <option value='ALL'>All Positions</option>
            {positionsList.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>

        {/* Player Roster Grid */}
        {loading ? (
          <div className='empty-state'>
            <p>Loading player roster from cloud...</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className='empty-state'>
            <p>No player profiles found. Add your first player above!</p>
          </div>
        ) : (
          <div className='player-grid'>
            {filteredPlayers.map((player) => (
              <div key={player.id} className='player-card'>
                <div className='jersey-badge'>
                  {formatJerseyNumber(player.jerseyNumber)}
                </div>
                <img
                  src={getPlayerAvatarUrl(player.name, player.avatarUrl)}
                  alt={player.name}
                  className='player-avatar'
                />
                <div className='player-details'>
                  <h3 className='player-name'>{player.name}</h3>
                  <span className='player-position'>{player.position}</span>
                  <div className='team-tag'>{formatTeamName(player.team)}</div>
                  {player.bio && <p className='player-bio'>{player.bio}</p>}
                </div>
                <button
                  onClick={() => handleDeletePlayer(player.id)}
                  className='btn-delete'
                  title='Delete player profile'
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
