import React, { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Player } from '../types/player';
import { dataClient } from '../services/amplifyClient';
import { PlayerGrid } from '../components/public/PlayerGrid';
import { PlayerFilter } from '../components/public/PlayerFilter';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

/**
 * PublicPlayersPage Component
 * Main public view that subscribes to real-time player catalog updates from AWS AppSync / DynamoDB.
 * Allows guest users and logged-in admins to filter and search player records without authorization failures.
 */
export const PublicPlayersPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');

  useEffect(() => {
    let isMounted = true;
    let sub: { unsubscribe: () => void } | null = null;

    const setupSubscription = async () => {
      try {
        const session = await fetchAuthSession();
        // Dynamically select authMode: 'userPool' if logged in as Admin, otherwise 'identityPool' for guests
        const authMode = session.tokens ? 'userPool' : 'identityPool';

        if (!isMounted) return;

        sub = dataClient.models.Player.observeQuery({
          authMode,
        }).subscribe({
          next: (data) => {
            if (isMounted) {
              setPlayers([...data.items] as Player[]);
              setLoading(false);
            }
          },
          error: (err: unknown) => {
            console.error('Error fetching player catalog:', err);
            if (isMounted) {
              setError('Failed to load player catalog.');
              setLoading(false);
            }
          },
        });
      } catch (err) {
        console.error('Error resolving auth session for catalog:', err);
        if (isMounted) {
          setError('Failed to load player catalog.');
          setLoading(false);
        }
      }
    };

    setupSubscription();

    return () => {
      isMounted = false;
      if (sub) sub.unsubscribe();
    };
  }, []);

  // Compute array of unique position strings for filter dropdown
  const uniquePositions = Array.from(
    new Set(players.map((p) => p.position).filter(Boolean))
  );

  // Filter players list by search query and position filter selection
  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.team && player.team.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPosition =
      selectedPosition === 'ALL' || player.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  return (
    <div className="page-container">
      <section className="hero-section">
        <h1 className="hero-title">🏆 Player Roster Catalog</h1>
        <p className="hero-subtitle">
          Explore official profiles, positions, and stats of our star players.
        </p>
      </section>

      {loading ? (
        <LoadingSpinner message="Fetching roster from cloud..." />
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : (
        <>
          <PlayerFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedPosition={selectedPosition}
            onPositionChange={setSelectedPosition}
            positions={uniquePositions}
          />
          <PlayerGrid players={filteredPlayers} />
        </>
      )}
    </div>
  );
};
