import React, { useMemo } from 'react';
import {
  AwardIcon,
  BoltIcon,
  CheckIcon,
  ClockIcon,
  StarIcon,
  TargetIcon,
  TrophyIcon,
} from '@/components/icons';
import { UserSavedGame } from './ProfileMatchesTab';

interface ProfileStatsTabProps {
  games: UserSavedGame[];
  loading: boolean;
}

interface Badge {
  id: string;
  Icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export const ProfileStatsTab: React.FC<ProfileStatsTabProps> = ({ games }) => {
  const aggregatedStats = useMemo(() => {
    let totalPoints = 0;
    let totalGoles = 0;
    let totalTriples = 0;
    let totalFouls = 0;
    let totalOvertimeMatches = 0;

    games.forEach((g) => {
      const myScore = Number(g.settings?.myScore) || 0;
      const oppScore = Number(g.settings?.opponentScore) || 0;
      totalPoints += myScore + oppScore;

      const log = g.settings?.gameLog || [];
      if (Array.isArray(log) && log.length > 0) {
        log.forEach((event: any) => {
          if (event.action === 'goles') totalGoles++;
          if (event.action === 'triples') totalTriples++;
          if (event.action === 'faltasPersonales') totalFouls++;
        });
      } else {
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

  const badges: Badge[] = useMemo(() => {
    const { totalMatches, totalPoints, totalTriples, totalOvertimeMatches } =
      aggregatedStats;

    return [
      {
        id: 'first-match',
        Icon: BoltIcon,
        title: 'Primer Silbatazo',
        description: 'Registraste tu primer partido oficial de Cestoball.',
        unlocked: totalMatches >= 1,
        progress: Math.min(totalMatches, 1),
        maxProgress: 1,
      },
      {
        id: 'pro-scorer',
        Icon: AwardIcon,
        title: 'Planillero Oficial',
        description: 'Alcanzaste 5 planillas técnicas completas.',
        unlocked: totalMatches >= 5,
        progress: Math.min(totalMatches, 5),
        maxProgress: 5,
      },
      {
        id: 'master-desk',
        Icon: TrophyIcon,
        title: 'Capitán de Mesa',
        description: 'Más de 10 partidos oficiales gestionados.',
        unlocked: totalMatches >= 10,
        progress: Math.min(totalMatches, 10),
        maxProgress: 10,
      },
      {
        id: 'century-club',
        Icon: StarIcon,
        title: 'Mano de Oro',
        description: 'Más de 100 puntos totales registrados en tus partidos.',
        unlocked: totalPoints >= 100,
        progress: Math.min(totalPoints, 100),
        maxProgress: 100,
      },
      {
        id: 'sharpshooter',
        Icon: TargetIcon,
        title: 'Tridente Letal',
        description: 'Más de 15 lanzamientos triples registrados.',
        unlocked: totalTriples >= 15,
        progress: Math.min(totalTriples, 15),
        maxProgress: 15,
      },
      {
        id: 'clutch-master',
        Icon: ClockIcon,
        title: 'Minuto Cero',
        description: 'Al menos un partido definido en tiempo suplementario.',
        unlocked: totalOvertimeMatches >= 1,
        progress: Math.min(totalOvertimeMatches, 1),
        maxProgress: 1,
      },
    ];
  }, [aggregatedStats]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-5">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-card border border-border-subtle rounded-2xl p-4 text-center">
          <span className="text-3xl font-black text-brand block leading-tight tabular-nums">
            {aggregatedStats.totalMatches}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mt-1 block">
            Partidos Dirigidos
          </span>
        </div>

        <div className="bg-surface-card border border-border-subtle rounded-2xl p-4 text-center">
          <span className="text-3xl font-black text-sport-goal-light block leading-tight tabular-nums">
            {aggregatedStats.totalPoints}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mt-1 block">
            Puntos Totales
          </span>
        </div>

        <div className="bg-surface-card border border-border-subtle rounded-2xl p-4 text-center">
          <span className="text-3xl font-black text-sport-triple-light block leading-tight tabular-nums">
            {aggregatedStats.totalTriples}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mt-1 block">
            Triples Anotados
          </span>
        </div>

        <div className="bg-surface-card border border-border-subtle rounded-2xl p-4 text-center">
          <span className="text-3xl font-black text-sport-warn-light block leading-tight tabular-nums">
            {aggregatedStats.totalFouls}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mt-1 block">
            Faltas Personales
          </span>
        </div>
      </div>

      {/* Gamification Badges Section */}
      <div className="bg-surface-card border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border-subtle pb-4 mb-5">
          <div>
            <h3 className="text-base font-extrabold text-ink-primary flex items-center gap-2">
              <TrophyIcon className="h-5 w-5 text-sport-warn-light shrink-0" />
              <span>Insignias de la Comunidad Cestoball</span>
            </h3>
            <p className="text-ink-muted text-xs sm:text-sm mt-0.5">
              Reconocimientos desbloqueados a medida que digitalizás partidos y planillas.
            </p>
          </div>

          <span className="px-3 py-1 bg-brand/10 border border-brand/30 text-brand text-xs font-extrabold uppercase rounded-lg tabular-nums shrink-0">
            {unlockedCount} de {badges.length} Desbloqueadas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {badges.map(({ Icon, ...badge }) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border transition-colors ${
                badge.unlocked
                  ? 'bg-surface-elevated border-brand/40'
                  : 'bg-surface-canvas/50 border-border-subtle opacity-65'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                    badge.unlocked
                      ? 'bg-brand/15 border-brand/35 text-brand'
                      : 'bg-surface-card border-border-subtle text-ink-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center justify-between gap-1.5">
                    <h4 className="font-bold text-sm text-ink-primary truncate">
                      {badge.title}
                    </h4>
                    {badge.unlocked && (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-sport-goal/20 border border-sport-goal/40 text-sport-goal-light rounded-md shrink-0">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-ink-muted text-xs mt-1 leading-snug">
                    {badge.description}
                  </p>

                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] font-semibold text-ink-muted mb-1 tabular-nums">
                      <span>Progreso</span>
                      <span>
                        {badge.progress} / {badge.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-surface-canvas rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          badge.unlocked ? 'bg-brand' : 'bg-border-strong'
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
