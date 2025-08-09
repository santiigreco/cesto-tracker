
import React from 'react';

interface PlayerSelectorProps {
  currentPlayer: string;
  setCurrentPlayer: (player: string) => void;
  showAllPlayersOption?: boolean;
  playerNames: Record<string, string>;
}

// Generate jersey numbers from 1 to 15
const jerseyNumbers = Array.from({ length: 15 }, (_, i) => String(i + 1));

/**
 * A reusable SVG icon component for a player jersey, styled as a T-shirt.
 */
const JerseyIcon: React.FC<{
  number: string;
  name?: string;
  isSelected: boolean;
  onClick: (number: string) => void;
}> = ({ number, name, isSelected, onClick }) => {
  const jerseyColor = isSelected ? 'fill-cyan-500' : 'fill-gray-700';
  const textColor = isSelected ? 'fill-white' : 'fill-gray-200';
  const strokeColor = isSelected ? 'stroke-cyan-300' : 'stroke-gray-600';

  return (
    <button
      onClick={() => onClick(number)}
      className="transition-transform duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400 rounded-lg"
      aria-pressed={isSelected}
      aria-label={`Seleccionar ${name || `Jugador ${number}`}`}
      title={name || `Jugador ${number}`}
    >
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={`drop-shadow-lg transition-all duration-200 ${isSelected ? 'scale-110' : ''}`}
      >
        <path
          d="M6,3 C7,2 17,2 18,3 L21,5 V8 H18 V21 H6 V8 H3 V5 Z"
          className={`transition-colors ${jerseyColor} ${strokeColor}`}
          strokeWidth="0.75"
        />
        <text
          x="12"
          y="14"
          textAnchor="middle"
          dominantBaseline="central"
          className={`transition-colors ${textColor} font-sans font-bold select-none`}
          fontSize="8.5"
        >
          {number}
        </text>
      </svg>
    </button>
  );
};


/**
 * A component that displays clickable jersey icons for player selection.
 */
const PlayerSelector: React.FC<PlayerSelectorProps> = ({ currentPlayer, setCurrentPlayer, showAllPlayersOption = false, playerNames }) => {
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
        {jerseyNumbers.map((num) => (
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
