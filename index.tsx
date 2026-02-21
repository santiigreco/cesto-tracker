import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GameProvider } from './context/GameContext';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <GameProvider>
          <App />
          <Toaster position="top-center" theme="dark" richColors />
      </GameProvider>
    </BrowserRouter>
  </React.StrictMode>
);
