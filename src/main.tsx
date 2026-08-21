import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App';
import './index.css';

try {
  import('../amplify_outputs.json')
    .then((outputs) => {
      Amplify.configure(outputs.default || outputs);
    })
    .catch((err) => {
      console.warn('Amplify outputs load warning:', err);
    });
} catch (e) {
  console.warn('Amplify configure exception:', e);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
