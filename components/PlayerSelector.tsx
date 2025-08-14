
import React from 'react';
import JerseyIcon from './JerseyIcon';

interface PlayerSelectorProps {
  currentPlayer: string;
  setCurrentPlayer: (player: string) => void;
  showAllPlayersOption?: boolean;
  playerNames: Record<string, string>;
  availablePlayers: string[];
}

/**
 * A component that displays clickable jersey icons for player selection.
 */
const PlayerSelector: React.FC<PlayerSelectorProps> = ({ currentPlayer, setCurrentPlayer, showAllPlayersOption = false, playerNames, availablePlayers }) => {
  return (
    <div>
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center">
        {showAllPlayersOption && (
          <button
            onClick={() => setCurrentPlayer('Todos')}
            className={`font-bold py-3 px-5 rounded-lg transition duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg ${
              currentPlayer === 'Todos'
                ? 'bg-cyan-600 text-white ring-cyan-500 scale-105'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:scale-105'
            }`}
          >
            Todos
          </button>
        )}
        {availablePlayers.map((num) => (
          <JerseyIcon
            key={num}
            number={num}
            name={playerNames[num]}
            isSelected={currentPlayer === num}
            onClick={setCurrentPlayer}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayerSelector;
