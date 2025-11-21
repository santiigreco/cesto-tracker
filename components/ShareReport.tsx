
import React from 'react';
import { GameState, PlayerStats } from '../types';
import StatisticsView from './StatisticsView';
import Court from './Court';
import HeatmapOverlay from './HeatmapOverlay';
import ZoneChart from './ZoneChart';

interface ShareReportProps {
    gameState: GameState;
    playerStats: PlayerStats[];
}

const ShareReport: React.FC<ShareReportProps> = ({ gameState, playerStats }) => {
    const { shots, playerNames, gameMode, tallyStats, settings } = gameState;
    const showMaps = gameMode === 'shot-chart' && shots.length > 0;

    return (
        <div className="p-6 bg-slate-900 text-slate-200 font-sans">
            <h1 className="text-3xl font-bold text-cyan-400 text-center mb-2">{settings.gameName || 'Reporte de Partido'}</h1>
            <p className="text-center text-slate-400 mb-6">Generado con Cesto Tracker el {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-8">
                <StatisticsView 
                    stats={playerStats} 
                    playerNames={playerNames} 
                    shots={shots} 
                    isSharing={true}
                    gameMode={gameMode}
                    tallyStats={tallyStats} 
                />

                {showMaps && (
                    <>
                        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">Mapa de Tiros</h2>
                            <Court shots={shots} showShotMarkers={true} />
                        </div>
                        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">Mapa de Calor</h2>
                            <Court shots={[]}>
                                <HeatmapOverlay shots={shots} />
                            </Court>
                        </div>
                        <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">Análisis de Zonas</h2>
                            <Court shots={[]}>
                                <ZoneChart shots={shots} />
                            </Court>
                        </div>
                    </>
                )}
            </div>
             <footer className="w-full text-center text-slate-500 text-xs mt-8 pt-4 border-t border-slate-700">
                Generado con Cesto Tracker 🏐{'\uFE0F'}
            </footer>
        </div>
    );
};

export default ShareReport;
