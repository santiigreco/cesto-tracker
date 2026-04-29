
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { GameState } from '../types';

// Helper types for the specific stats structure
interface CalculatedStats {
    lanzamientos: number;
    goles: number; // Dobles
    triples: number;
    reboteOfensivo: number;
    reboteDefensivo: number;
    recuperos: number;
    perdidas: number;
    faltas: number;
}

export const generateFederationExcel = async (gameState: GameState) => {
    // 1. Load the exact template file from the public directory
    const response = await fetch('/template.xlsx');
    const arrayBuffer = await response.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    // 2. We only need to modify the data in "Reporte a FCCF" sheet.
    // The other sheets (Crudo, Para importar, Aux) have formulas that will automatically
    // pick up the changes when opened in Excel!
    const ws = workbook.getWorksheet('Reporte a FCCF');
    if (!ws) {
        console.error('No se encontró la hoja "Reporte a FCCF" en el template.');
        return;
    }

    // Unprotect sheet if necessary (ExcelJS can write to protected sheets but sometimes it helps to reset it)
    const protectionConfig = {
        algorithmName: 'SHA-512',
        hashValue: '1kpptv5JGLbrjer90pDNWKHDrmkBTZWsDdKuDsPMozln2Qa6TQdKHHm5pkQ8LlNJHX8tj0rTHhzX6JQqU5BCIQ==',
        saltValue: 'ba+XjhXGlcxToBZ92nemaQ==',
        spinCount: 100000,
        sheet: true,
        objects: true,
        scenarios: true
    };
    (ws as any).sheetProtection = protectionConfig;

    // --- Fill Headers ---
    ws.getCell('C2').value = gameState.settings.myTeam || '';
    ws.getCell('I2').value = gameState.settings.tournamentName || '';
    
    // Parse gameDate, ensuring it's treated as a local date
    const parsedDate = gameState.settings.gameDate ? new Date(gameState.settings.gameDate + 'T12:00:00') : new Date();
    ws.getCell('Q2').value = parsedDate;

    ws.getCell('C4').value = gameState.settings.gameName || '';
    ws.getCell('I4').value = gameState.settings.categoryName || '';

    // --- Fill Player Data ---
    const MAX_PLAYERS = 12;
    const DATA_START_ROW = 9;

    const players = gameState.availablePlayers
        .sort((a, b) => Number(a) - Number(b))
        .slice(0, MAX_PLAYERS);

    // Helper to calculate stats
    const getStats = (playerNum: string, period: string): CalculatedStats => {
        if (gameState.gameMode === 'stats-tally') {
            const pStats = gameState.tallyStats[playerNum]?.[period as any] || {};
            return {
                lanzamientos: (pStats.goles || 0) + (pStats.triples || 0) + (pStats.fallos || 0),
                goles: pStats.goles || 0,
                triples: pStats.triples || 0,
                reboteOfensivo: pStats.reboteOfensivo || 0,
                reboteDefensivo: pStats.reboteDefensivo || 0,
                recuperos: pStats.recuperos || 0,
                perdidas: pStats.perdidas || 0,
                faltas: pStats.faltasPersonales || 0,
            };
        } else {
            let g = 0, t = 0, f = 0;
            gameState.shots.forEach(s => {
                if (s.playerNumber === playerNum && s.period === period) {
                    if (s.isGol) { if (s.golValue === 3) t++; else g++; } else f++;
                }
            });
            return {
                lanzamientos: g + t + f, goles: g, triples: t,
                reboteOfensivo: 0, reboteDefensivo: 0, recuperos: 0, perdidas: 0, faltas: 0
            };
        }
    };

    // First, clear all the old dummy data from the template for rows 9 to 20
    for (let rowIdx = 0; rowIdx < 12; rowIdx++) {
        const rowNum = DATA_START_ROW + rowIdx;
        ws.getCell(`B${rowNum}`).value = null; // Number
        ws.getCell(`C${rowNum}`).value = '';   // Name
        // Columns D to AI are the stats (col 4 to 35)
        for (let colIdx = 4; colIdx <= 35; colIdx++) {
            ws.getCell(rowNum, colIdx).value = null;
        }
    }

    // Now insert the actual players and their stats
    for (let rowIdx = 0; rowIdx < players.length; rowIdx++) {
        const rowNum = DATA_START_ROW + rowIdx;
        const playerNum = players[rowIdx];
        const hasPlayer = !!playerNum;

        if (!hasPlayer) continue;

        // B: Player number
        ws.getCell(`B${rowNum}`).value = Number(playerNum);

        // C: Player name
        ws.getCell(`C${rowNum}`).value = gameState.playerNames[playerNum] || '';

        // Get stats for each period
        const stats1 = getStats(playerNum, 'First Half');
        const stats2 = getStats(playerNum, 'Second Half');
        const statsOt1 = getStats(playerNum, 'First Overtime');
        const statsOt2 = getStats(playerNum, 'Second Overtime');

        const fillDataBlock = (startCol: number, stats: CalculatedStats) => {
            const vals = [
                stats.lanzamientos, stats.goles, stats.triples, 
                stats.reboteOfensivo, stats.reboteDefensivo, 
                stats.recuperos, stats.perdidas, stats.faltas
            ];
            for (let offset = 0; offset < 8; offset++) {
                // If the value is 0, we can write 0 or null depending on preference,
                // but setting 0 is fine and clear.
                ws.getCell(rowNum, startCol + offset).value = vals[offset];
            }
        };

        // Fill time period blocks with data values
        fillDataBlock(4, stats1);    // 1er tiempo (D=4)
        fillDataBlock(12, stats2);   // 2do tiempo (L=12)
        fillDataBlock(20, statsOt1); // 1er supl (T=20)
        fillDataBlock(28, statsOt2); // 2do supl (AB=28)
    }

    // =============================================
    // EXPORT
    // =============================================
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = 'Estadísticas - Reporte a FCCF.xlsx';

    // Handle FileSaver import discrepancy for esm.sh
    const saveAs = (FileSaver as any).saveAs || FileSaver;
    saveAs(blob, fileName);
};

