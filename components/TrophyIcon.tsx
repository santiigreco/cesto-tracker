
import React from 'react';

const TrophyIcon: React.FC<{ rank: number }> = ({ rank }) => {
  const colors: { [key: number]: string } = {
    1: 'text-yellow-400', // Gold
    2: 'text-gray-300',   // Silver
    3: 'text-yellow-600', // Bronze
  };
  const color = colors[rank] || 'text-gray-500';

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${color}`} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a6 6 0 00-6 6c0 1.887.646 3.633 1.726 5H4a1 1 0 00-1 1v2a1 1 0 001 1h1.583A6.012 6.012 0 0010 18a6.012 6.012 0 004.417-2H16a1 1 0 001-1v-2a1 1 0 00-1-1h-1.726A5.969 5.969 0 0016 8a6 6 0 00-6-6zm-3.293 9.293a1 1 0 010 1.414L5 14.414A3.99 3.99 0 0110 16a3.99 3.99 0 015-1.707l-1.707-1.707a1 1 0 010-1.414L15 10.293A4.004 4.004 0 0114 8c0-1.312-.636-2.5-1.682-3.268L10 7.05l-2.318-2.318C6.636 5.5 6 6.688 6 8c0 .79.23 1.523.634 2.121L3.293 11.293z" />
    </svg>
  );
};

export default TrophyIcon;
