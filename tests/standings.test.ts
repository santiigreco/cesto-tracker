import { describe, it, expect } from 'vitest';
import { computeEntries, isKnockoutStage } from '../hooks/useStandings';
import { Match } from '../hooks/useFixture';

describe('useStandings - Reglas de Cestoball para Tablas de Posiciones', () => {
  it('debe otorgar 2 puntos al ganador y 1 punto al perdedor en un partido finalizado', () => {
    const matches: Match[] = [
      {
        id: '1',
        tournament: 'Apertura 2026',
        date: '2026-04-10',
        time: '15:00',
        homeTeam: 'Ciudad',
        awayTeam: 'Gimnasia',
        scoreHome: 80,
        scoreAway: 60,
        status: 'finished',
      },
    ];

    const standings = computeEntries(matches);

    expect(standings).toHaveLength(2);

    const winner = standings.find(e => e.team === 'Ciudad');
    const loser = standings.find(e => e.team === 'Gimnasia');

    expect(winner).toBeDefined();
    expect(winner?.points).toBe(2);
    expect(winner?.won).toBe(1);
    expect(winner?.lost).toBe(0);
    expect(winner?.played).toBe(1);
    expect(winner?.pointsFor).toBe(80);
    expect(winner?.pointsAgainst).toBe(60);
    expect(winner?.diff).toBe(20);
    expect(winner?.streak).toEqual(['W']);

    expect(loser).toBeDefined();
    expect(loser?.points).toBe(1);
    expect(loser?.won).toBe(0);
    expect(loser?.lost).toBe(1);
    expect(loser?.played).toBe(1);
    expect(loser?.pointsFor).toBe(60);
    expect(loser?.pointsAgainst).toBe(80);
    expect(loser?.diff).toBe(-20);
    expect(loser?.streak).toEqual(['L']);
  });

  it('debe desempatar equipos ordenando por Puntos -> Diferencia de Gol -> Puntos a Favor', () => {
    // Ambos equipos ganan 1 partido y pierden 1 partido (ambos con 3 puntos)
    // Equipo A: gana 70-50 (+20), pierde 60-70 (-10). Total: 3 pts, diff +10, PF: 130
    // Equipo B: gana 60-55 (+5), pierde 50-60 (-10). Total: 3 pts, diff -5, PF: 110
    const matches: Match[] = [
      {
        id: '1',
        tournament: 'Apertura',
        date: '2026-04-01',
        time: '10:00',
        homeTeam: 'Equipo A',
        awayTeam: 'Rival X',
        scoreHome: 70,
        scoreAway: 50,
        status: 'finished',
      },
      {
        id: '2',
        tournament: 'Apertura',
        date: '2026-04-08',
        time: '10:00',
        homeTeam: 'Equipo A',
        awayTeam: 'Rival Y',
        scoreHome: 60,
        scoreAway: 70,
        status: 'finished',
      },
      {
        id: '3',
        tournament: 'Apertura',
        date: '2026-04-01',
        time: '12:00',
        homeTeam: 'Equipo B',
        awayTeam: 'Rival Z',
        scoreHome: 60,
        scoreAway: 55,
        status: 'finished',
      },
      {
        id: '4',
        tournament: 'Apertura',
        date: '2026-04-08',
        time: '12:00',
        homeTeam: 'Equipo B',
        awayTeam: 'Rival W',
        scoreHome: 50,
        scoreAway: 60,
        status: 'finished',
      },
    ];

    const standings = computeEntries(matches);

    const posA = standings.findIndex(e => e.team === 'Equipo A');
    const posB = standings.findIndex(e => e.team === 'Equipo B');

    // Ambos tienen 3 puntos, pero Equipo A tiene diff +10 vs Equipo B diff -5
    expect(standings[posA].points).toBe(3);
    expect(standings[posB].points).toBe(3);
    expect(posA).toBeLessThan(posB);
  });

  it('debe ignorar partidos que son fecha libre (isRest) o sin resultado cargado', () => {
    const matches: Match[] = [
      {
        id: '1',
        tournament: 'Apertura',
        date: '2026-04-01',
        time: '10:00',
        homeTeam: 'Vélez',
        awayTeam: 'Libre',
        isRest: true,
        status: 'scheduled',
      },
      {
        id: '2',
        tournament: 'Apertura',
        date: '2026-04-08',
        time: '10:00',
        homeTeam: 'Ballester',
        awayTeam: 'Cárdenas',
        scoreHome: '',
        scoreAway: '',
        status: 'scheduled',
      },
    ];

    const standings = computeEntries(matches);
    expect(standings).toHaveLength(0);
  });

  it('debe registrar el historial de rachas cronológico acotado a 5 resultados', () => {
    const matches: Match[] = [
      { id: '1', tournament: 'T', date: '2026-01-01', time: '10:00', homeTeam: 'A', awayTeam: 'B', scoreHome: 50, scoreAway: 40, status: 'finished' },
      { id: '2', tournament: 'T', date: '2026-01-02', time: '10:00', homeTeam: 'A', awayTeam: 'B', scoreHome: 40, scoreAway: 50, status: 'finished' },
      { id: '3', tournament: 'T', date: '2026-01-03', time: '10:00', homeTeam: 'A', awayTeam: 'B', scoreHome: 60, scoreAway: 50, status: 'finished' },
      { id: '4', tournament: 'T', date: '2026-01-04', time: '10:00', homeTeam: 'A', awayTeam: 'B', scoreHome: 70, scoreAway: 60, status: 'finished' },
      { id: '5', tournament: 'T', date: '2026-01-05', time: '10:00', homeTeam: 'A', awayTeam: 'B', scoreHome: 80, scoreAway: 70, status: 'finished' },
      { id: '6', tournament: 'T', date: '2026-01-06', time: '10:00', homeTeam: 'A', awayTeam: 'B', scoreHome: 50, scoreAway: 55, status: 'finished' },
    ];

    const standings = computeEntries(matches);
    const teamA = standings.find(e => e.team === 'A');

    // Hubo 6 partidos, la racha solo guarda los últimos 5
    expect(teamA?.streak).toHaveLength(5);
    // Partidos de A: W, L, W, W, W, L -> Últimos 5: L, W, W, W, L
    expect(teamA?.streak).toEqual(['L', 'W', 'W', 'W', 'L']);
  });

  it('debe detectar correctamente si una etapa corresponde a playoffs o fase eliminatoria', () => {
    expect(isKnockoutStage('Cuartos de Final')).toBe(true);
    expect(isKnockoutStage('Semifinales')).toBe(true);
    expect(isKnockoutStage('Final')).toBe(true);
    expect(isKnockoutStage('Playoff 1')).toBe(true);
    expect(isKnockoutStage('Octavos')).toBe(true);

    expect(isKnockoutStage('Fase Regular')).toBe(false);
    expect(isKnockoutStage('Fecha 1')).toBe(false);
    expect(isKnockoutStage('Zona A')).toBe(false);
  });
});
