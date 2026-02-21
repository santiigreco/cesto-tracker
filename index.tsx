import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { GameProvider } from './context/GameContext';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { SyncProvider } from './context/SyncContext';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <UIProvider>
            <SyncProvider>
              <App />
            </SyncProvider>
          </UIProvider>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
