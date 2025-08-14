
import React from 'react';

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

export default JerseyIcon;
