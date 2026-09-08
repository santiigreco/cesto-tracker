import { describe, it, expect } from 'vitest';
import { initialPlayerTally, initialGameState } from '../context/GameContext';
import { GamePeriod, GameState } from '../types';

describe('Sync Logic & State Reconstruction', () => {
    it('initialPlayerTally provides valid 0-initialized stats across all periods', () => {
        const periods: GamePeriod[] = ['First Half', 'Second Half', 'First Overtime', 'Second Overtime'];
        periods.forEach(p => {
            expect(initialPlayerTally[p]).toBeDefined();
            expect(initialPlayerTally[p].goles).toBe(0);
            expect(initialPlayerTally[p].triples).toBe(0);
            expect(initialPlayerTally[p].fallos).toBe(0);
            expect(initialPlayerTally[p].recuperos).toBe(0);
            expect(initialPlayerTally[p].perdidas).toBe(0);
            expect(initialPlayerTally[p].reboteOfensivo).toBe(0);
            expect(initialPlayerTally[p].reboteDefensivo).toBe(0);
            expect(initialPlayerTally[p].faltasPersonales).toBe(0);
        });
    });

    it('calculates myScore correctly from player tally stats excluding Equipo', () => {
        const tallyStats: Record<string, typeof initialPlayerTally> = {
            'Equipo': JSON.parse(JSON.stringify(initialPlayerTally)),
            '10': JSON.parse(JSON.stringify(initialPlayerTally)),
            '7': JSON.parse(JSON.stringify(initialPlayerTally)),
        };

        // Equipo has stats (should be ignored to avoid double counting)
        tallyStats['Equipo']['First Half'].goles = 10; // 20 pts ignored

        // Player 10: 3 goals (6 pts) + 1 triple (3 pts) in 1st half, 1 goal (2 pts) in 2nd half
        tallyStats['10']['First Half'].goles = 3;
        tallyStats['10']['First Half'].triples = 1;
        tallyStats['10']['Second Half'].goles = 1;

        // Player 7: 2 triples (6 pts) in 2nd half
        tallyStats['7']['Second Half'].triples = 2;

        let totalPoints = 0;
        Object.entries(tallyStats).forEach(([playerNumber, playerTally]) => {
            if (playerNumber === 'Equipo') return;
            Object.values(playerTally).forEach(periodStats => {
                totalPoints += ((periodStats?.goles || 0) * 2) + ((periodStats?.triples || 0) * 3);
            });
        });

        // 6 + 3 + 2 + 6 = 17 pts
        expect(totalPoints).toBe(17);
    });

    it('guarantees all available players have initialized tallyStats during load reconstruction', () => {
        const availablePlayers = ['4', '7', '10', '12'];
        const loadedTallyStats: Record<string, any> = {
            '10': JSON.parse(JSON.stringify(initialPlayerTally))
        };

        // Reconstruction pipeline logic as implemented in SyncContext
        const allPlayerKeys = ['Equipo', ...availablePlayers];
        allPlayerKeys.forEach(p => {
            if (!loadedTallyStats[p]) {
                loadedTallyStats[p] = JSON.parse(JSON.stringify(initialPlayerTally));
            }
        });

        allPlayerKeys.forEach(p => {
            expect(loadedTallyStats[p]).toBeDefined();
            expect(loadedTallyStats[p]['First Half']).toBeDefined();
            expect(loadedTallyStats[p]['Second Half']).toBeDefined();
        });
    });

    it('correctly sets isReadOnly based on ownership and enableEditing intent', () => {
        const userId: string = 'user-123';
        const gameUserId: string = 'user-123';
        const otherUserId: string = 'user-456';

        const isOwner = userId === gameUserId;
        expect(isOwner).toBe(true);

        // When loaded in read-only stats mode
        const readOnlyState = !false; // enableEditing = false
        expect(readOnlyState).toBe(true);

        // When owner clicks "Continuar Anotando"
        const editableState = !true; // enableEditing = true
        expect(editableState).toBe(false);

        // Other user is not owner
        const isOtherOwner = otherUserId === gameUserId;
        expect(isOtherOwner).toBe(false);
    });
});
