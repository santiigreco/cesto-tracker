
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

const getZeroStats = (): CalculatedStats => ({
    lanzamientos: 0, goles: 0, triples: 0,
    reboteOfensivo: 0, reboteDefensivo: 0,
    recuperos: 0, perdidas: 0, faltas: 0
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

// --- Reusable Style Constants ---
const FONT_NAME = 'Aptos Narrow';
const FILL_LIGHT: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
const FILL_DARK: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFBFBF' } };

const B_THIN: ExcelJS.BorderStyle = 'thin';
const B_MED: ExcelJS.BorderStyle = 'medium';

const thin = (s: ExcelJS.BorderStyle): Partial<ExcelJS.Border> => ({ style: s, color: { argb: 'FF000000' } });

const CENTER: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle' };
const CENTER_WRAP: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle', wrapText: true };

// Border helpers
const border = (l?: ExcelJS.BorderStyle, r?: ExcelJS.BorderStyle, t?: ExcelJS.BorderStyle, b?: ExcelJS.BorderStyle): Partial<ExcelJS.Borders> => {
    const res: Partial<ExcelJS.Borders> = {};
    if (l) res.left = thin(l);
    if (r) res.right = thin(r);
    if (t) res.top = thin(t);
    if (b) res.bottom = thin(b);
    return res;
};

/**
 * Generates the Federation Report Excel matching the official FCCF format exactly.
 * Single sheet "Reporte a FCCF", no "Crudo" sheet.
 */
export const generateFederationExcel = async (gameState: GameState) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Cesto Tracker';
    workbook.created = new Date();

    const ws = workbook.addWorksheet('Reporte a FCCF', {
        views: [{
            showGridLines: false,
            state: 'frozen',
            xSplit: 3,
            ySplit: 8,
        }],
        pageSetup: {
            paperSize: 9,
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 1,
            margins: { left: 0.25, right: 0.25, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
        }
    });

    // --- Column Widths (A=spacer, B=#, C=Name, D-AI=stats, AJ-AQ=total) ---
    ws.getColumn(1).width = 2;
    ws.getColumn(2).width = 6.71;
    ws.getColumn(3).width = 18.71;
    for (let c = 4; c <= 35; c++) ws.getColumn(c).width = 6.71;
    for (let c = 36; c <= 43; c++) ws.getColumn(c).width = 8.71;

    // =============================================
    // ROW 2: Club / Torneo / Fecha metadata
    // =============================================
    const setMetaField = (
        row: number, labelCol: number, labelText: string,
        valueStartCol: number, valueEndCol: number, value: string | Date,
        isDate = false
    ) => {
        // Label cell(s) - merge if label spans 2 cols
        const labelEndCol = valueStartCol - 1;
        if (labelEndCol > labelCol) {
            ws.mergeCells(row, labelCol, row, labelEndCol);
        }
        const lc = ws.getRow(row).getCell(labelCol);
        lc.value = labelText;
        lc.font = { name: FONT_NAME, size: 11, bold: true };
        lc.fill = FILL_LIGHT;
        lc.border = border(B_THIN, undefined, B_THIN, B_THIN);
        lc.alignment = { horizontal: 'left', vertical: 'middle' };

        // Value cells - merge
        ws.mergeCells(row, valueStartCol, row, valueEndCol);
        const vc = ws.getRow(row).getCell(valueStartCol);
        vc.value = value;
        if (isDate) {
            vc.numFmt = 'dd/mm/yyyy';
        }
        vc.font = { name: FONT_NAME, size: 11 };
        vc.alignment = { horizontal: 'center', vertical: 'middle' };
        vc.border = border(undefined, B_THIN, B_THIN, B_THIN);

        // Fill middle merged value cells with borders
        for (let c = valueStartCol; c <= valueEndCol; c++) {
            const cell = ws.getRow(row).getCell(c);
            if (c === valueEndCol) {
                cell.border = border(undefined, B_THIN, B_THIN, B_THIN);
            } else {
                cell.border = border(undefined, undefined, B_THIN, B_THIN);
            }
        }
    };

    // Row 2: Club / Torneo / Fecha
    setMetaField(2, 2, 'Club:', 3, 5, gameState.settings.myTeam || '-');
    setMetaField(2, 7, 'Torneo:', 9, 14, gameState.settings.tournamentName || '-');
    setMetaField(2, 16, 'Fecha:', 17, 19, new Date(), true);

    // Row 3: Small separator
    ws.getRow(3).height = 7.5;

    // Row 4: Rival / Categoría
    setMetaField(4, 2, 'Rival:', 3, 5, gameState.settings.gameName || '-');
    setMetaField(4, 7, 'Categoría:', 9, 14, '-');

    // Row 5: Separator with thick bottom
    ws.getRow(5).height = 15;

    // =============================================
    // ROW 6: Time Block Headers
    // =============================================
    const timeBlocks = [
        { title: '1er tiempo', startCol: 4, endCol: 11, fill: FILL_LIGHT },
        { title: '2do tiempo', startCol: 12, endCol: 19, fill: FILL_DARK },
        { title: '1er tiempo suplementario', startCol: 20, endCol: 27, fill: FILL_LIGHT },
        { title: '2do tiempo suplementario', startCol: 28, endCol: 35, fill: FILL_DARK },
        { title: 'TOTAL', startCol: 36, endCol: 43, fill: FILL_LIGHT },
    ];

    timeBlocks.forEach(block => {
        ws.mergeCells(6, block.startCol, 6, block.endCol);
        const cell = ws.getRow(6).getCell(block.startCol);
        cell.value = block.title;
        cell.font = block.title === 'TOTAL'
            ? { name: FONT_NAME, size: 11, bold: true }
            : { name: FONT_NAME, size: 11 };
        cell.fill = block.fill;
        cell.alignment = { horizontal: 'center' };

        // Apply medium top border + thin bottom to all cells in merge
        for (let c = block.startCol; c <= block.endCol; c++) {
            const mc = ws.getRow(6).getCell(c);
            mc.border = border(
                c === block.startCol ? B_MED : undefined,
                c === block.endCol ? B_MED : undefined,
                B_MED,
                B_THIN
            );
        }
    });

    // =============================================
    // ROWS 7-8: Metric Sub-headers
    // =============================================
    ws.getRow(7).height = 15;

    // B7:B8 = "#"
    ws.mergeCells('B7:B8');
    const cellHash = ws.getCell('B7');
    cellHash.value = '#';
    cellHash.font = { name: FONT_NAME, size: 9, bold: true };
    cellHash.fill = FILL_LIGHT;
    cellHash.alignment = CENTER_WRAP;
    cellHash.border = border(B_MED, B_THIN, B_THIN, B_THIN);

    // C7:C8 = "Nombre"
    ws.mergeCells('C7:C8');
    const cellNombre = ws.getCell('C7');
    cellNombre.value = 'Nombre';
    cellNombre.font = { name: FONT_NAME, size: 9, bold: true };
    cellNombre.fill = FILL_LIGHT;
    cellNombre.alignment = CENTER_WRAP;
    cellNombre.border = border(B_THIN, B_MED, B_THIN, B_THIN);

    // Helper to create 8-col metric headers for a time block
    const createMetricHeaders = (startCol: number, fill: ExcelJS.Fill, isTotal: boolean) => {
        const fontSz9Bold = { name: FONT_NAME, size: 9, bold: true };
        const fontSz9 = { name: FONT_NAME, size: 9 };

        // Helper for border based on position in block
        const cellBorder = (col: number, rowNum: number): Partial<ExcelJS.Borders> => {
            const isFirst = col === startCol;
            const isLast = col === startCol + 7;
            return border(
                isFirst ? B_MED : B_THIN,
                isLast ? B_MED : B_THIN,
                B_THIN,
                B_THIN
            );
        };

        // Col 0: Lanzamientos (merged 7:8)
        ws.mergeCells(7, startCol, 8, startCol);
        const cLanz = ws.getRow(7).getCell(startCol);
        cLanz.value = 'Lanza\nmientos';
        cLanz.font = fontSz9;
        cLanz.fill = fill;
        cLanz.alignment = CENTER_WRAP;
        cLanz.border = cellBorder(startCol, 7);

        // Col 1-2: Goles header (row 7 merged), Dobles/Triples (row 8)
        ws.mergeCells(7, startCol + 1, 7, startCol + 2);
        const cGoles = ws.getRow(7).getCell(startCol + 1);
        cGoles.value = 'Goles';
        cGoles.font = fontSz9;
        cGoles.fill = fill;
        cGoles.alignment = CENTER_WRAP;
        cGoles.border = border(B_THIN, B_THIN, B_THIN, B_THIN);

        const cDobles = ws.getRow(8).getCell(startCol + 1);
        cDobles.value = 'Dobles';
        cDobles.font = fontSz9;
        cDobles.fill = fill;
        cDobles.alignment = { horizontal: 'center' };
        cDobles.border = border(B_THIN, B_THIN, B_THIN, B_THIN);

        const cTriples = ws.getRow(8).getCell(startCol + 2);
        cTriples.value = 'Triples';
        cTriples.font = fontSz9;
        cTriples.fill = fill;
        cTriples.alignment = { horizontal: 'center' };
        cTriples.border = border(B_THIN, B_THIN, B_THIN, B_THIN);

        // Col 3-4: Rebotes header (row 7 merged), Ofens/Defens (row 8)
        ws.mergeCells(7, startCol + 3, 7, startCol + 4);
        const cReb = ws.getRow(7).getCell(startCol + 3);
        cReb.value = 'Rebotes';
        cReb.font = fontSz9;
        cReb.fill = fill;
        cReb.alignment = CENTER_WRAP;
        cReb.border = border(B_THIN, B_THIN, B_THIN, B_THIN);

        const cOfens = ws.getRow(8).getCell(startCol + 3);
        cOfens.value = isTotal ? 'Ofensivos' : 'Ofens';
        cOfens.font = fontSz9;
        cOfens.fill = fill;
        cOfens.alignment = { horizontal: 'center' };
        cOfens.border = border(B_THIN, B_THIN, B_THIN, B_THIN);

        const cDefens = ws.getRow(8).getCell(startCol + 4);
        cDefens.value = isTotal ? 'Defensivos' : 'Defens';
        cDefens.font = fontSz9;
        cDefens.fill = fill;
        cDefens.alignment = { horizontal: 'center' };
        cDefens.border = border(B_THIN, B_THIN, B_THIN, B_THIN);

        // Col 5: Recuperos (merged 7:8)
        ws.mergeCells(7, startCol + 5, 8, startCol + 5);
        const cRec = ws.getRow(7).getCell(startCol + 5);
        cRec.value = isTotal ? 'Recuperos' : 'Recu\nperos';
        cRec.font = fontSz9;
        cRec.fill = fill;
        cRec.alignment = CENTER_WRAP;
        cRec.border = border(B_THIN, B_THIN, B_THIN, B_THIN);

        // Col 6: Pérdidas (merged 7:8)
        ws.mergeCells(7, startCol + 6, 8, startCol + 6);
        const cPer = ws.getRow(7).getCell(startCol + 6);
        cPer.value = isTotal ? 'Pérdidas' : 'Pér\ndidas';
        cPer.font = fontSz9;
        cPer.fill = fill;
        cPer.alignment = CENTER_WRAP;
        cPer.border = border(B_THIN, B_THIN, B_THIN, B_THIN);

        // Col 7: Faltas (merged 7:8)
        ws.mergeCells(7, startCol + 7, 8, startCol + 7);
        const cFal = ws.getRow(7).getCell(startCol + 7);
        cFal.value = 'Faltas';
        cFal.font = fontSz9;
        cFal.fill = fill;
        cFal.alignment = CENTER_WRAP;
        cFal.border = cellBorder(startCol + 7, 7);
    };

    timeBlocks.forEach(block => createMetricHeaders(block.startCol, block.fill, block.title === 'TOTAL'));

    // =============================================
    // ROWS 9-20: Player Data (12 fixed rows)
    // =============================================
    const MAX_PLAYERS = 12;
    const DATA_START_ROW = 9;
    const DATA_END_ROW = 20; // 12 rows: 9-20

    const players = gameState.availablePlayers
        .sort((a, b) => Number(a) - Number(b))
        .slice(0, MAX_PLAYERS);

    // Stats calculation helper
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

    // Helper to apply data cell borders based on position in block
    const dataBlockBorder = (colInBlock: number, isLastRow: boolean): Partial<ExcelJS.Borders> => {
        // colInBlock: 0=first (medium left), 7=last (medium right)
        const left = colInBlock === 0 ? B_MED : B_THIN;
        const right = colInBlock === 7 ? B_MED : B_THIN;
        const bottom = isLastRow ? B_MED : B_THIN;
        return border(left, right, B_THIN, bottom);
    };

    // Fill data rows
    for (let rowIdx = 0; rowIdx < MAX_PLAYERS; rowIdx++) {
        const rowNum = DATA_START_ROW + rowIdx;
        const row = ws.getRow(rowNum);
        row.height = 30;

        const isLastDataRow = rowIdx === MAX_PLAYERS - 1;
        const playerNum = players[rowIdx];
        const hasPlayer = !!playerNum;

        // B: Player number
        const cellNum = row.getCell(2); // B
        cellNum.value = hasPlayer ? Number(playerNum) : undefined;
        cellNum.font = { name: FONT_NAME, size: 11 };
        cellNum.alignment = CENTER;
        cellNum.border = border(B_MED, B_THIN, B_THIN, isLastDataRow ? B_MED : B_THIN);

        // C: Player name
        const cellName = row.getCell(3); // C
        cellName.value = hasPlayer ? (gameState.playerNames[playerNum] || '') : '';
        cellName.font = { name: FONT_NAME, size: 11 };
        cellName.alignment = { vertical: 'middle', wrapText: true };
        cellName.border = border(B_THIN, B_MED, B_THIN, isLastDataRow ? B_MED : B_THIN);

        if (!hasPlayer) {
            // Empty row - fill all stat cells with borders only
            timeBlocks.forEach(block => {
                for (let offset = 0; offset < 8; offset++) {
                    const c = row.getCell(block.startCol + offset);
                    c.font = { name: FONT_NAME, size: 11 };
                    c.alignment = CENTER;
                    c.border = dataBlockBorder(offset, isLastDataRow);
                }
            });
            continue;
        }

        // Get stats for each period
        const stats1 = getStats(playerNum, 'First Half');
        const stats2 = getStats(playerNum, 'Second Half');
        const statsOt1 = getStats(playerNum, 'First Overtime');
        const statsOt2 = getStats(playerNum, 'Second Overtime');

        const fillDataBlock = (startCol: number, stats: CalculatedStats | null) => {
            const vals = stats
                ? [stats.lanzamientos, stats.goles, stats.triples, stats.reboteOfensivo, stats.reboteDefensivo, stats.recuperos, stats.perdidas, stats.faltas]
                : [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];

            for (let offset = 0; offset < 8; offset++) {
                const c = row.getCell(startCol + offset);
                c.value = vals[offset] ?? undefined;
                c.font = { name: FONT_NAME, size: 11 };
                c.alignment = CENTER;
                c.border = dataBlockBorder(offset, isLastDataRow);
            }
        };

        // Fill time period blocks with data values
        fillDataBlock(4, stats1);   // 1er tiempo (D-K)
        fillDataBlock(12, stats2);  // 2do tiempo (L-S)
        fillDataBlock(20, statsOt1); // 1er supl (T-AA)
        fillDataBlock(28, statsOt2); // 2do supl (AB-AI)

        // TOTAL column (AJ-AQ) uses SUM formulas
        const colLetters = ['AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ'];
        const periodFirstCols = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
        const periodSecondCols = ['L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];
        const periodOt1Cols = ['T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA'];
        const periodOt2Cols = ['AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI'];

        for (let offset = 0; offset < 8; offset++) {
            const c = row.getCell(36 + offset); // AJ=36
            c.value = {
                formula: `+${periodFirstCols[offset]}${rowNum}+${periodSecondCols[offset]}${rowNum}+${periodOt1Cols[offset]}${rowNum}+${periodOt2Cols[offset]}${rowNum}`,
                result: (stats1 as any)[Object.keys(stats1)[offset]] +
                    (stats2 as any)[Object.keys(stats2)[offset]] +
                    (statsOt1 as any)[Object.keys(statsOt1)[offset]] +
                    (statsOt2 as any)[Object.keys(statsOt2)[offset]]
            };
            c.font = { name: FONT_NAME, size: 11 };
            c.alignment = CENTER;
            c.border = dataBlockBorder(offset, isLastDataRow);
        }
    }

    // =============================================
    // ROW 21: Small separator
    // =============================================
    ws.getRow(21).height = 7.5;

    // =============================================
    // ROW 22: TOTAL row with SUM formulas
    // =============================================
    const TOTAL_ROW = 22;
    const totalRow = ws.getRow(TOTAL_ROW);
    totalRow.height = 30;

    // B22:C22 merged = "TOTAL"
    ws.mergeCells('B22:C22');
    const totalLabel = totalRow.getCell(2);
    totalLabel.value = 'TOTAL';
    totalLabel.font = { name: FONT_NAME, size: 11, bold: true };
    totalLabel.fill = FILL_DARK;
    totalLabel.alignment = CENTER;
    totalLabel.border = border(B_MED, B_MED, B_MED, B_MED);

    // Fill TOTAL data with SUM formulas for each block
    const totalFills = [FILL_LIGHT, FILL_DARK, FILL_LIGHT, FILL_DARK, FILL_LIGHT];

    timeBlocks.forEach((block, blockIdx) => {
        const fill = totalFills[blockIdx];
        for (let offset = 0; offset < 8; offset++) {
            const col = block.startCol + offset;
            const c = totalRow.getCell(col);

            // Get column letter for SUM formula
            const colLetter = ws.getColumn(col).letter;
            c.value = {
                formula: `SUM(${colLetter}${DATA_START_ROW}:${colLetter}${DATA_END_ROW})`,
                result: 0 // Will be calculated when opened
            };

            c.font = { name: FONT_NAME, size: 11, bold: true };
            c.fill = fill;
            c.alignment = CENTER;
            c.border = border(
                offset === 0 ? B_MED : B_THIN,
                offset === 7 ? B_MED : B_THIN,
                B_MED,
                B_MED
            );
        }
    });

    // =============================================
    // ROW 23: Separator
    // =============================================
    ws.getRow(23).height = 7.5;

    // =============================================
    // ROW 24: Footer text
    // =============================================
    const footerCell = ws.getCell('B24');
    footerCell.value = 'Estadísticas | Reporte a FCCF v2';
    footerCell.font = { name: FONT_NAME, size: 8 };

    // =============================================
    // EXPORT
    // =============================================
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `Reporte_FCCF_${gameState.settings.myTeam || 'Equipo'}_vs_${gameState.settings.gameName || 'Rival'}.xlsx`;

    // Handle FileSaver import discrepancy for esm.sh
    const saveAs = (FileSaver as any).saveAs || FileSaver;
    saveAs(blob, fileName);
};
