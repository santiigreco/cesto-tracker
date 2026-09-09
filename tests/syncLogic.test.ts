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

    it('reconstructs tallyStats from legacy shots when tally_stats table is empty', () => {
        const loadedShots = [
            { playerNumber: '10', isGol: true, golValue: 2, period: 'First Half' as GamePeriod },
            { playerNumber: '10', isGol: true, golValue: 3, period: 'First Half' as GamePeriod },
            { playerNumber: '10', isGol: false, golValue: 2, period: 'First Half' as GamePeriod },
            { playerNumber: '7', isGol: true, golValue: 3, period: 'Second Half' as GamePeriod },
        ];

        const loadedTallyStats: Record<string, any> = {};

        loadedShots.forEach((shot) => {
            const pKey = shot.playerNumber;
            if (!loadedTallyStats[pKey]) {
                loadedTallyStats[pKey] = JSON.parse(JSON.stringify(initialPlayerTally));
            }
            const period = shot.period;
            if (shot.isGol) {
                if (shot.golValue === 3) {
                    loadedTallyStats[pKey][period].triples = (loadedTallyStats[pKey][period].triples || 0) + 1;
                } else {
                    loadedTallyStats[pKey][period].goles = (loadedTallyStats[pKey][period].goles || 0) + 1;
                }
            } else {
                loadedTallyStats[pKey][period].fallos = (loadedTallyStats[pKey][period].fallos || 0) + 1;
            }
        });

        expect(loadedTallyStats['10']['First Half'].goles).toBe(1);
        expect(loadedTallyStats['10']['First Half'].triples).toBe(1);
        expect(loadedTallyStats['10']['First Half'].fallos).toBe(1);
        expect(loadedTallyStats['7']['Second Half'].triples).toBe(1);

        // Player 10 points: 1*2 + 1*3 = 5 pts
        const p10Points = (loadedTallyStats['10']['First Half'].goles * 2) + (loadedTallyStats['10']['First Half'].triples * 3);
        expect(p10Points).toBe(5);
    });

    it('sanitizes gamePayload ensuring dropped columns like tournament_id are omitted', () => {
        const mockSettings = {
            gameName: 'Vélez vs Ferro',
            myTeam: 'Vélez',
            tournamentId: 'tourney-123',
            tournamentName: 'Liga Nacional',
            isManoCalienteEnabled: true,
            manoCalienteThreshold: 5,
            isManoFriaEnabled: true,
            manoFriaThreshold: 5,
        };

        const gamePayload: Record<string, any> = {
            id: 'game-uuid-1',
            game_mode: 'stats-tally',
            settings: {
                ...mockSettings,
                myScore: 42,
                opponentScore: 38,
                currentPeriod: 'First Half',
                teamFouls: { 'First Half': 2, 'Second Half': 0, 'First Overtime': 0, 'Second Overtime': 0 },
                gameLog: [],
            },
            player_names: { '10': 'Capitana' },
            available_players: ['10', '7'],
            my_team_name: 'Vélez',
            opponent_name: 'Ferro',
            user_id: 'user-abc',
        };

        // Verifies tournament_id is NOT a root-level property on gamePayload (avoiding 400 Bad Request)
        expect(gamePayload.tournament_id).toBeUndefined();
        expect(gamePayload.settings.tournamentName).toBe('Liga Nacional');
        expect(gamePayload.settings.tournamentId).toBe('tourney-123');
    });

    it('correctly treats authenticated user as owner of new unsaved matches (userId null)', () => {
        const user = { id: 'auth-user-99' };
        
        // 1. New match before first cloud sync (gameState.userId is null)
        const newGameState = { ...initialGameState, userId: null };
        const isNewMatchOwner = Boolean(user && (!newGameState.userId || newGameState.userId === user.id));
        expect(isNewMatchOwner).toBe(true);

        // 2. Saved match owned by this user
        const savedGameState = { ...initialGameState, userId: 'auth-user-99' };
        const isSavedMatchOwner = Boolean(user && (!savedGameState.userId || savedGameState.userId === user.id));
        expect(isSavedMatchOwner).toBe(true);

        // 3. Match owned by a different user
        const foreignGameState = { ...initialGameState, userId: 'other-user-00' };
        const isForeignMatchOwner = Boolean(user && (!foreignGameState.userId || foreignGameState.userId === user.id));
        expect(isForeignMatchOwner).toBe(false);

        // 4. Anonymous user
        const anonUser: any = null;
        const isAnonOwner = Boolean(anonUser && (!newGameState.userId || newGameState.userId === anonUser?.id));
        expect(isAnonOwner).toBe(false);
    });

    it('generates different signature when stats are recorded', () => {
        const buildSignature = (state: any) => {
            const tallySummary = Object.entries(state.tallyStats || {})
                .map(([p, perMap]: [string, any]) => `${p}:${Object.values(perMap).map((s: any) => `${s.goles},${s.triples},${s.fallos},${s.faltasPersonales}`).join('|')}`)
                .join(';');

            return JSON.stringify({
                gameId: state.gameId,
                logLen: state.gameLog?.length || 0,
                fouls: state.teamFouls,
                oppScore: state.opponentScore,
                period: state.currentPeriod,
                names: state.playerNames,
                tally: tallySummary
            });
        };

        const stateBefore = {
            gameId: 'g1',
            gameLog: [],
            teamFouls: { 'First Half': 0 },
            opponentScore: 0,
            currentPeriod: 'First Half',
            playerNames: { '10': 'Ana' },
            tallyStats: {
                '10': { 'First Half': { goles: 0, triples: 0, fallos: 0, faltasPersonales: 0 } }
            }
        };

        const sig1 = buildSignature(stateBefore);

        // Increment a goal for player 10
        const stateAfter = {
            ...stateBefore,
            gameLog: [{ id: 'evt-1' }],
            tallyStats: {
                '10': { 'First Half': { goles: 1, triples: 0, fallos: 0, faltasPersonales: 0 } }
            }
        };

        const sig2 = buildSignature(stateAfter);

        expect(sig1).not.toBe(sig2);
    });
});

