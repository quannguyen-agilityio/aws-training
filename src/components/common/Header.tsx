import React from 'react';
import { ROUTES } from '../../constants/routes';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

/**
 * Common Header UI component with navigation options.
 */
export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo-section" onClick={() => onNavigate(ROUTES.HOME)}>
          <span className="logo-icon">⚡</span>
          <span className="logo-text">AWS Roster</span>
        </div>
        <nav className="nav-links">
          <button
            type="button"
            className={`nav-btn ${currentRoute === ROUTES.HOME ? 'active' : ''}`}
            onClick={() => onNavigate(ROUTES.HOME)}
          >
            Public Catalog
          </button>
          <button
            type="button"
            className={`nav-btn admin-link ${currentRoute === ROUTES.ADMIN ? 'active' : ''}`}
            onClick={() => onNavigate(ROUTES.ADMIN)}
          >
            Admin Portal 🔐
          </button>
        </nav>
      </div>
    </header>
  );
};
