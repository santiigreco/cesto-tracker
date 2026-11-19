import React, { useMemo } from 'react';
import { GameState, PlayerStats } from '../../types';
import StatisticsView from '@/components/views/StatisticsView';
import TeamLogo from '@/components/ui/TeamLogo';

interface ShareReportProps {
  gameState: GameState;
  playerStats?: PlayerStats[];
  viewMode: 'summary' | 'detailed';
  rivalScore?: number | null;
}

const ShareReport: React.FC<ShareReportProps> = ({ gameState, viewMode, rivalScore }) => {
  const { playerNames, tallyStats, settings } = gameState;

  const summaryData = useMemo(() => {
    let totalPoints = 0;
    let totalGoles = 0;
    let totalTriples = 0;
    let totalFallos = 0;
    let totalRecuperos = 0;
    let totalPerdidas = 0;
    const playersMap: Record<string, { points: number; name: string }> = {};

    Object.entries(tallyStats || {}).forEach(([playerNum, stats]) => {
      if (playerNum === 'Equipo') return;

      let pGoles = 0;
      let pTriples = 0;
      let pFallos = 0;
      let pRecuperos = 0;
      let pPerdidas = 0;
      Object.values(stats || {}).forEach((periodStats) => {
        pGoles += periodStats?.goles || 0;
        pTriples += periodStats?.triples || 0;
        pFallos += periodStats?.fallos || 0;
        pRecuperos += periodStats?.recuperos || 0;
        pPerdidas += periodStats?.perdidas || 0;
      });

      const pPoints = pGoles * 2 + pTriples * 3;
      totalPoints += pPoints;
      totalGoles += pGoles;
      totalTriples += pTriples;
      totalFallos += pFallos;
      totalRecuperos += pRecuperos;
      totalPerdidas += pPerdidas;

      playersMap[playerNum] = {
        points: pPoints,
        name: playerNames[playerNum] || `#${playerNum}`,
      };
    });

    const sortedPlayers = Object.values(playersMap).sort((a, b) => b.points - a.points);
    const topScorers = sortedPlayers.filter((p) => p.points > 0).slice(0, 3);
    const totalShots = totalGoles + totalTriples + totalFallos;
    const efficiency =
      totalShots > 0 ? (((totalGoles + totalTriples) / totalShots) * 100).toFixed(0) : '0';

    return {
      totalPoints,
      totalGoles,
      totalTriples,
      totalFallos,
      totalRecuperos,
      totalPerdidas,
      topScorers,
      efficiency,
    };
  }, [tallyStats, playerNames]);

  const matchDateLabel = useMemo(() => {
    const raw = settings.gameDate ? new Date(`${settings.gameDate}T12:00:00`) : new Date();
    if (isNaN(raw.getTime())) {
      return new Date().toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return raw.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [settings.gameDate]);

  // --- BROADCAST SUMMARY CARD (html2canvas safe: no blur, no bg-clip-text, no emojis) ---
  if (viewMode === 'summary') {
    const hasRivalScore = rivalScore !== null && rivalScore !== undefined;
    const isWin = hasRivalScore && summaryData.totalPoints > rivalScore!;
    const isLoss = hasRivalScore && summaryData.totalPoints < rivalScore!;
    const isDraw = hasRivalScore && summaryData.totalPoints === rivalScore!;

    const accentBarColor = isWin
      ? 'bg-emerald-500'
      : isLoss
        ? 'bg-rose-500'
        : isDraw
          ? 'bg-amber-500'
          : 'bg-cyan-400';

    const resultBadge = isWin
      ? {
          label: 'Victoria',
          color: 'text-emerald-300',
          bg: 'bg-emerald-500/15 border-emerald-500/40',
        }
      : isLoss
        ? {
            label: 'Derrota',
            color: 'text-rose-300',
            bg: 'bg-rose-500/15 border-rose-500/40',
          }
        : isDraw
          ? {
              label: 'Empate',
              color: 'text-amber-300',
              bg: 'bg-amber-500/15 border-amber-500/40',
            }
          : null;

    const contextLabel = [settings.tournamentName, settings.categoryName]
      .filter(Boolean)
      .join(' · ');

    return (
      <div className="w-[450px] bg-[#0A0F18] text-[#F8FAFC] font-sans border border-[#1F2B3E] flex flex-col">
        {/* Top Solid Accent Bar */}
        <div className={`w-full h-1.5 ${accentBarColor}`} />

        <div className="w-full p-7 flex flex-col items-center gap-5">
          {/* Header Context */}
          <div className="flex flex-col items-center text-center gap-1.5 w-full">
            {(contextLabel || matchDateLabel) && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#111827] border border-[#1F2B3E] text-[10px] font-bold uppercase tracking-wider text-[#8494AB] tabular-nums">
                {contextLabel && <span className="text-[#22D3EE]">{contextLabel}</span>}
                {contextLabel && <span>·</span>}
                <span>{matchDateLabel}</span>
              </div>
            )}

            <div className="mt-2 flex items-center justify-center gap-3">
              <TeamLogo teamName={settings.myTeam || ''} className="h-12 w-12 shrink-0" />
            </div>

            <h2 className="text-xl font-black text-[#F8FAFC] tracking-tight leading-tight mt-1 max-w-[360px] break-words">
              {settings.myTeam || 'Resultado Final'}
            </h2>
            <p className="text-sm font-semibold text-[#B8C5D6] max-w-[360px] break-words">
              {settings.gameName ? `vs ${settings.gameName}` : 'Partido Amistoso'}
            </p>
          </div>

          {/* Broadcast Scoreboard Focus */}
          <div className="w-full bg-[#111827] border border-[#1F2B3E] rounded-2xl py-6 px-5 flex flex-col items-center justify-center gap-3">
            {hasRivalScore ? (
              <>
                <div className="flex items-center justify-center gap-5">
                  <span
                    className={`text-7xl font-black leading-none tracking-tight tabular-nums ${
                      isWin || isDraw ? 'text-[#F8FAFC]' : 'text-[#8494AB]'
                    }`}
                  >
                    {summaryData.totalPoints}
                  </span>
                  <span className="text-2xl font-black text-[#32435C]">—</span>
                  <span
                    className={`text-7xl font-black leading-none tracking-tight tabular-nums ${
                      isLoss || isDraw ? 'text-[#F8FAFC]' : 'text-[#8494AB]'
                    }`}
                  >
                    {rivalScore}
                  </span>
                </div>
                {resultBadge && (
                  <span
                    className={`px-3.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-widest border ${resultBadge.bg} ${resultBadge.color}`}
                  >
                    {resultBadge.label}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="text-7xl font-black text-[#F8FAFC] leading-none tracking-tight tabular-nums">
                  {summaryData.totalPoints}
                </span>
                <span className="text-[#8494AB] text-xs font-bold uppercase tracking-widest">
                  Puntos Totales
                </span>
              </>
            )}
          </div>

          {/* KPI Grid */}
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="bg-[#111827] p-3.5 rounded-xl border border-[#1F2B3E] flex flex-col items-center">
              <span className="text-3xl font-black text-[#34D399] leading-none tabular-nums">
                {summaryData.efficiency}%
              </span>
              <span className="text-[10px] text-[#8494AB] uppercase font-bold tracking-wider mt-1.5">
                Efectividad
              </span>
            </div>
            <div className="bg-[#111827] p-3.5 rounded-xl border border-[#1F2B3E] flex flex-col items-center">
              <span className="text-3xl font-black text-[#38BDF8] leading-none tabular-nums">
                {summaryData.totalTriples}
              </span>
              <span className="text-[10px] text-[#8494AB] uppercase font-bold tracking-wider mt-1.5">
                Triples (+3)
              </span>
            </div>
            <div className="bg-[#111827] p-3.5 rounded-xl border border-[#1F2B3E] flex flex-col items-center">
              <span className="text-3xl font-black text-[#F8FAFC] leading-none tabular-nums">
                {summaryData.totalRecuperos}
              </span>
              <span className="text-[10px] text-[#8494AB] uppercase font-bold tracking-wider mt-1.5">
                Recuperos
              </span>
            </div>
            <div className="bg-[#111827] p-3.5 rounded-xl border border-[#1F2B3E] flex flex-col items-center">
              <span className="text-3xl font-black text-[#FB7185] leading-none tabular-nums">
                {summaryData.totalPerdidas}
              </span>
              <span className="text-[10px] text-[#8494AB] uppercase font-bold tracking-wider mt-1.5">
                Pérdidas
              </span>
            </div>
          </div>

          {/* Top Scorers */}
          {summaryData.topScorers.length > 0 && (
            <div className="w-full bg-[#111827] p-4 rounded-xl border border-[#1F2B3E]">
              <h4 className="text-[10px] text-[#22D3EE] font-extrabold uppercase mb-2.5 tracking-widest text-center">
                Top Goleadoras
              </h4>
              <div className="flex flex-col gap-1.5">
                {summaryData.topScorers.map((player, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-[#1A2436] border border-[#1F2B3E] px-3 py-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-black text-[#22D3EE] w-5 tabular-nums shrink-0">
                        {idx + 1}°
                      </span>
                      <span className="text-sm font-bold text-[#F8FAFC] truncate">
                        {player.name}
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#F8FAFC] tabular-nums shrink-0 ml-2">
                      {player.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brand Footer */}
          <div className="pt-3 border-t border-[#1F2B3E] w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none select-none" aria-hidden="true">🏐</span>
              <span className="font-extrabold text-xs tracking-tight text-[#B8C5D6]">
                Cesto Tracker
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#8494AB]">cestotracker.com</span>
          </div>
        </div>
      </div>
    );
  }

  // --- DETAILED LAYOUT ---
  return (
    <div className="p-7 bg-[#0A0F18] text-[#F8FAFC] font-sans max-w-[800px] mx-auto border border-[#1F2B3E]">
      <div className="flex flex-col items-center mb-6 text-center">
        <TeamLogo teamName={settings.myTeam || ''} className="h-16 w-16 mb-3" />
        <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight mb-1">
          {settings.myTeam ? `${settings.myTeam} vs ` : ''}
          {settings.gameName || 'Reporte de Partido'}
        </h1>
        <p className="text-[#8494AB] text-sm font-medium tabular-nums">
          Planilla generada con Cesto Tracker · {matchDateLabel}
        </p>
      </div>

      <div className="space-y-6">
        <StatisticsView
          externalPlayerNames={playerNames}
          isSharing={true}
          externalTallyStats={tallyStats}
        />
      </div>

      <footer className="w-full flex items-center justify-between text-[#8494AB] text-xs mt-8 pt-4 border-t border-[#1F2B3E]">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none select-none" aria-hidden="true">🏐</span>
          <span className="font-bold text-[#B8C5D6]">Cesto Tracker</span>
        </div>
        <span>cestotracker.com</span>
      </footer>
    </div>
  );
};

export default ShareReport;
