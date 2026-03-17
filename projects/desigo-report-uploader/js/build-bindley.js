function buildBindleyFile(rawData, monthYear) {
    const wb = XLSX.utils.book_new();
    const ws = {};

    const bindleyList = rawData.bindleyList;
    const mainTankList = rawData.mainTankList;
    const dataCount = bindleyList.length;
    const dataLastRow  = dataCount + 1;

    // Write header
    ws[encodeCell(0, 0)] = {t: 's', v:'Date and Time'};
    ws[encodeCell(0, 1)] = {t: 's', v:'Bindley'};
    ws[encodeCell(0, 2)] = {t: 's', v:'Main Tank'};

    for (let i = 0; i < dataCount; i++) {
        const excelRow = i + 1;
        ws[encodeCell(excelRow, 0)] = {
            t: 'd', 
            v: bindleyList[i].timestamp,
            z: 'm/d/yyyy h:mm'};
        ws[encodeCell(excelRow, 1)] = {t: 'n', v: bindleyList[i].value};
        ws[encodeCell(excelRow, 2)] = {t: 'n', v: mainTankList[i].value};
    }

    // --- Average row ---
    const averageRowIndex = dataCount + 1;
    ws[encodeCell(averageRowIndex, 0)] = {t: 's', v: 'Average CFM'};
    ws[encodeCell(averageRowIndex, 1)] = {t: 'n', f: `AVERAGE(B2:B${dataLastRow})`, z: '0.00'};
    ws[encodeCell(averageRowIndex, 2)] = {t: 'n', f: `AVERAGE(C2:C${dataLastRow})`, z: '0.00'};

    // --- Bindley % of Total row ---
    const avgExcelRow = dataLastRow + 1;
    const pctExcelRow = dataCount + 2;
    ws[encodeCell(pctExcelRow, 0)] = {t: 's', v: 'Bindley as % of Total'};
    ws[encodeCell(pctExcelRow, 1)] = {t: 'n', f: `B${avgExcelRow}/C${avgExcelRow}`, z: '0.00%'};

    // --- Sheet bounds ---
    ws['!ref'] = XLSX.utils.encode_range({
        s: {r: 0, c: 0},
        e: {r: pctExcelRow, c: 2}
    });

    // --- Column widths ---
    ws['!cols'] = [
        {wch: 22}, // Date and Time
        {wch: 15}, // Bindley
        {wch: 15}  // Main Tank
    ];

    // --- Add sheet and download ---
    XLSX.utils.book_append_sheet(wb, ws, monthYear);
    XLSX.writeFile(wb, `${extractMonthNumber(rawData.bindleyList[0].timestamp)} - Bindley N2 Report ${monthYear}.xlsx`);
};