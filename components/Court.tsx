
import React from 'react';
import { Shot, ShotPosition } from '../types';

interface CourtProps {
  shots: Shot[];
  onCourtClick?: (position: ShotPosition) => void;
  showShotMarkers?: boolean;
  children?: React.ReactNode;
}

// Court dimensions in meters for a vertical half-court view, extended by 1m.
const HALF_COURT_LENGTH = 16; // y-axis: 15m half-court + 1m behind
const COURT_WIDTH = 20;       // x-axis

// Markings positions in meters, based on a (0,0) at bottom-left coordinate system.
const BASKET_COORD_Y = HALF_COURT_LENGTH - 5;
const PENALTY_LINE_COORD_Y = HALF_COURT_LENGTH - 10;
const HALF_COURT_LINE_Y = 1;

const BASKET_DIAMETER = 0.8; // Increased for better visibility
const PENALTY_LINE_LENGTH = 0.5;

const parquetBgUrl = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='80' height='20' viewBox='0 0 80 20'%3e%3crect width='80' height='20' fill='%23e0cda9'/%3e%3cpath d='M0 10h80M10 0v20M30 0v20M50 0v20M70 0v20' stroke='%23d1bfa1' stroke-width='0.5'/%3e%3c/svg%3e";

const Court: React.FC<CourtProps> = ({ shots, onCourtClick, showShotMarkers = true, children }) => {
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onCourtClick) return; // Do nothing if no click handler is provided

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const position: ShotPosition = {
      x: (clickX / rect.width) * COURT_WIDTH,
      y: (1 - (clickY / rect.height)) * HALF_COURT_LENGTH,
    };
    
    onCourtClick(position);
  };

  return (
    <div className="w-full bg-gray-800 p-2 sm:p-4 rounded-lg shadow-lg">
      <div
        className={`relative ${onCourtClick ? 'cursor-crosshair' : ''} aspect-[4/5] w-full max-w-sm mx-auto rounded-md overflow-hidden border-4 border-white/40`}
        onClick={handleClick}
        role={onCourtClick ? "button" : "img"}
        aria-label="Media cancha de Cestoball"
        style={{
          backgroundColor: '#e0cda9',
          backgroundImage: `url("${parquetBgUrl}")`,
          backgroundSize: '80px 20px',
        }}
      >
        {/* Court Markings */}
        <div 
          className="absolute w-full h-1 bg-white/50" 
          style={{ 
            top: `${((HALF_COURT_LENGTH - HALF_COURT_LINE_Y) / HALF_COURT_LENGTH) * 100}%`,
            left: '0',
            transform: 'translateY(-50%)'
          }}
          title="Línea de triple"
        ></div>
        
        <div 
          className="absolute h-1 bg-white/70" 
          style={{ 
            top: `${((HALF_COURT_LENGTH - PENALTY_LINE_COORD_Y) / HALF_COURT_LENGTH) * 100}%`,
            left: '50%',
            width: `${(PENALTY_LINE_LENGTH / COURT_WIDTH) * 100}%`,
            transform: 'translateX(-50%) translateY(-50%)'
          }}
        ></div>
        
        <div 
          className="absolute rounded-full border-2 border-white bg-red-600 shadow-md aspect-square"
          style={{ 
            top: `${((HALF_COURT_LENGTH - BASKET_COORD_Y) / HALF_COURT_LENGTH) * 100}%`,
            left: `50%`, 
            width: `${(BASKET_DIAMETER / COURT_WIDTH) * 100}%`,
            transform: 'translateX(-50%) translateY(-50%)' 
          }}
          title="Gol"
        ></div>

        {/* Shot markers (conditionally rendered) */}
        {showShotMarkers && shots.map((shot) => (
          <div
            key={shot.id}
            className={`absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center font-bold text-xs shadow-xl transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              shot.isGol ? 'bg-green-500 border-2 border-green-200 text-green-900' : 'bg-red-600 border-2 border-red-300 text-red-900'
            }`}
            style={{
              left: `${(shot.position.x / COURT_WIDTH) * 100}%`,
              top: `${((HALF_COURT_LENGTH - shot.position.y) / HALF_COURT_LENGTH) * 100}%`,
            }}
            title={`Jugador ${shot.playerNumber} - ${shot.isGol ? `Gol (${shot.golValue} pts)` : 'Fallo'} en (${shot.position.x.toFixed(1)}, ${shot.position.y.toFixed(1)})`}
          >
            {shot.isGol ? '✓' : '✗'}
          </div>
        ))}
        
        {/* Children for overlays like heatmaps */}
        {children}
      </div>
    </div>
  );
};

export default Court;
