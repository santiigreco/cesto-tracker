
import React, { useMemo } from 'react';
import { GameState, PlayerStats } from '../types';
import StatisticsView from './StatisticsView';
import Court from './Court';
import HeatmapOverlay from './HeatmapOverlay';
import ZoneChart from './ZoneChart';
import TeamLogo from './TeamLogo';

interface ShareReportProps {
    gameState: GameState;
    playerStats: PlayerStats[];
    viewMode: 'summary' | 'detailed';
}

const ShareReport: React.FC<ShareReportProps> = ({ gameState, playerStats, viewMode }) => {
    const { shots, playerNames, gameMode, tallyStats, settings } = gameState;
    const showMaps = gameMode === 'shot-chart' && shots.length > 0;

    // Calculate aggregated stats for Summary Card
    const summaryData = useMemo(() => {
        let totalPoints = 0;
        let totalGoles = 0;
        let totalTriples = 0;
        let totalFallos = 0;
        let totalRecuperos = 0;
        let totalPerdidas = 0;
        const playersMap: Record<string, { points: number, name: string }> = {};

        if (gameMode === 'stats-tally') {
            Object.entries(tallyStats).forEach(([playerNum, stats]) => {
                 if (playerNum === 'Equipo') return; // Skip aggregate team entry
                 const fh = stats['First Half'];
                 const sh = stats['Second Half'];
                 
                 const pPoints = ((fh.goles + sh.goles) * 2) + ((fh.triples + sh.triples) * 3);
                 totalPoints += pPoints;
                 totalGoles += fh.goles + sh.goles;
                 totalTriples += fh.triples + sh.triples;
                 totalFallos += fh.fallos + sh.fallos;
                 totalRecuperos += fh.recuperos + sh.recuperos;
                 totalPerdidas += fh.perdidas + sh.perdidas;

                 playersMap[playerNum] = { 
                     points: pPoints, 
                     name: playerNames[playerNum] || `#${playerNum}` 
                 };
            });
        } else {
             // Shot chart mode
             playerStats.forEach(p => {
                 totalPoints += p.totalPoints;
                 totalGoles += p.totalGoles;
                 // Triples not explicitly tracked in standard PlayerStats for shot-chart yet without recalculation
                 // Simplified for now based on available props
                 playersMap[p.playerNumber] = {
                     points: p.totalPoints,
                     name: playerNames[p.playerNumber] || `#${p.playerNumber}`
                 };
             });
             // Calculate totals from shots directly for accuracy
             shots.forEach(s => {
                 if(!s.isGol) totalFallos++;
             });
        }

        const sortedPlayers = Object.values(playersMap).sort((a,b) => b.points - a.points);
        const mvp = sortedPlayers[0];
        const totalShots = totalGoles + totalTriples + totalFallos;
        const efficiency = totalShots > 0 ? ((totalGoles + totalTriples) / totalShots * 100).toFixed(0) : '0';

        return { totalPoints, totalGoles, totalTriples, totalFallos, totalRecuperos, totalPerdidas, mvp, efficiency };
    }, [gameState, playerStats]);


    // --- VIRAL CARD LAYOUT (SUMMARY) ---
    if (viewMode === 'summary') {
        return (
            <div className="w-[450px] bg-slate-900 text-white font-sans relative overflow-hidden flex flex-col items-center">
                 {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 w-full p-8 flex flex-col items-center gap-6">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-3">
                             {/* Show logo if available, or just space */}
                             <TeamLogo teamName={settings.myTeam || ''} className="h-16 w-16" />
                        </div>
                        <h3 className="text-cyan-400 tracking-widest text-sm font-bold uppercase mb-1">
                            {settings.myTeam ? settings.myTeam : 'Resultado Final'}
                        </h3>
                        <h1 className="text-2xl font-bold text-white leading-tight break-words max-w-[350px]">
                            {settings.gameName || 'Partido Amistoso'}
                        </h1>
                        <p className="text-slate-400 text-xs mt-1">{new Date().toLocaleDateString()}</p>
                    </div>

                    {/* Main Score */}
                    <div className="flex flex-col items-center justify-center py-4 border-y border-slate-800 w-full">
                        <span className="text-8xl font-black text-white leading-none tracking-tighter drop-shadow-2xl">
                            {summaryData.totalPoints}
                        </span>
                        <span className="text-lg font-medium text-slate-400 mt-2 uppercase tracking-wide">Puntos Totales</span>
                    </div>

                    {/* Stats Grid */}
                    <div className="w-full grid grid-cols-2 gap-4">
                         <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center">
                             <span className="text-3xl font-bold text-green-400">{summaryData.efficiency}%</span>
                             <span className="text-[10px] text-slate-400 uppercase font-bold mt-1">Efectividad</span>
                         </div>
                         <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center">
                             <span className="text-3xl font-bold text-blue-400">{summaryData.totalTriples}</span>
                             <span className="text-[10px] text-slate-400 uppercase font-bold mt-1">Triples</span>
                         </div>
                         <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center">
                             <span className="text-3xl font-bold text-white">{summaryData.totalRecuperos}</span>
                             <span className="text-[10px] text-slate-400 uppercase font-bold mt-1">Recuperos</span>
                         </div>
                         <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center">
                             <span className="text-3xl font-bold text-red-400">{summaryData.totalPerdidas}</span>
                             <span className="text-[10px] text-slate-400 uppercase font-bold mt-1">Pérdidas</span>
                         </div>
                    </div>

                    {/* MVP Section */}
                    {summaryData.mvp && (
                        <div className="w-full bg-gradient-to-r from-slate-800 to-slate-800/50 p-4 rounded-xl border-l-4 border-cyan-500 flex items-center justify-between">
                             <div>
                                 <span className="block text-[10px] text-cyan-400 font-bold uppercase mb-0.5">Máxima Anotadora</span>
                                 <span className="text-xl font-bold text-white">{summaryData.mvp.name}</span>
                             </div>
                             <div className="bg-cyan-500/20 px-3 py-1 rounded-lg">
                                 <span className="text-xl font-bold text-cyan-300">{summaryData.mvp.points} <span className="text-xs">pts</span></span>
                             </div>
                        </div>
                    )}

                    {/* Footer / Branding */}
                    <div className="mt-2 pt-4 w-full flex justify-between items-center opacity-70">
                        <div className="flex items-center gap-2">
                             <span className="text-xl">🏐</span>
                             <span className="font-bold text-sm tracking-tight">Cesto Tracker</span>
                        </div>
                        <span className="text-[10px] text-slate-500">cestotracker.com</span>
                    </div>
                </div>
            </div>
        );
    }

    // --- DETAILED LAYOUT (CLASSIC) ---
    return (
        <div className="p-8 bg-slate-900 text-slate-200 font-sans max-w-[800px] mx-auto">
            <div className="flex flex-col items-center mb-6">
                <TeamLogo teamName={settings.myTeam || ''} className="h-20 w-20 mb-4" />
                <h1 className="text-4xl font-bold text-cyan-400 text-center mb-1">{settings.myTeam ? `${settings.myTeam} - ` : ''}{settings.gameName || 'Reporte de Partido'}</h1>
                <p className="text-center text-slate-400 text-lg">Generado con Cesto Tracker el {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="space-y-8">
                <StatisticsView 
                    externalStats={playerStats} 
                    externalPlayerNames={playerNames} 
                    externalShots={shots} 
                    isSharing={true}
                    externalGameMode={gameMode}
                    externalTallyStats={tallyStats} 
                />

                {showMaps && (
                    <>
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg break-inside-avoid">
                            <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">Mapa de Tiros</h2>
                            <div className="w-full max-w-[400px] mx-auto">
                                <Court shots={shots} showShotMarkers={true} />
                            </div>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg break-inside-avoid">
                            <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">Mapa de Calor</h2>
                            <div className="w-full max-w-[400px] mx-auto">
                                <Court shots={[]}>
                                    <HeatmapOverlay shots={shots} />
                                </Court>
                            </div>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg break-inside-avoid">
                            <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">Análisis de Zonas</h2>
                            <div className="w-full max-w-[400px] mx-auto">
                                <Court shots={[]}>
                                    <ZoneChart shots={shots} />
                                </Court>
                            </div>
                        </div>
                    </>
                )}
            </div>
             <footer className="w-full text-center text-slate-500 text-sm mt-10 pt-4 border-t border-slate-700">
                Cesto Tracker 🏐 - Tu planilla digital
            </footer>
        </div>
    );
};

export default ShareReport;
