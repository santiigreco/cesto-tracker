import React, { useRef, useState, useEffect } from 'react';
import { GameState, PlayerStats } from '../../types';
import { CameraIcon, ClipboardIcon, ShareIcon } from '../icons';
import ShareReport from '@/components/game/ShareReport';
import ModalShell from '@/components/ui/ModalShell';

// Lazy loader for html2canvas (avoids loading 200 KB on initial page load)
let html2canvasPromise: Promise<any> | null = null;
const loadHtml2Canvas = (): Promise<any> => {
  if (typeof window !== 'undefined' && (window as any).html2canvas) {
    return Promise.resolve((window as any).html2canvas);
  }
  if (html2canvasPromise) return html2canvasPromise;

  html2canvasPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.async = true;
    script.onload = () => resolve((window as any).html2canvas);
    script.onerror = () => {
      html2canvasPromise = null;
      reject(new Error('No se pudo cargar el generador de imágenes (html2canvas).'));
    };
    document.head.appendChild(script);
  });
  return html2canvasPromise;
};

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  playerStats: PlayerStats[];
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  gameState,
  playerStats,
}) => {
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
        const padding = 32;
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
      const html2canvas = await loadHtml2Canvas();
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0A0F18',
        useCORS: true,
        scale: 3,
        logging: false,
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (!blob) throw new Error('No se pudo crear la imagen.');

      const file = new File([blob], 'reporte-cestotracker.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Reporte de Partido - Cesto Tracker',
          text: `${gameState.settings.myTeam || 'Mi equipo'} registrado en Cesto Tracker`,
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

        let pGoles = 0;
        let pTriples = 0;
        let pFallos = 0;
        Object.values(stats || {}).forEach((periodStats) => {
          pGoles += periodStats?.goles || 0;
          pTriples += periodStats?.triples || 0;
          pFallos += periodStats?.fallos || 0;
        });

        const pPoints = pGoles * 2 + pTriples * 3;
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
            efficiency: ((pMade / pTotalShots) * 100).toFixed(0),
          });
        }
      });
    } else {
      const playerStatsMap: Record<
        string,
        { goles: number; triples: number; fallos: number; points: number }
      > = {};
      shots.forEach((s) => {
        const pNum = s.playerNumber;
        if (!playerStatsMap[pNum])
          playerStatsMap[pNum] = { goles: 0, triples: 0, fallos: 0, points: 0 };
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
            efficiency: ((pMade / pTotalShots) * 100).toFixed(0),
          });
        }
      });
    }

    playerDetails.sort((a, b) => b.points - a.points);

    const mvp = playerDetails.length > 0 ? playerDetails[0] : null;
    const teamTotalShots = totalGoles2p + totalTriples + totalFallos;
    const teamMade = totalGoles2p + totalTriples;
    const teamEfficiency =
      teamTotalShots > 0 ? ((teamMade / teamTotalShots) * 100).toFixed(0) : '0';
    const parsedRival = rivalScore.trim() !== '' ? parseInt(rivalScore, 10) : NaN;
    const rivalScoreNum = !isNaN(parsedRival) ? parsedRival : null;

    let detailsString = '';
    playerDetails.forEach((p) => {
      detailsString += `• #${p.number} ${p.name}: ${p.points} pts - ${p.efficiency}% (${p.made}/${p.total})\n`;
    });

    const scoreStr =
      rivalScoreNum !== null
        ? `⚽ *Resultado:* ${totalPoints} - ${rivalScoreNum} ${
            rivalScoreNum < totalPoints
              ? '✅ Victoria'
              : rivalScoreNum > totalPoints
                ? '❌ Derrota'
                : '🤝 Empate'
          }`
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

  const parsedModalRival = rivalScore.trim() !== '' ? parseInt(rivalScore, 10) : NaN;
  const rivalScoreNum = !isNaN(parsedModalRival) ? parsedModalRival : null;

  const modalFooter = (
    <div className="space-y-3">
      {viewMode === 'summary' && (
        <div className="flex items-center gap-3 bg-surface-canvas border border-border-subtle rounded-xl px-3.5 py-2">
          <div className="flex-grow min-w-0">
            <span className="block text-sm text-ink-secondary font-semibold">
              Puntos del rival
            </span>
            <span className="block text-xs text-ink-muted">
              Opcional · aparece en la placa
            </span>
          </div>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="999"
            value={rivalScore}
            onChange={(e) => setRivalScore(e.target.value)}
            placeholder="—"
            aria-label="Puntos del rival"
            className="w-20 min-h-[44px] bg-surface-elevated border border-border-strong rounded-xl px-2 text-ink-primary text-center text-base sm:text-xl font-black focus:border-brand tabular-nums"
          />
        </div>
      )}

      <div className="flex gap-2">
        {viewMode === 'summary' && (
          <button
            type="button"
            onClick={handleCopyText}
            className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 font-bold py-2.5 px-3 rounded-xl transition-colors text-xs sm:text-sm border ${
              copyFeedback
                ? 'bg-sport-goal border-sport-goal text-white'
                : 'bg-surface-elevated border-border-strong text-ink-primary hover:bg-surface-hover'
            }`}
          >
            <ClipboardIcon className="h-4 w-4 shrink-0" />
            <span>{copyFeedback ? '¡Copiado!' : 'Copiar texto'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleShare}
          disabled={isCapturing}
          className="flex-[2] min-h-[44px] flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-ink-inverse font-extrabold py-2.5 px-4 rounded-xl transition-colors text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShareIcon className="h-4 w-4 shrink-0" />
          <span>{isCapturing ? 'Generando...' : 'Compartir imagen'}</span>
        </button>
      </div>

      <p className="text-center text-xs text-ink-muted">
        {viewMode === 'summary'
          ? 'Ideal para WhatsApp e Instagram Stories'
          : 'Reporte completo para entrenadores'}
      </p>
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Compartir Reporte"
      maxWidth="lg"
      fullHeight={true}
      zIndexClass="z-[80]"
      bodyClassName="flex flex-col min-h-0 overflow-hidden p-0"
      footer={modalFooter}
    >
      {/* View Mode Toggle */}
      <div className="flex px-4 py-2.5 bg-surface-canvas/60 gap-2 flex-shrink-0 border-b border-border-subtle">
        <button
          type="button"
          onClick={() => setViewMode('summary')}
          className={`flex-1 sm:flex-none min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 ${
            viewMode === 'summary'
              ? 'bg-brand text-ink-inverse font-extrabold'
              : 'text-ink-secondary hover:text-ink-primary bg-surface-elevated border border-border-subtle'
          }`}
        >
          <CameraIcon className="h-4 w-4" />
          <span>Resumen</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('detailed')}
          className={`flex-1 sm:flex-none min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 ${
            viewMode === 'detailed'
              ? 'bg-brand text-ink-inverse font-extrabold'
              : 'text-ink-secondary hover:text-ink-primary bg-surface-elevated border border-border-subtle'
          }`}
        >
          <ClipboardIcon className="h-4 w-4" />
          <span>Detalle</span>
        </button>
      </div>

      {/* Preview area — responsive scaled */}
      <div
        ref={previewContainerRef}
        className="flex-grow overflow-y-auto custom-scrollbar bg-[#05080F]/60 flex justify-center py-5 px-4"
      >
        <div
          style={{
            transform: `scale(${previewScale})`,
            transformOrigin: 'top center',
            marginBottom: `${-(REPORT_WIDTH * (1 - previewScale))}px`,
            width: `${REPORT_WIDTH}px`,
            flexShrink: 0,
          }}
        >
          <div ref={reportRef} className="origin-top shadow-modal">
            <ShareReport
              gameState={gameState}
              playerStats={playerStats}
              viewMode={viewMode}
              rivalScore={rivalScoreNum}
            />
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default ShareModal;
