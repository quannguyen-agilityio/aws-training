import { useState } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

import { ROUTES } from './constants/routes';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { PublicPlayersPage } from './pages/PublicPlayersPage';
import { AdminPage } from './pages/AdminPage';
import './App.css';

// Configure AWS Amplify Gen 2 backend outputs
Amplify.configure(outputs);

/**
 * Main Application Root Component
 * Handles client-side route state (Home Public Catalog vs Admin Management Portal),
 * renders layout Header and Footer, and mounts active page views.
 */
export function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(ROUTES.HOME);

  return (
    <div className="app-layout">
      <Header currentRoute={currentRoute} onNavigate={setCurrentRoute} />

      <main className="main-content">
        {currentRoute === ROUTES.HOME ? (
          <PublicPlayersPage />
        ) : (
          <AdminPage />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
