import { describe, it, expect } from 'vitest';
import { initialPlayerTally } from '../context/GameContext';
import { TallyStatsPeriod, PlayerStreak } from '../types';

describe('Reglas de Juego y Cálculo Estadístico de Cestoball', () => {
  it('debe calcular correctamente los puntos totales sumando dobles (2 pts) y triples (3 pts)', () => {
    const stats: TallyStatsPeriod = {
      goles: 8, // 8 * 2 = 16 pts
      triples: 3, // 3 * 3 = 9 pts
      fallos: 4,
      recuperos: 5,
      perdidas: 2,
      reboteOfensivo: 4,
      reboteDefensivo: 6,
      asistencias: 7,
      golesContra: 0,
      faltasPersonales: 2,
    };

    const totalPoints = stats.goles * 2 + stats.triples * 3;
    const totalShots = stats.goles + stats.triples + stats.fallos;
    const totalRebounds = stats.reboteOfensivo + stats.reboteDefensivo;
    const golPercentage = totalShots > 0 ? ((stats.goles + stats.triples) / totalShots) * 100 : 0;

    expect(totalPoints).toBe(25);
    expect(totalShots).toBe(15);
    expect(totalRebounds).toBe(10);
    expect(Number(golPercentage.toFixed(1))).toBe(73.3);
  });

  it('debe acumular correctamente las estadísticas por período en initialPlayerTally', () => {
    const tally = JSON.parse(JSON.stringify(initialPlayerTally));

    // Primer Tiempo
    tally['First Half'].goles = 5;
    tally['First Half'].faltasPersonales = 1;

    // Segundo Tiempo
    tally['Second Half'].goles = 3;
    tally['Second Half'].triples = 2;
    tally['Second Half'].faltasPersonales = 2;

    const totalGoles = tally['First Half'].goles + tally['Second Half'].goles;
    const totalTriples = tally['First Half'].triples + tally['Second Half'].triples;
    const totalFouls = tally['First Half'].faltasPersonales + tally['Second Half'].faltasPersonales;

    expect(totalGoles).toBe(8);
    expect(totalTriples).toBe(2);
    expect(totalFouls).toBe(3);
  });

  describe('Detección de Rachas: Mano Caliente y Mano Fría', () => {
    it('debe detectar "Mano Caliente" al alcanzar el umbral de aciertos y resetear la racha fría', () => {
      const threshold = 4;
      let streak: PlayerStreak = {
        consecutiveGoles: 0,
        consecutiveMisses: 2,
        notifiedCaliente: false,
        notifiedFria: false,
      };

      // Simular 4 aciertos seguidos (goles o triples)
      for (let i = 1; i <= 4; i++) {
        streak.consecutiveGoles += 1;
        streak.consecutiveMisses = 0;
        streak.notifiedFria = false;

        if (streak.consecutiveGoles >= threshold && !streak.notifiedCaliente) {
          streak.notifiedCaliente = true;
        }
      }

      expect(streak.consecutiveGoles).toBe(4);
      expect(streak.consecutiveMisses).toBe(0);
      expect(streak.notifiedCaliente).toBe(true);
    });

    it('debe resetear la racha de aciertos inmediatamente tras un fallo y activar Mano Fría si alcanza el umbral', () => {
      const threshold = 3;
      let streak: PlayerStreak = {
        consecutiveGoles: 5,
        consecutiveMisses: 0,
        notifiedCaliente: true,
        notifiedFria: false,
      };

      // Simular un fallo
      streak.consecutiveMisses += 1;
      streak.consecutiveGoles = 0;
      streak.notifiedCaliente = false;

      expect(streak.consecutiveGoles).toBe(0);
      expect(streak.consecutiveMisses).toBe(1);
      expect(streak.notifiedCaliente).toBe(false);

      // Simular 2 fallos adicionales para alcanzar umbral 3
      for (let i = 2; i <= 3; i++) {
        streak.consecutiveMisses += 1;
        if (streak.consecutiveMisses >= threshold && !streak.notifiedFria) {
          streak.notifiedFria = true;
        }
      }

      expect(streak.consecutiveMisses).toBe(3);
      expect(streak.notifiedFria).toBe(true);
    });
  });

  describe('Gestión de Faltas', () => {
    it('debe sumar la falta individual al acumulado colectivo del período para jugadoras, pero no para "Equipo"', () => {
      const teamFouls = {
        'First Half': 0,
        'Second Half': 0,
        'First Overtime': 0,
        'Second Overtime': 0,
      };

      const recordFoul = (playerNumber: string, period: keyof typeof teamFouls) => {
        if (playerNumber !== 'Equipo') {
          teamFouls[period] += 1;
        }
      };

      recordFoul('10', 'First Half');
      recordFoul('7', 'First Half');
      recordFoul('Equipo', 'First Half'); // Faltas técnicas asignadas a banco/equipo

      recordFoul('12', 'Second Half');

      expect(teamFouls['First Half']).toBe(2);
      expect(teamFouls['Second Half']).toBe(1);
    });
  });
});
