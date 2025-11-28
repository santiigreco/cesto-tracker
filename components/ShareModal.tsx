
import React, { useRef, useState } from 'react';
import { GameState, PlayerStats } from '../types';
import XIcon from './XIcon';
import ShareIcon from './ShareIcon';
import ClipboardIcon from './ClipboardIcon';
import ShareReport from './ShareReport';

// TypeScript declaration for html2canvas global variable
declare const html2canvas: any;

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    playerStats: PlayerStats[];
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, gameState, playerStats }) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
    const [copyFeedback, setCopyFeedback] = useState(false);

    const handleShare = async () => {
        if (!reportRef.current || isCapturing) return;
        setIsCapturing(true);
        try {
            // Using a higher scale (3) ensures high quality for social media (Retina/High DPI)
            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#0f172a',
                useCORS: true,
                scale: 3, 
                logging: false,
            });
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error('No se pudo crear la imagen.');
            
            const file = new File([blob], 'reporte-cestotracker.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Reporte de Partido de Cesto Tracker',
                    text: 'Aquí están las estadísticas completas del partido de Cestoball.',
                });
            } else {
                // Fallback for desktop or browsers that don't support file sharing
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'reporte-cestotracker.png';
                link.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error al compartir:', error);
            alert('Ocurrió un error al intentar compartir el reporte.');
        } finally {
            setIsCapturing(false);
        }
    };

    const handleCopyText = async () => {
        const { gameName, myTeam } = gameState.settings;
        const { tallyStats, playerNames, gameMode, shots } = gameState;
        
        let totalPoints = 0;
        let totalGoles2p = 0;
        let totalTriples = 0;
        let totalFallos = 0;
        
        interface PlayerDetail {
            name: string;
            number: string;
            points: number;
            made: number;
            total: number;
            efficiency: string;
        }

        const playerDetails: PlayerDetail[] = [];

        if (gameMode === 'stats-tally') {
            Object.entries(tallyStats).forEach(([playerNum, stats]) => {
                 if (playerNum === 'Equipo') return; 
                 const fh = stats['First Half'];
                 const sh = stats['Second Half'];
                 
                 const pGoles = fh.goles + sh.goles;
                 const pTriples = fh.triples + sh.triples;
                 const pFallos = fh.fallos + sh.fallos;
                 const pPoints = (pGoles * 2) + (pTriples * 3);
                 
                 const pTotalShots = pGoles + pTriples + pFallos;
                 const pMade = pGoles + pTriples;

                 // Update Team Totals
                 totalPoints += pPoints;
                 totalGoles2p += pGoles;
                 totalTriples += pTriples;
                 totalFallos += pFallos;

                 if (pTotalShots > 0) {
                     playerDetails.push({
                         name: playerNames[playerNum] || `Jugadora #${playerNum}`,
                         number: playerNum,
                         points: pPoints,
                         made: pMade,
                         total: pTotalShots,
                         efficiency: ((pMade / pTotalShots) * 100).toFixed(0)
                     });
                 }
            });
        } else {
             // Shot chart mode: Process shots array
             const playerStatsMap: Record<string, { goles: number, triples: number, fallos: number, points: number }> = {};

             shots.forEach(s => {
                 const pNum = s.playerNumber;
                 if (!playerStatsMap[pNum]) {
                     playerStatsMap[pNum] = { goles: 0, triples: 0, fallos: 0, points: 0 };
                 }

                 if (s.isGol) {
                     if (s.golValue === 3) {
                         playerStatsMap[pNum].triples++;
                         playerStatsMap[pNum].points += 3;
                         totalTriples++;
                     } else {
                         playerStatsMap[pNum].goles++;
                         playerStatsMap[pNum].points += 2;
                         totalGoles2p++;
                     }
                     totalPoints += s.golValue;
                 } else {
                     playerStatsMap[pNum].fallos++;
                     totalFallos++;
                 }
             });

             Object.entries(playerStatsMap).forEach(([playerNum, stats]) => {
                 const pTotalShots = stats.goles + stats.triples + stats.fallos;
                 const pMade = stats.goles + stats.triples;
                 
                 if (pTotalShots > 0) {
                     playerDetails.push({
                         name: playerNames[playerNum] || `Jugadora #${playerNum}`,
                         number: playerNum,
                         points: stats.points,
                         made: pMade,
                         total: pTotalShots,
                         efficiency: ((pMade / pTotalShots) * 100).toFixed(0)
                     });
                 }
             });
        }

        // Sort by points descending
        playerDetails.sort((a, b) => b.points - a.points);
        
        const mvp = playerDetails.length > 0 ? playerDetails[0] : null;
        const teamTotalShots = totalGoles2p + totalTriples + totalFallos;
        const teamMade = totalGoles2p + totalTriples;
        const teamEfficiency = teamTotalShots > 0 ? ((teamMade / teamTotalShots) * 100).toFixed(0) : '0';

        // Build the string
        let detailsString = '';
        playerDetails.forEach(p => {
            detailsString += `• #${p.number} ${p.name}: ${p.points} pts - ${p.efficiency}% (${p.made}/${p.total})\n`;
        });

        const textToCopy = `🏐 *RESULTADO FINAL* ${myTeam ? `- ${myTeam.toUpperCase()}` : ''} 🏐
${gameName || 'Partido Amistoso'}

🏆 *Puntos Totales:* ${totalPoints}
${mvp ? `🔥 *MVP:* ${mvp.name} (${mvp.points} pts)` : ''}

📊 *Estadísticas de Equipo:*
✨ Goles (2pts): ${totalGoles2p}
☄️ Triples (3pts): ${totalTriples}
❌ Fallos: ${totalFallos}
🎯 Efectividad: ${teamEfficiency}% (${teamMade}/${teamTotalShots})

📝 *Detalle Individual:*
${detailsString}

📲 Estadísticas completas en:
*Cesto Tracker 🏐*
cestotracker.com`;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        } catch (err) {
            console.error('Failed to copy text', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0 bg-slate-800 z-10">
                    <h2 className="text-xl sm:text-2xl font-bold text-cyan-400">Compartir Reporte</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Cerrar">
                        <XIcon />
                    </button>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex p-2 bg-slate-900 justify-center gap-2 flex-shrink-0">
                    <button 
                        onClick={() => setViewMode('summary')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${viewMode === 'summary' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        Resumen
                    </button>
                    <button 
                         onClick={() => setViewMode('detailed')}
                         className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${viewMode === 'detailed' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        Detalle
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar bg-slate-900 relative flex justify-center py-8">
                     {/* The container to capture. We center it to emulate a preview. */}
                    <div className="shadow-2xl h-fit">
                         <div ref={reportRef} className="origin-top">
                            <ShareReport gameState={gameState} playerStats={playerStats} viewMode={viewMode} />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-700 flex-shrink-0 bg-slate-800 z-10 flex flex-col gap-3">
                    <div className="flex gap-3">
                        {viewMode === 'summary' && (
                            <button
                                onClick={handleCopyText}
                                className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-[1.02] shadow-lg ${copyFeedback ? 'bg-green-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                            >
                                <ClipboardIcon className="h-5 w-5" />
                                {copyFeedback ? '¡Copiado!' : 'Copiar Texto'}
                            </button>
                        )}
                        <button
                            onClick={handleShare}
                            disabled={isCapturing}
                            className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-slate-600 disabled:opacity-50 transform hover:scale-[1.02] shadow-lg"
                        >
                            <ShareIcon />
                            {isCapturing ? 'Generando...' : 'Compartir Imagen'}
                        </button>
                    </div>
                    <p className="text-center text-xs text-slate-500">
                        {viewMode === 'summary' ? 'Ideal para WhatsApp e Instagram Stories' : 'Reporte completo para entrenadores'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;