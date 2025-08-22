import React from 'react';
import { Shot } from '../types';

// Constants for Heatmap
const HEATMAP_POINT_RADIUS = 60; // px, increased for more intensity
const HEATMAP_BLUR = 35; // px, increased for more intensity
const HEATMAP_OPACITY = 0.8; // increased opacity

/**
 * The Heatmap overlay component.
 * It renders a visual representation of shot density.
 */
const HeatmapOverlay: React.FC<{ shots: Shot[] }> = ({ shots }) => {
  // Use red tones for all filters for high visibility, as requested.
  const gradientColor = 'rgba(239, 68, 68, '; // Tailwind's red-500

  return (
    <div className="absolute inset-0 pointer-events-none">
      {shots.map(shot => (
        <div
          key={shot.id}
          className="absolute rounded-full"
          style={{
            left: `${(shot.position.x / 20) * 100}%`, // COURT_WIDTH is 20
            top: `${((16 - shot.position.y) / 16) * 100}%`, // HALF_COURT_LENGTH is 16
            width: `${HEATMAP_POINT_RADIUS * 2}px`,
            height: `${HEATMAP_POINT_RADIUS * 2}px`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${gradientColor}${HEATMAP_OPACITY}) 0%, ${gradientColor}0) 70%)`,
            filter: `blur(${HEATMAP_BLUR}px)`,
          }}
        />
      ))}
    </div>
  );
};

export default HeatmapOverlay;