

import React from 'react';
import JerseyIcon from './JerseyIcon';

interface PlayerSelectorProps {
  currentPlayer: string;
  setCurrentPlayer: (player: string) => void;
  showAllPlayersOption?: boolean;
  playerNames: Record<string, string>;
  availablePlayers: string[];
  isTutorialActive?: boolean;
}

/**
 * A component that displays clickable jersey icons for player selection.
 */
const PlayerSelector: React.FC<PlayerSelectorProps> = ({ currentPlayer, setCurrentPlayer, showAllPlayersOption = false, playerNames, availablePlayers, isTutorialActive = false }) => {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center">
        {showAllPlayersOption && (
          <button
            onClick={() => setCurrentPlayer('Todos')}
            className={`flex-shrink-0 font-bold py-3 px-5 rounded-lg transition duration-300 ease-in-out transform focus:outline-none shadow-lg ${
              currentPlayer === 'Todos'
                ? 'bg-cyan-600 text-white scale-105'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:scale-105'
            }`}
          >
            Todos
          </button>
        )}
        {availablePlayers.map((num, index) => (
          <div key={num} className="flex-shrink-0">
            <JerseyIcon
              number={num}
              name={playerNames[num]}
              isSelected={currentPlayer === num}
              onClick={setCurrentPlayer}
              isBlinking={isTutorialActive && index === 0 && !currentPlayer}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerSelector;