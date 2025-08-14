
import React, { useState } from 'react';
import JerseyIcon from './JerseyIcon';
import WhatsappIcon from './WhatsappIcon';

const allPlayers = Array.from({ length: 15 }, (_, i) => String(i + 1));

interface PlayerSetupProps {
  onSetupComplete: (selectedPlayers: string[]) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onSetupComplete }) => {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());

  const togglePlayer = (playerNumber: string) => {
    setSelectedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerNumber)) {
        newSet.delete(playerNumber);
      } else {
        newSet.add(playerNumber);
      }
      return newSet;
    });
  };

  const handleStart = () => {
    const sortedPlayers = Array.from(selectedPlayers).sort((a, b) => Number(a) - Number(b));
    onSetupComplete(sortedPlayers);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-2xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight mb-4">
          Bienvenido a Cesto Tracker 🏐
        </h1>
        <div className="text-gray-300 mb-8 space-y-4 max-w-xl mx-auto">
            <p className="text-lg">
                Lleva el registro preciso de cada tiro, analiza el rendimiento del equipo y de los jugadores, y mejora tu estrategia partido a partido.
            </p>
            <p className="text-base text-gray-400">
                Selecciona los jugadores que participarán en el partido, registra cada tiro con precisión y analiza el rendimiento del equipo y de los jugadores para mejorar partido a partido.
            </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center mb-8">
          {allPlayers.map(num => {
            const isSelected = selectedPlayers.has(num);
            return (
              <JerseyIcon
                key={num}
                number={num}
                isSelected={isSelected}
                onClick={togglePlayer}
              />
            );
          })}
        </div>
        
        <button
          onClick={handleStart}
          disabled={selectedPlayers.size === 0}
          className="w-full max-w-sm bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
        >
          Comenzar Partido
        </button>
      </div>
       <footer className="w-full text-center text-gray-500 text-xs mt-8 pb-4">
        Santiago Greco - All rights reserved. Gresolutions © 2025
      </footer>

      <a
        href="https://api.whatsapp.com/send/?phone=5491163303194&text=Hola!%20Estuve%20probando%20la%20app%20Cesto%20Tracker%20y...."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-400 flex items-center gap-2"
        aria-label="Enviar feedback por WhatsApp"
        title="Enviar feedback por WhatsApp"
      >
        <WhatsappIcon className="h-6 w-6" />
        <span className="text-sm">Feedback</span>
      </a>
    </div>
  );
};

export default PlayerSetup;
