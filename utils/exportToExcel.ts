
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { GameState, TallyStatsPeriod } from '../types';

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

const getZeroStats = (): CalculatedStats => ({
    lanzamientos: 0,
    goles: 0,
    triples: 0,
    reboteOfensivo: 0,
    reboteDefensivo: 0,
    recuperos: 0,
    perdidas: 0,
    faltas: 0
});

const addStats = (target: CalculatedStats, source: CalculatedStats) => {
    target.lanzamientos += source.lanzamientos;
    target.goles += source.goles;
    target.triples += source.triples;
    target.reboteOfensivo += source.reboteOfensivo;
    target.reboteDefensivo += source.reboteDefensivo;
    target.recuperos += source.recuperos;
    target.perdidas += source.perdidas;
    target.faltas += source.faltas;
};

/**
 * Generates the specific Federation Report and Raw Data sheet.
 */
export const generateFederationExcel = async (gameState: GameState) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Cesto Tracker';
    workbook.created = new Date();

    // 1. Create Sheets
    const sheetReport = workbook.addWorksheet('Reporte a FCCF', {
        views: [{ showGridLines: false }]
    });
    const sheetRaw = workbook.addWorksheet('Crudo');

    // ==========================================
    // HOJA 1: REPORTE A FCCF
    // ==========================================

    // --- Column Widths ---
    // A: # (4), B: Name (25), Rest (6)
    sheetReport.getColumn(1).width = 4;
    sheetReport.getColumn(2).width = 25;
    for (let i = 3; i <= 50; i++) {
        sheetReport.getColumn(i).width = 6;
    }

    // --- Styles ---
    const borderStyle: Partial<ExcelJS.Borders> = {
        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    const centerStyle: Partial<ExcelJS.Alignment> = { 
        vertical: 'middle', horizontal: 'center', wrapText: true 
    };
    const boldFont = { name: 'Arial', size: 10, bold: true };
    const normalFont = { name: 'Arial', size: 10 };

    // --- 1. Header & Metadata ---
    const cellA1 = sheetReport.getCell('A1');
    cellA1.value = "Provided by Cesto Tracker";
    cellA1.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF808080' } }; // Gray

    // Metadata Rows 2-5
    const setMeta = (cellStr: string, label: string, value: string, mergeWidth: number = 3) => {
        const c = sheetReport.getCell(cellStr);
        c.value = label;
        c.font = boldFont;
        c.border = borderStyle;
        c.alignment = { vertical: 'middle', horizontal: 'right' };

        const row = Number(c.row);
        const col = Number(c.col);
        const startMerge = col + 1;
        const endMerge = col + mergeWidth;

        sheetReport.mergeCells(row, startMerge, row, endMerge);
        const valCell = sheetReport.getRow(row).getCell(startMerge);
        valCell.value = value;
        valCell.font = { ...normalFont, bold: true };
        valCell.alignment = { horizontal: 'center', vertical: 'middle' };
        valCell.border = borderStyle;
    };

    // B2 -> Value in C2:F2 (4 cols)
    setMeta('B2', 'Club:', gameState.settings.myTeam || '-', 4);
    // H2 -> Value in I2:L2 (4 cols)
    setMeta('H2', 'Torneo:', gameState.settings.tournamentName || '-', 4);
    // N2 -> Value in O2:Q2 (3 cols)
    setMeta('N2', 'Fecha:', new Date().toLocaleDateString(), 3);
    
    // B4 -> Value in C4:F4
    setMeta('B4', 'Rival:', gameState.settings.gameName || '-', 4);
    // H4 -> Value in I4:L4
    setMeta('H4', 'Categoría:', '-', 4);

    // --- 2. Grid Headers (Rows 6-8) ---
    
    // Row 6: Time Blocks
    const timeBlocks = [
        { title: "1er tiempo", startCol: 3, endCol: 10 },      // C-J
        { title: "2do tiempo", startCol: 11, endCol: 18 },     // K-R
        { title: "1er tiempo suplementario", startCol: 19, endCol: 26 }, // S-Z
        { title: "2do tiempo suplementario", startCol: 27, endCol: 34 }, // AA-AH
        { title: "TOTAL", startCol: 35, endCol: 42 }           // AI-AP
    ];

    timeBlocks.forEach(block => {
        sheetReport.mergeCells(6, block.startCol, 6, block.endCol);
        const cell = sheetReport.getRow(6).getCell(block.startCol);
        cell.value = block.title.toUpperCase();
        cell.font = boldFont;
        cell.alignment = centerStyle;
        cell.border = borderStyle;
        // Apply background color for better visibility
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDEDED' } };
    });

    // Rows 7-8: Metrics Sub-headers (The Pattern)
    // Columns A & B
    sheetReport.mergeCells('A7:A8');
    const cellHash = sheetReport.getCell('A7');
    cellHash.value = "#";
    cellHash.alignment = centerStyle;
    cellHash.border = borderStyle;
    cellHash.font = boldFont;

    sheetReport.mergeCells('B7:B8');
    const cellName = sheetReport.getCell('B7');
    cellName.value = "Nombre";
    cellName.alignment = centerStyle;
    cellName.border = borderStyle;
    cellName.font = boldFont;

    // Helper to generate the 8-column metric block
    const createMetricHeaders = (startCol: number) => {
        // Col 1: Lanzamientos (Merged 7-8)
        sheetReport.mergeCells(7, startCol, 8, startCol);
        const cellLanz = sheetReport.getRow(7).getCell(startCol);
        cellLanz.value = "Lanz."; // Abbreviated to fit
        cellLanz.alignment = centerStyle;
        cellLanz.border = borderStyle;
        cellLanz.font = { size: 8, bold: true }; // Small font for tight fit

        // Col 2-3: Goles (Merged 7) -> Dobles/Triples (8)
        sheetReport.mergeCells(7, startCol + 1, 7, startCol + 2);
        const cellGoles = sheetReport.getRow(7).getCell(startCol + 1);
        cellGoles.value = "Goles";
        cellGoles.alignment = centerStyle;
        cellGoles.border = borderStyle;
        cellGoles.font = boldFont;

        sheetReport.getRow(8).getCell(startCol + 1).value = "Dobles";
        sheetReport.getRow(8).getCell(startCol + 2).value = "Triples";

        // Col 4-5: Rebotes (Merged 7) -> Ofens/Defens (8)
        sheetReport.mergeCells(7, startCol + 3, 7, startCol + 4);
        const cellReb = sheetReport.getRow(7).getCell(startCol + 3);
        cellReb.value = "Rebotes";
        cellReb.alignment = centerStyle;
        cellReb.border = borderStyle;
        cellReb.font = boldFont;

        sheetReport.getRow(8).getCell(startCol + 3).value = "Ofens";
        sheetReport.getRow(8).getCell(startCol + 4).value = "Defens";

        // Col 6: Recuperos (Merged 7-8)
        sheetReport.mergeCells(7, startCol + 5, 8, startCol + 5);
        const cellRec = sheetReport.getRow(7).getCell(startCol + 5);
        cellRec.value = "Recup.";
        cellRec.alignment = centerStyle;
        cellRec.border = borderStyle;
        cellRec.font = { size: 9, bold: true };

        // Col 7: Pérdidas (Merged 7-8)
        sheetReport.mergeCells(7, startCol + 6, 8, startCol + 6);
        const cellPer = sheetReport.getRow(7).getCell(startCol + 6);
        cellPer.value = "Pérd.";
        cellPer.alignment = centerStyle;
        cellPer.border = borderStyle;
        cellPer.font = { size: 9, bold: true };

        // Col 8: Faltas (Merged 7-8)
        sheetReport.mergeCells(7, startCol + 7, 8, startCol + 7);
        const cellFal = sheetReport.getRow(7).getCell(startCol + 7);
        cellFal.value = "Faltas";
        cellFal.alignment = centerStyle;
        cellFal.border = borderStyle;
        cellFal.font = { size: 9, bold: true };

        // Style the Row 8 cells we just created
        [1, 2, 3, 4].forEach(offset => {
            const c = sheetReport.getRow(8).getCell(startCol + offset);
            c.alignment = centerStyle;
            c.border = borderStyle;
            c.font = { size: 8, bold: true };
        });
    };

    // Generate headers for all 5 blocks
    timeBlocks.forEach(block => createMetricHeaders(block.startCol));

    // --- 3. Data Population ---
    const players = gameState.availablePlayers.sort((a, b) => Number(a) - Number(b));
    let currentRow = 9;

    // Accumulators for the final TOTAL row
    const totals = {
        firstHalf: getZeroStats(),
        secondHalf: getZeroStats(),
        ot1: getZeroStats(),
        ot2: getZeroStats(),
        gameTotal: getZeroStats(),
    };

    players.forEach(playerNum => {
        const row = sheetReport.getRow(currentRow);
        
        // Identity
        const cellNum = row.getCell(1);
        cellNum.value = Number(playerNum);
        cellNum.alignment = centerStyle;
        cellNum.border = borderStyle;

        const cellName = row.getCell(2);
        cellName.value = gameState.playerNames[playerNum] || '';
        cellName.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        cellName.border = borderStyle;

        // Stats Logic
        const getStats = (period: string): CalculatedStats => {
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
                // Shot chart mode aggregation
                let g=0, t=0, f=0, ro=0, rd=0, rec=0, per=0, fal=0;
                gameState.shots.forEach(s => {
                    if (s.playerNumber === playerNum && s.period === period) {
                        if (s.isGol) {
                            if (s.golValue === 3) t++; else g++;
                        } else {
                            f++;
                        }
                    }
                });
                return { 
                    lanzamientos: g+t+f, goles: g, triples: t, 
                    reboteOfensivo: 0, reboteDefensivo: 0, recuperos: 0, perdidas: 0, faltas: 0 
                };
            }
        };

        const stats1 = getStats('First Half');
        const stats2 = getStats('Second Half');
        const statsOt1 = getStats('First Overtime');
        const statsOt2 = getStats('Second Overtime');

        const statsTotal: CalculatedStats = {
            lanzamientos: stats1.lanzamientos + stats2.lanzamientos + statsOt1.lanzamientos + statsOt2.lanzamientos,
            goles: stats1.goles + stats2.goles + statsOt1.goles + statsOt2.goles,
            triples: stats1.triples + stats2.triples + statsOt1.triples + statsOt2.triples,
            reboteOfensivo: stats1.reboteOfensivo + stats2.reboteOfensivo + statsOt1.reboteOfensivo + statsOt2.reboteOfensivo,
            reboteDefensivo: stats1.reboteDefensivo + stats2.reboteDefensivo + statsOt1.reboteDefensivo + statsOt2.reboteDefensivo,
            recuperos: stats1.recuperos + stats2.recuperos + statsOt1.recuperos + statsOt2.recuperos,
            perdidas: stats1.perdidas + stats2.perdidas + statsOt1.perdidas + statsOt2.perdidas,
            faltas: stats1.faltas + stats2.faltas + statsOt1.faltas + statsOt2.faltas
        };

        // Accumulate for Grand Totals
        addStats(totals.firstHalf, stats1);
        addStats(totals.secondHalf, stats2);
        addStats(totals.ot1, statsOt1);
        addStats(totals.ot2, statsOt2);
        addStats(totals.gameTotal, statsTotal);

        // Fill Row Helper
        const fillBlock = (startCol: number, stats: CalculatedStats) => {
            const setVal = (offset: number, val: number) => {
                const c = row.getCell(startCol + offset);
                c.value = val;
                c.alignment = centerStyle;
                c.border = borderStyle;
            };
            setVal(0, stats.lanzamientos);
            setVal(1, stats.goles);
            setVal(2, stats.triples);
            setVal(3, stats.reboteOfensivo);
            setVal(4, stats.reboteDefensivo);
            setVal(5, stats.recuperos);
            setVal(6, stats.perdidas);
            setVal(7, stats.faltas);
        };

        // Fill Grid
        fillBlock(3, stats1);  // 1er tiempo (C)
        fillBlock(11, stats2); // 2do tiempo (K)
        fillBlock(19, statsOt1); // 1er OT (S)
        fillBlock(27, statsOt2); // 2do OT (AA)
        fillBlock(35, statsTotal); // Total (AI)

        currentRow++;
    });

    // --- TOTAL ROW ---
    const totalRow = sheetReport.getRow(currentRow);
    // Label
    sheetReport.mergeCells(`A${currentRow}:B${currentRow}`);
    const totalLabelCell = totalRow.getCell(1);
    totalLabelCell.value = "TOTALES";
    totalLabelCell.font = boldFont;
    totalLabelCell.alignment = centerStyle;
    totalLabelCell.border = borderStyle;
    totalLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } }; // Light Gray

    // Fill Total Data
    const fillTotalBlock = (startCol: number, stats: CalculatedStats) => {
        const setVal = (offset: number, val: number) => {
            const c = totalRow.getCell(startCol + offset);
            c.value = val;
            c.alignment = centerStyle;
            c.font = boldFont;
            c.border = borderStyle;
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
        };
        setVal(0, stats.lanzamientos);
        setVal(1, stats.goles);
        setVal(2, stats.triples);
        setVal(3, stats.reboteOfensivo);
        setVal(4, stats.reboteDefensivo);
        setVal(5, stats.recuperos);
        setVal(6, stats.perdidas);
        setVal(7, stats.faltas);
    };

    fillTotalBlock(3, totals.firstHalf);
    fillTotalBlock(11, totals.secondHalf);
    fillTotalBlock(19, totals.ot1);
    fillTotalBlock(27, totals.ot2);
    fillTotalBlock(35, totals.gameTotal);

    // --- FINAL STYLING: THICK SECTION BORDERS ---
    // Apply borders from Row 6 down to the Total Row (currentRow)
    // Sections start columns: 3, 11, 19, 27, 35
    // Sections end columns: 10, 18, 26, 34, 42
    
    for (let r = 6; r <= currentRow; r++) {
        const row = sheetReport.getRow(r);
        
        const applyThickBorder = (col: number, side: 'left' | 'right') => {
            const cell = row.getCell(col);
            const currentBorder = cell.border || {};
            cell.border = {
                ...currentBorder,
                [side]: { style: 'medium' }
            };
        };

        // Left borders of sections
        [3, 11, 19, 27, 35].forEach(c => applyThickBorder(c, 'left'));
        // Right borders of sections
        [10, 18, 26, 34, 42].forEach(c => applyThickBorder(c, 'right'));
    }


    // ==========================================
    // HOJA 2: CRUDO
    // ==========================================
    
    // Headers
    const rawHeaders = [
        'Categoría', 'Torneo', 'Fecha', 'Club', 'Rival', 'Tiempo', 
        '# jugador', 'Nombre jugador', 'Lanzamientos', 'Dobles', 'Triples', 
        'Ofens', 'Defens', 'Recuperos', 'Pérdidas', 'Faltas'
    ];
    
    const rawHeaderRow = sheetRaw.getRow(1);
    rawHeaders.forEach((h, i) => {
        const cell = rawHeaderRow.getCell(i + 1);
        cell.value = h;
        cell.font = boldFont;
    });

    // Rows
    players.forEach(playerNum => {
        ['First Half', 'Second Half', 'First Overtime', 'Second Overtime'].forEach(periodKey => {
            const stats = (gameState.gameMode === 'stats-tally') 
                ? (gameState.tallyStats[playerNum]?.[periodKey as any] || {})
                : { goles:0, triples:0, fallos:0, reboteOfensivo:0, reboteDefensivo:0, recuperos:0, perdidas:0, faltasPersonales:0 };
            
            // Re-calculate basic stats for Shot Chart mode if needed inside the loop
            if (gameState.gameMode === 'shot-chart') {
                 gameState.shots.forEach(s => {
                    if (s.playerNumber === playerNum && s.period === periodKey) {
                        if (s.isGol) {
                            if (s.golValue === 3) stats.triples = (stats.triples||0)+1; 
                            else stats.goles = (stats.goles||0)+1;
                        } else {
                            stats.fallos = (stats.fallos||0)+1;
                        }
                    }
                });
            }

            // Only add row if period has data or is main time
            if (periodKey === 'First Overtime' || periodKey === 'Second Overtime') {
                const totalActivity = (stats.goles||0) + (stats.triples||0) + (stats.fallos||0) + 
                                      (stats.recuperos||0) + (stats.perdidas||0) + (stats.faltasPersonales||0);
                if(totalActivity === 0) return;
            }

            const lanzamientos = (stats.goles||0) + (stats.triples||0) + (stats.fallos||0);
            
            let periodLabel = periodKey === 'First Half' ? '1er Tiempo' : '2do Tiempo';
            if (periodKey === 'First Overtime') periodLabel = '1er Suple';
            if (periodKey === 'Second Overtime') periodLabel = '2do Suple';

            sheetRaw.addRow([
                '-', // Categoría
                gameState.settings.tournamentName || '-',
                new Date().toLocaleDateString(),
                gameState.settings.myTeam || '-',
                gameState.settings.gameName || '-',
                periodLabel,
                Number(playerNum),
                gameState.playerNames[playerNum] || '',
                lanzamientos,
                stats.goles || 0,
                stats.triples || 0,
                stats.reboteOfensivo || 0,
                stats.reboteDefensivo || 0,
                stats.recuperos || 0,
                stats.perdidas || 0,
                stats.faltasPersonales || 0
            ]);
        });
    });


    // ==========================================
    // EXPORT
    // ==========================================
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `Reporte_FCCF_${gameState.settings.myTeam || 'Equipo'}_vs_${gameState.settings.gameName || 'Rival'}.xlsx`;
    
    // Handle FileSaver import discrepancy for esm.sh
    const saveAs = (FileSaver as any).saveAs || FileSaver;
    saveAs(blob, fileName);
};
