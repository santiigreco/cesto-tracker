


import React from 'react';

/**
 * A reusable SVG icon component for a player jersey, styled as a T-shirt.
 */
const JerseyIcon: React.FC<{
  number: string;
  name?: string;
  isSelected: boolean;
  onClick: (number: string) => void;
  isBlinking?: boolean;
}> = React.memo(({ number, name, isSelected, onClick, isBlinking = false }) => {
  const jerseyColor = isSelected ? 'fill-cyan-500' : 'fill-slate-700';
  const textColor = isSelected ? 'fill-white' : 'fill-slate-200';
  const strokeColor = isSelected ? 'stroke-cyan-300' : 'stroke-slate-600';

  return (
    <>
      <style>
        {`
            @keyframes pulse-jersey {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.15);
              }
            }
            .animate-pulse-jersey {
              animation: pulse-jersey 1.5s infinite ease-in-out;
            }
            @keyframes border-pulse {
              0% { stroke-opacity: 1; transform: scale(1.05); }
              50% { stroke-opacity: 0.5; transform: scale(1.1); }
              100% { stroke-opacity: 1; transform: scale(1.05); }
            }
            .animate-border-pulse {
              animation: border-pulse 1.5s infinite ease-in-out;
              transform-origin: center center;
            }
        `}
      </style>
      <button
        onClick={() => onClick(number)}
        className={`relative transition-transform duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none rounded-lg ${isBlinking ? 'animate-pulse-jersey' : ''}`}
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
          {isBlinking && (
              <circle
                cx="12"
                cy="12"
                r="11"
                fill="none"
                stroke="#FBBF24" // Tailwind amber-400
                strokeWidth="1.5"
                strokeDasharray="4 2"
                className="animate-border-pulse"
              />
          )}
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
    </>
  );
});

export default JerseyIcon;