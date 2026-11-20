import { GamePeriod, TallyStatsPeriod } from '../types';

/**
 * Cestoball regulation: a player can commit at most 6 personal fouls across
 * the ENTIRE match (both halves + overtimes). A 7th foul is not allowed.
 */
export const MAX_PERSONAL_FOULS = 6;

/** Fouls at which the player is "en capilla" (one away from the limit). */
export const FOUL_WARNING_THRESHOLD = MAX_PERSONAL_FOULS - 1;

const ALL_PERIODS: GamePeriod[] = ['First Half', 'Second Half', 'First Overtime', 'Second Overtime'];

type PlayerTallyByPeriod = Partial<Record<GamePeriod, Partial<TallyStatsPeriod> | undefined>>;

/** Sums personal fouls of a player across all match periods. */
export const getTotalPlayerFouls = (
    tallyStats: Record<string, PlayerTallyByPeriod | undefined> | null | undefined,
    playerNumber: string
): number => {
    const playerTally = tallyStats?.[playerNumber];
    if (!playerTally) return 0;
    return ALL_PERIODS.reduce((sum, period) => sum + (playerTally[period]?.faltasPersonales || 0), 0);
};

/** Returns true when another personal foul can be legally assigned to this player. */
export const canAddPersonalFoul = (
    tallyStats: Record<string, PlayerTallyByPeriod | undefined> | null | undefined,
    playerNumber: string
): boolean => {
    // Team/bench fouls are not personal fouls and are not capped.
    if (playerNumber === 'Equipo') return true;
    return getTotalPlayerFouls(tallyStats, playerNumber) < MAX_PERSONAL_FOULS;
};
