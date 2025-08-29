import React, { useState, useMemo, useRef } from 'react';
import { Shot, PlayerStats } from '../types';

interface TemporalChartProps {
  shots: Shot[];
  playerNames: Record<string, string>;
  stats: PlayerStats[];
}

const COLORS = [
  '#22d3ee', // cyan-400
  '#34d399', // emerald-400
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
  '#60a5fa', // blue-400
];

interface DataPoint {
  shotIndex: number; // 1-based index of the shot in the game
  [playerNumber: string]: number | undefined; // goals for each player
}

const TemporalChart: React.FC<TemporalChartProps> = ({ shots, playerNames, stats }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    shotIndex: number;
    playerData: { name: string; color: string; goles: number }[];
  } | null>(null);

  const activePlayers = useMemo(() => {
    return stats.sort((a, b) => Number(a.playerNumber) - Number(b.playerNumber)).map(p => p.playerNumber);
  }, [stats]);

  // Simplified data processing for goals only
  const { goalData, maxShots, maxGoals } = useMemo(() => {
    if (shots.length === 0) {
      return { goalData: [], maxShots: 0, maxGoals: 0 };
    }

    const goalDataPoints: DataPoint[] = [{ shotIndex: 0 }];
    activePlayers.forEach(p => {
        goalDataPoints[0][p] = 0;
    });

    let maxG = 0;
    
    const playerCounters: Record<string, { goles: number }> = {};
    activePlayers.forEach(p => {
        playerCounters[p] = { goles: 0 };
    });

    shots.forEach((shot, index) => {
        const { playerNumber, isGol } = shot;
        // Only the shooting player's goal count can change at this step.
        if (playerCounters[playerNumber] && isGol) {
            playerCounters[playerNumber].goles++;
        }
        
        const newGoalPoint: DataPoint = { shotIndex: index + 1 };

        // Record the current goal count for ALL players at this shot index.
        activePlayers.forEach(p => {
            newGoalPoint[p] = playerCounters[p].goles;
            if (playerCounters[p].goles > maxG) {
                maxG = playerCounters[p].goles;
            }
        });
        
        goalDataPoints.push(newGoalPoint);
    });

    return {
      goalData: goalDataPoints,
      maxShots: shots.length,
      maxGoals: Math.max(5, maxG), // Ensure a minimum height for the y-axis
    };
  }, [shots, activePlayers]);
  
  const getPointerPosition = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return null;
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
    const inverted = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    return inverted;
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const pos = getPointerPosition(e);
    if (!pos || shots.length < 1) return;
    
    const shotIndexFloat = (pos.x / 100) * maxShots;
    const shotIndex = Math.round(shotIndexFloat);
    
    if (shotIndex >= 0 && shotIndex <= maxShots) {
        const playerData = activePlayers.map((p, i) => ({
            name: playerNames[p] || `Jugador #${p}`,
            color: COLORS[i % COLORS.length],
            goles: goalData[shotIndex]?.[p] ?? 0,
        }));

        setTooltip({
            x: (shotIndex / maxShots) * 100,
            y: pos.y,
            shotIndex,
            playerData,
        });
    } else {
        setTooltip(null);
    }
  };
  
  const handlePointerLeave = () => {
    setTooltip(null);
  };
  
  if (shots.length === 0) {
    return <div className="text-center text-slate-400 p-4">Registra tiros para ver el gráfico temporal.</div>;
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox="0 0 100 60"
        className="w-full cursor-crosshair"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* Y-axis labels and grid lines */}
        {Array.from({ length: maxGoals + 1 }).map((_, i) => {
            if (i > 0 && i % Math.ceil(maxGoals / 5) === 0) {
                const y = 55 - (i / maxGoals) * 50;
                return (
                    <g key={`y-grid-${i}`}>
                        <line x1="0" y1={y} x2="100" y2={y} stroke="#334155" strokeWidth="0.2" />
                        <text x="-1" y={y} fill="#94a3b8" fontSize="3" textAnchor="end" dominantBaseline="middle">{i}</text>
                    </g>
                );
            }
            return null;
        })}
        {/* X-axis labels and grid lines */}
         {Array.from({ length: Math.min(maxShots, 10) + 1 }).map((_, i) => {
            const shotNum = Math.round(i * (maxShots / Math.min(maxShots, 10)));
            if (shotNum > 0) {
                const x = (shotNum / maxShots) * 100;
                return (
                     <g key={`x-grid-${shotNum}`}>
                        <line x1={x} y1="5" x2={x} y2="55" stroke="#334155" strokeWidth="0.2" strokeDasharray="1 1" />
                        <text x={x} y="59" fill="#94a3b8" fontSize="3" textAnchor="middle">{shotNum}</text>
                    </g>
                );
            }
             return null;
         })}
        
        {/* Base Lines */}
        <line x1="0" y1="55" x2="100" y2="55" stroke="#475569" strokeWidth="0.3" />

        {/* Player Lines for Goals */}
        {activePlayers.map((player, index) => {
            const color = COLORS[index % COLORS.length];
            // Goals line (solid)
            const goalPath = goalData.map(d => `${(d.shotIndex / maxShots) * 100},${55 - ((d[player] ?? 0) / maxGoals) * 50}`).join(' ');

            return (
                <g key={player}>
                    <polyline points={goalPath} fill="none" stroke={color} strokeWidth="0.6" />
                </g>
            );
        })}

        {/* Tooltip line and data */}
        {tooltip && (
            <>
                <line x1={tooltip.x} y1="5" x2={tooltip.x} y2="55" stroke="#f8fafc" strokeWidth="0.3" />
                <foreignObject x={tooltip.x > 70 ? tooltip.x - 30 : tooltip.x + 2} y="5" width="28" height="50">
                     <div className="bg-slate-900/80 p-1.5 rounded-md border border-slate-600 text-[3px] text-white overflow-y-auto">
                        <p className="font-bold mb-1">Tiro #{tooltip.shotIndex}</p>
                        {tooltip.playerData.map(p => (
                             <div key={p.name} className="flex justify-between items-center" style={{ color: p.color }}>
                                 <span>{p.name.substring(0, 10)}</span>
                                 <span className="font-mono ml-1">{p.goles} Goles</span>
                             </div>
                        ))}
                    </div>
                </foreignObject>
            </>
        )}
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs">
        {activePlayers.map((p, i) => {
            const color = COLORS[i % COLORS.length];
            return (
                <div key={`legend-${p}`} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                    <span>{playerNames[p] || `Jugador ${p}`}</span>
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default TemporalChart;
