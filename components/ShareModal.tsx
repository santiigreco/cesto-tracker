
import React, { useRef, useState, useEffect } from 'react';
import { GameState, PlayerStats } from '../types';
import { XIcon } from './icons';
import { ShareIcon } from './icons';
import { ClipboardIcon } from './icons';
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
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [rivalScore, setRivalScore] = useState<string>('');
    const [previewScale, setPreviewScale] = useState(1);

    const REPORT_WIDTH = 450;

    // Responsive preview scaling
    useEffect(() => {
        if (!isOpen || !previewContainerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const containerWidth = entry.contentRect.width;
                const padding = 32; // 16px each side
                const available = containerWidth - padding;
                const scale = Math.min(1, available / REPORT_WIDTH);
                setPreviewScale(scale);
            }
        });

        observer.observe(previewContainerRef.current);
        return () => observer.disconnect();
    }, [isOpen]);

    const handleShare = async () => {
        if (!reportRef.current || isCapturing) return;
        setIsCapturing(true);
        try {
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
                    title: 'Reporte de Partido - Cesto Tracker',
                    text: `${gameState.settings.myTeam || 'Mi equipo'} registrado en Cesto Tracker 🏐`,
                });
            } else {
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
            const playerStatsMap: Record<string, { goles: number, triples: number, fallos: number, points: number }> = {};
            shots.forEach(s => {
                const pNum = s.playerNumber;
                if (!playerStatsMap[pNum]) playerStatsMap[pNum] = { goles: 0, triples: 0, fallos: 0, points: 0 };
                if (s.isGol) {
                    if (s.golValue === 3) { playerStatsMap[pNum].triples++; playerStatsMap[pNum].points += 3; totalTriples++; }
                    else { playerStatsMap[pNum].goles++; playerStatsMap[pNum].points += 2; totalGoles2p++; }
                    totalPoints += s.golValue;
                } else { playerStatsMap[pNum].fallos++; totalFallos++; }
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

        playerDetails.sort((a, b) => b.points - a.points);

        const mvp = playerDetails.length > 0 ? playerDetails[0] : null;
        const teamTotalShots = totalGoles2p + totalTriples + totalFallos;
        const teamMade = totalGoles2p + totalTriples;
        const teamEfficiency = teamTotalShots > 0 ? ((teamMade / teamTotalShots) * 100).toFixed(0) : '0';
        const rivalScoreNum = parseInt(rivalScore) || null;

        let detailsString = '';
        playerDetails.forEach(p => {
            detailsString += `• #${p.number} ${p.name}: ${p.points} pts - ${p.efficiency}% (${p.made}/${p.total})\n`;
        });

        const scoreStr = rivalScoreNum !== null
            ? `⚽ *Resultado:* ${totalPoints} - ${rivalScoreNum} ${rivalScoreNum < totalPoints ? '✅ Victoria' : rivalScoreNum > totalPoints ? '❌ Derrota' : '🤝 Empate'}`
            : `🏆 *Puntos Totales:* ${totalPoints}`;

        const textToCopy = `🏐 *${myTeam ? myTeam.toUpperCase() : 'CESTO TRACKER'}* 🏐
${gameName || 'Partido Amistoso'}

${scoreStr}
${mvp ? `🔥 *MVP:* ${mvp.name} (${mvp.points} pts)` : ''}

📊 *Estadísticas de Equipo:*
✨ Goles (2pts): ${totalGoles2p}
☄️ Triples (3pts): ${totalTriples}
❌ Fallos: ${totalFallos}
🎯 Efectividad: ${teamEfficiency}% (${teamMade}/${teamTotalShots})

📝 *Detalle Individual:*
${detailsString}
📲 Estadísticas completas en:
*Cesto Tracker 🏐* — cestotracker.com`;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        } catch (err) {
            console.error('Failed to copy text', err);
        }
    };

    if (!isOpen) return null;

    const rivalScoreNum = rivalScore !== '' ? parseInt(rivalScore) : null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg h-[92vh] flex flex-col overflow-hidden border border-slate-700/50">

                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-lg font-bold text-white">Compartir Reporte</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-400 hover:text-white" aria-label="Cerrar">
                        <XIcon />
                    </button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex px-5 py-2 bg-slate-900/50 gap-2 flex-shrink-0 border-b border-slate-700/50">
                    {(['summary', 'detailed'] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-colors ${viewMode === mode ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        >
                            {mode === 'summary' ? '📸 Resumen' : '📋 Detalle'}
                        </button>
                    ))}
                </div>

                {/* Preview area — responsive scaled */}
                <div
                    ref={previewContainerRef}
                    className="flex-grow overflow-y-auto bg-slate-950/60 flex justify-center py-6 px-4"
                >
                    <div
                        style={{
                            transform: `scale(${previewScale})`,
                            transformOrigin: 'top center',
                            // Keeps the layout height correct after scaling
                            marginBottom: `${-(REPORT_WIDTH * (1 - previewScale))}px`,
                            width: `${REPORT_WIDTH}px`,
                            flexShrink: 0,
                        }}
                    >
                        <div ref={reportRef} className="origin-top shadow-2xl">
                            <ShareReport
                                gameState={gameState}
                                playerStats={playerStats}
                                viewMode={viewMode}
                                rivalScore={rivalScoreNum}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="px-4 py-3 border-t border-slate-700 flex-shrink-0 bg-slate-800 space-y-3">

                    {/* Rival score input (summary mode only) */}
                    {viewMode === 'summary' && (
                        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5">
                            <span className="text-sm text-slate-400 font-medium flex-grow">
                                Puntos del rival
                                <span className="text-slate-600 text-xs ml-1">(opcional — aparece en la tarjeta)</span>
                            </span>
                            <input
                                type="number"
                                min="0"
                                max="999"
                                value={rivalScore}
                                onChange={e => setRivalScore(e.target.value)}
                                placeholder="—"
                                className="w-16 bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-center text-xl font-black focus:border-cyan-500 outline-none transition-colors"
                            />
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        {viewMode === 'summary' && (
                            <button
                                onClick={handleCopyText}
                                className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 px-3 rounded-xl transition-all text-sm ${copyFeedback ? 'bg-green-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                            >
                                <ClipboardIcon className="h-4 w-4" />
                                {copyFeedback ? '¡Copiado!' : 'Copiar texto'}
                            </button>
                        )}
                        <button
                            onClick={handleShare}
                            disabled={isCapturing}
                            className="flex-[2] flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-3 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                        >
                            <ShareIcon />
                            {isCapturing ? 'Generando...' : 'Compartir imagen'}
                        </button>
                    </div>

                    <p className="text-center text-[10px] text-slate-600">
                        {viewMode === 'summary' ? 'Ideal para WhatsApp e Instagram Stories' : 'Reporte completo para entrenadores'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;