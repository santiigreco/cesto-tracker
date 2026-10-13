import React, { useMemo } from 'react';
import { UserSavedGame } from './ProfileMatchesTab';

interface ProfileStatsTabProps {
  games: UserSavedGame[];
  loading: boolean;
}

interface Badge {
  id: string;
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export const ProfileStatsTab: React.FC<ProfileStatsTabProps> = ({ games, loading }) => {
  // Compute aggregated sports metrics from user's games
  const aggregatedStats = useMemo(() => {
    let totalPoints = 0;
    let totalGoles = 0;
    let totalTriples = 0;
    let totalFouls = 0;
    let totalOvertimeMatches = 0;

    games.forEach(g => {
      const myScore = Number(g.settings?.myScore) || 0;
      const oppScore = Number(g.settings?.opponentScore) || 0;
      totalPoints += myScore + oppScore;

      // Extract stats from settings.tallyStats or gameLog if available
      const log = g.settings?.gameLog || [];
      if (Array.isArray(log) && log.length > 0) {
        log.forEach((event: any) => {
          if (event.action === 'goles') totalGoles++;
          if (event.action === 'triples') totalTriples++;
          if (event.action === 'faltasPersonales') totalFouls++;
        });
      } else {
        // Fallback approximation from score
        totalGoles += Math.floor(myScore / 2);
      }

      if (g.settings?.currentPeriod?.includes('Overtime')) {
        totalOvertimeMatches++;
      }
    });

    return {
      totalMatches: games.length,
      totalPoints,
      totalGoles,
      totalTriples,
      totalFouls,
      totalOvertimeMatches,
    };
  }, [games]);

  // Sports Badges
  const badges: Badge[] = useMemo(() => {
    const { totalMatches, totalPoints, totalTriples, totalOvertimeMatches } = aggregatedStats;

    return [
      {
        id: 'first-match',
        emoji: '🥉',
        title: 'Primer Silbatazo',
        description: 'Registraste tu primer partido oficial de Cestoball.',
        unlocked: totalMatches >= 1,
        progress: Math.min(totalMatches, 1),
        maxProgress: 1,
      },
      {
        id: 'pro-scorer',
        emoji: '🥈',
        title: 'Planillero Oficial',
        description: 'Alcanzaste 5 planillas técnicas completas.',
        unlocked: totalMatches >= 5,
        progress: Math.min(totalMatches, 5),
        maxProgress: 5,
      },
      {
        id: 'master-desk',
        emoji: '🥇',
        title: 'Capitán de Mesa',
        description: 'Más de 10 partidos oficiales gestionados.',
        unlocked: totalMatches >= 10,
        progress: Math.min(totalMatches, 10),
        maxProgress: 10,
      },
      {
        id: 'century-club',
        emoji: '💎',
        title: 'Mano de Oro',
        description: 'Más de 100 puntos totales registrados en tus partidos.',
        unlocked: totalPoints >= 100,
        progress: Math.min(totalPoints, 100),
        maxProgress: 100,
      },
      {
        id: 'sharpshooter',
        emoji: '🎯',
        title: 'Tridente Letal',
        description: 'Más de 15 lanzamientos triples registrados.',
        unlocked: totalTriples >= 15,
        progress: Math.min(totalTriples, 15),
        maxProgress: 15,
      },
      {
        id: 'clutch-master',
        emoji: '⏱️',
        title: 'Minuto Cero',
        description: 'Al menos un partido definido en tiempo suplementario.',
        unlocked: totalOvertimeMatches >= 1,
        progress: Math.min(totalOvertimeMatches, 1),
        maxProgress: 1,
      },
    ];
  }, [aggregatedStats]);

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-3xl font-black text-cyan-400 block leading-tight">
            {aggregatedStats.totalMatches}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
            Partidos Dirigidos
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-3xl font-black text-emerald-400 block leading-tight">
            {aggregatedStats.totalPoints}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
            Puntos Totales
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-3xl font-black text-purple-400 block leading-tight">
            {aggregatedStats.totalTriples}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
            Triples Anotados
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-3xl font-black text-amber-400 block leading-tight">
            {aggregatedStats.totalFouls}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">
            Faltas Personales
          </span>
        </div>
      </div>

      {/* Gamification Badges Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>🏆</span>
              <span>Insignias de la Comunidad Cestoball</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Reconocimientos desbloqueados a medida que digitalizás partidos y planillas.
            </p>
          </div>

          <span className="px-3 py-1 bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-black uppercase rounded-full">
            {unlockedCount} de {badges.length} Desbloqueadas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border transition-all ${
                badge.unlocked
                  ? 'bg-slate-850 border-cyan-500/40 shadow-md'
                  : 'bg-slate-900/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl shrink-0 filter drop-shadow">{badge.emoji}</span>
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-sm text-white truncate">{badge.title}</h4>
                    {badge.unlocked && (
                      <span className="text-[10px] bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mt-1 leading-snug">{badge.description}</p>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>Progreso</span>
                      <span>
                        {badge.progress} / {badge.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          badge.unlocked ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' : 'bg-slate-700'
                        }`}
                        style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
