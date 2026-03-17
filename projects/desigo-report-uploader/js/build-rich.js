function buildRich(rawData, monthYear) {
    const wb = XLSX.utils.book_new();

    const sheetDefinitions = [
        { name: 'Main Tank', dataKey: rawData.mainTankList },
        { name: 'HP Line', dataKey: rawData.hpLineList },
        { name: 'Bindley', dataKey: rawData.bindleyList }
    ];

    
    for (const sheetDef of sheetDefinitions) {
        const dataCount = sheetDef.dataKey.length;
        const ws = {};

        // Header row
        ws[encodeCell(0, 0)] = {t: 's', v:'Date and Time'};
        ws[encodeCell(0, 1)] = {t: 's', v: sheetDef.name};

        // Data rows
        for (let i = 0; i < dataCount; i++) {
            const excelRow = i + 1;
            ws[encodeCell(excelRow, 0)] = {
                t: 'd', 
                v: sheetDef.dataKey[i].timestamp,
                z: 'm/d/yyyy h:mm'};
            ws[encodeCell(excelRow, 1)] = {t: 'n', v: sheetDef.dataKey[i].value};
        }

        ws['!ref'] = XLSX.utils.encode_range({
            s: {r: 0, c: 0},
            e: {r: dataCount, c: 1}
        });

        ws['!cols'] = [
            {wch: 22}, // Date and Time
            {wch: 15}  // Value
        ];

        XLSX.utils.book_append_sheet(wb, ws, sheetDef.name);
    }

    const richFileName = `${extractMonthNumber(rawData.bindleyList[0].timestamp)} - Raw N2 Report ${monthYear}.xlsx`;
    XLSX.writeFile(wb, richFileName);
};