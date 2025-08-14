import React, { useState, useRef } from 'react';
import { Shot, ShotPosition } from '../types';

interface CourtProps {
  shots: Shot[];
  onCourtClick?: (position: ShotPosition) => void;
  showShotMarkers?: boolean;
  children?: React.ReactNode;
  currentPlayer?: string;
}

// Court dimensions in meters for a vertical half-court view, extended by 1m.
const HALF_COURT_LENGTH = 16; // y-axis: 15m half-court + 1m behind
const COURT_WIDTH = 20;       // x-axis

// Markings positions in meters, based on a (0,0) at bottom-left coordinate system.
const BASKET_COORD_Y = HALF_COURT_LENGTH - 5;
const PENALTY_LINE_COORD_Y = HALF_COURT_LENGTH - 10;
const HALF_COURT_LINE_Y = 1;

const BASKET_DIAMETER = 0.9; // Increased for better visibility
const PENALTY_LINE_LENGTH = 1.5; // Made longer for visibility

const parquetBgUrl = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='80' height='20' viewBox='0 0 80 20'%3e%3crect width='80' height='20' fill='%23f0e0c0'/%3e%3cpath d='M10 0v20 M30 0v20 M50 0v20 M70 0v20' stroke='%23d9c0a0' stroke-width='0.5'/%3e%3c/svg%3e";

const Court: React.FC<CourtProps> = ({ shots, onCourtClick, showShotMarkers = true, children, currentPlayer }) => {
  const [pressPosition, setPressPosition] = useState<ShotPosition | null>(null);
  const pointerStartRef = useRef<{ x: number, y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const DRAG_THRESHOLD = 10; // pixels to move before it's considered a drag

  const getPositionFromEvent = (e: React.PointerEvent<HTMLDivElement>): ShotPosition => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    return {
      x: (clickX / rect.width) * COURT_WIDTH,
      y: (1 - (clickY / rect.height)) * HALF_COURT_LENGTH,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onCourtClick) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
    setPressPosition(getPositionFromEvent(e));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current || isDraggingRef.current) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > DRAG_THRESHOLD) {
      isDraggingRef.current = true;
      setPressPosition(null); // It's a drag, hide the indicator to allow scrolling
    } else {
      // Not a drag yet, keep updating the position for minor adjustments before release
      setPressPosition(getPositionFromEvent(e));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (onCourtClick && pressPosition && !isDraggingRef.current) {
      onCourtClick(pressPosition);
    }
    // Reset state after pointer up
    setPressPosition(null);
    pointerStartRef.current = null;
    isDraggingRef.current = false;
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    // If pointer leaves, we consider it a cancellation (likely a scroll action).
    if (pointerStartRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setPressPosition(null);
      pointerStartRef.current = null;
      isDraggingRef.current = false;
    }
  };

  return (
    <div className="w-full bg-gray-800 p-2 sm:p-4 rounded-lg shadow-lg">
      <div
        className={`relative ${onCourtClick ? 'cursor-crosshair' : ''} aspect-[4/5] w-full max-w-sm mx-auto rounded-md overflow-hidden border-2 border-white shadow-[0_0_0_2px_black]`}
        onPointerDown={onCourtClick ? handlePointerDown : undefined}
        onPointerMove={onCourtClick ? handlePointerMove : undefined}
        onPointerUp={onCourtClick ? handlePointerUp : undefined}
        onPointerLeave={onCourtClick ? handlePointerLeave : undefined}
        role={onCourtClick ? "button" : "img"}
        aria-label="Media cancha de Cestoball"
        style={{
          backgroundColor: '#f0e0c0',
          backgroundImage: `url("${parquetBgUrl}")`,
          backgroundSize: '80px 20px',
          touchAction: 'none', // Prevent default touch actions like scrolling
        }}
      >
        {/* Court Markings with borders */}
        <div 
          className="absolute w-full h-1 bg-white" 
          style={{ 
            top: `${((HALF_COURT_LENGTH - HALF_COURT_LINE_Y) / HALF_COURT_LENGTH) * 100}%`,
            left: '0',
            transform: 'translateY(-50%)',
            boxShadow: '0 0 0 1.5px black'
          }}
          title="Línea de triple"
        ></div>
        
        <div 
          className="absolute h-1 bg-white" 
          style={{ 
            top: `${((HALF_COURT_LENGTH - PENALTY_LINE_COORD_Y) / HALF_COURT_LENGTH) * 100}%`,
            left: '50%',
            width: `${(PENALTY_LINE_LENGTH / COURT_WIDTH) * 100}%`,
            transform: 'translateX(-50%) translateY(-50%)',
            boxShadow: '0 0 0 1.5px black'
          }}
          title="Línea de penal"
        ></div>
        
        {/* 2m Dotted Circle */}
        <div
          className="absolute rounded-full border-2 border-dashed border-white pointer-events-none aspect-square"
          style={{
            top: `${((HALF_COURT_LENGTH - BASKET_COORD_Y) / HALF_COURT_LENGTH) * 100}%`,
            left: `50%`,
            width: `${(4 / COURT_WIDTH) * 100}%`, // 2m radius = 4m diameter. Width based on court width.
            transform: 'translateX(-50%) translateY(-50%)',
            filter: 'drop-shadow(0 0 1.5px black)' // Use drop-shadow for outline on dashed line
          }}
          title="Línea de 2 metros"
        />

        <div 
          className="absolute rounded-full border-2 border-white bg-red-600 shadow-md aspect-square ring-2 ring-black"
          style={{ 
            top: `${((HALF_COURT_LENGTH - BASKET_COORD_Y) / HALF_COURT_LENGTH) * 100}%`,
            left: `50%`, 
            width: `${(BASKET_DIAMETER / COURT_WIDTH) * 100}%`,
            transform: 'translateX(-50%) translateY(-50%)' 
          }}
          title="Aro"
        ></div>

        {/* Press-and-hold indicator */}
        {pressPosition && currentPlayer && (
          <div
            className="absolute w-14 h-14 rounded-full bg-cyan-500/60 backdrop-blur-sm border-2 border-cyan-300 flex items-center justify-center font-bold text-white text-2xl pointer-events-none shadow-lg"
            style={{
              left: `${(pressPosition.x / COURT_WIDTH) * 100}%`,
              top: `${((HALF_COURT_LENGTH - pressPosition.y) / HALF_COURT_LENGTH) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {currentPlayer}
          </div>
        )}

        {/* Shot markers (conditionally rendered) */}
        {showShotMarkers && shots.map((shot) => (
          <div
            key={shot.id}
            className={`absolute w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-xl transform -translate-x-1/2 -translate-y-1/2 border-2 ${
              shot.isGol ? 'bg-green-500 border-white text-white' : 'bg-red-600 border-white text-white'
            }`}
            style={{
              left: `${(shot.position.x / COURT_WIDTH) * 100}%`,
              top: `${((HALF_COURT_LENGTH - shot.position.y) / HALF_COURT_LENGTH) * 100}%`,
            }}
            title={`Jugador ${shot.playerNumber} - ${shot.isGol ? `Gol (${shot.golValue} pts)` : 'Fallo'} en (${shot.position.x.toFixed(1)}, ${shot.position.y.toFixed(1)})`}
          >
            {shot.playerNumber}
          </div>
        ))}
        
        {/* Children for overlays like heatmaps */}
        {children}
      </div>
    </div>
  );
};

export default Court;