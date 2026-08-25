import React, { useEffect, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Player, PlayerCreateInput, PlayerUpdateInput } from '../types/player';
import { dataClient } from '../services/amplifyClient';
import { PlayerForm } from '../components/admin/PlayerForm';
import { PlayerTable } from '../components/admin/PlayerTable';
import { PlayerEditModal } from '../components/admin/PlayerEditModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

/**
 * AdminPage Component
 * Authenticated management view protected by AWS Amplify UI Authenticator.
 * Allows logged-in admin users to perform full CRUD operations on Player profiles.
 */
/**
 * AdminContent Component
 * Rendered only after successful authentication via Authenticator.
 * Subscribes to live player data updates using userPool auth mode.
 */
const AdminContent: React.FC<{ signOut?: () => void }> = ({ signOut }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  useEffect(() => {
    // Subscribe to live player data updates for live admin view synchronization (defaults to userPool)
    const sub = dataClient.models.Player.observeQuery().subscribe({
      next: (data) => {
        setPlayers([...data.items] as Player[]);
        setLoading(false);
      },
      error: (err: unknown) => {
        console.error('Failed to subscribe to players:', err);
        setLoading(false);
      },
    });

    return () => sub.unsubscribe();
  }, []);

  const handleCreatePlayer = async (data: PlayerCreateInput): Promise<void> => {
    try {
      const res = await dataClient.models.Player.create(data);
      if (res.errors && res.errors.length > 0) {
        console.error('GraphQL errors creating player:', res.errors);
        alert(`Failed to create player: ${res.errors[0].message}`);
      }
    } catch (err: unknown) {
      console.error('Error creating player:', err);
      alert('Failed to create player.');
    }
  };

  const handleUpdatePlayer = async (data: PlayerUpdateInput): Promise<void> => {
    try {
      const res = await dataClient.models.Player.update(data);
      if (res.errors && res.errors.length > 0) {
        console.error('GraphQL errors updating player:', res.errors);
        alert(`Failed to update player: ${res.errors[0].message}`);
      }
    } catch (err: unknown) {
      console.error('Error updating player:', err);
      alert('Failed to update player.');
    }
  };

  const handleDeletePlayer = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    try {
      const res = await dataClient.models.Player.delete({ id });
      if (res.errors && res.errors.length > 0) {
        console.error('GraphQL errors deleting player:', res.errors);
        alert(`Failed to delete player: ${res.errors[0].message}`);
      }
    } catch (err: unknown) {
      console.error('Error deleting player:', err);
      alert('Failed to delete player.');
    }
  };

  return (
    <main className='admin-portal'>
      <header className='admin-header'>
        <div>
          <h2>🔐 Admin Management Portal</h2>
        </div>
        <button className='signout-btn' onClick={signOut}>
          Sign Out 👋
        </button>
      </header>

      <PlayerForm onSubmit={handleCreatePlayer} />

      <section className='table-section'>
        <h3>📋 Manage Players ({players.length})</h3>
        {loading ? (
          <LoadingSpinner message='Loading management data...' />
        ) : (
          <PlayerTable
            players={players}
            onEdit={(player) => setEditingPlayer(player)}
            onDelete={handleDeletePlayer}
          />
        )}
      </section>

      {editingPlayer && (
        <PlayerEditModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSave={handleUpdatePlayer}
        />
      )}
    </main>
  );
};

/**
 * AdminPage Component
 * Authenticated management view protected by AWS Amplify UI Authenticator.
 * Allows logged-in admin users to perform full CRUD operations on Player profiles.
 */
export const AdminPage: React.FC = () => {
  return (
    <div className='page-container admin-container'>
      <Authenticator>
        {({ signOut }) => <AdminContent signOut={signOut} />}
      </Authenticator>
    </div>
  );
};
