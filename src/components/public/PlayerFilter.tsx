import React from 'react';

interface PlayerFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedPosition: string;
  onPositionChange: (value: string) => void;
  positions: string[];
}

/**
 * PlayerFilter Component
 * Provides search input box and position filter select dropdown to filter the roster.
 */
export const PlayerFilter: React.FC<PlayerFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedPosition,
  onPositionChange,
  positions,
}) => {
  return (
    <div className="filter-bar">
      <input
        type="text"
        className="search-input"
        placeholder="🔍 Search player by name or team..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select
        className="position-select"
        value={selectedPosition}
        onChange={(e) => onPositionChange(e.target.value)}
      >
        <option value="ALL">All Positions</option>
        {positions.map((pos) => (
          <option key={pos} value={pos}>
            {pos}
          </option>
        ))}
      </select>
    </div>
  );
};
