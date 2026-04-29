const ExcelJS = require('exceljs');
async function readAux() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('./public/template.xlsx');
    const ws = workbook.getWorksheet('Aux');
    if (!ws) { console.log("No Aux sheet"); return; }
    
    console.log("--- CATEGORIAS (A1:A2) ---");
    for(let i=1; i<=2; i++) console.log(ws.getCell(`A${i}`).value);
    
    console.log("--- CLUBES (C1:C13) ---");
    for(let i=1; i<=13; i++) console.log(ws.getCell(`C${i}`).value);
    
    console.log("--- TORNEOS (E1:E14) ---");
    for(let i=1; i<=14; i++) console.log(ws.getCell(`E${i}`).value);
}
readAux();
