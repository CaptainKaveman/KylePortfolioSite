let selectedFile = null;

function handleFile(file) {
    selectedFile = file;
};

function parseRawFile(arrayBuffer) {
    return XLSX.read(arrayBuffer, {type: 'array', cellDates: true});
};

function extractData(workbook) {
    validateWorkbook(workbook);

    const mainTankList = [];
    const hpLineList = [];
    const bindleyList = [];

    let trimmedCount = 0;
    let skippedRowCount = 0;
    let expectedMonth;
    let expectedYear;

    for (const sheetIndex of [0, 1, 2]) {
        const worksheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];
        const rows = XLSX.utils.sheet_to_json(worksheet, {header: 1, raw: true});
        
        let dataStartIndex = -1;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] instanceof Date) {
                dataStartIndex = i;
                break;
            }
        }

        if (dataStartIndex === -1) {
            throw new Error(`No valid data found in sheet ${workbook.SheetNames[sheetIndex]}.`);
        }

        if (sheetIndex === 0) {
            expectedMonth = rows[dataStartIndex][0].getMonth();
            expectedYear = rows[dataStartIndex][0].getFullYear();
        }

        const dataList = sheetIndex === 0 ? mainTankList
                : sheetIndex === 1 ? hpLineList
                : bindleyList;
        
        for (let i = dataStartIndex; i < rows.length; i++) {
            const row = rows[i];

            if (!(row[0] instanceof Date)) {
                break;
            }

            if (row[0].getMonth() !== expectedMonth || row[0].getFullYear() !== expectedYear) {
                trimmedCount++;
                continue;
            }

            let val = parseFloat(row[1]);
            if (isNaN(val)) {
                skippedRowCount++;
                continue;
            }

            dataList.push({timestamp: row[0], value: val});
        }
    }

    validateDataFound(mainTankList, 'Main Tank');
    validateDataFound(hpLineList, 'HP Line');
    validateDataFound(bindleyList, 'Bindley');
    validateRowAlignment(bindleyList, mainTankList);

    if (trimmedCount > 0) {
        console.warn(`Trimmed ${trimmedCount} rows that were outside the expected month/year.`);
    }

    if (skippedRowCount > 0) {
        console.warn(`Skipped ${skippedRowCount} rows that had invalid numeric values.`);
    }

    return { mainTankList, hpLineList, bindleyList };
};