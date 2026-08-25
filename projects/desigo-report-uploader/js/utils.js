function deriveMonthYear(timestamp) {
    const month = timestamp.toLocaleString('default', { month: 'long' });
    const year = timestamp.getFullYear().toString();
    return `${month} ${year}`;
};

function encodeCell(rowIndex, colIndex) {
    return XLSX.utils.encode_cell({r: rowIndex, c: colIndex});
};

function extractMonthNumber(timestamp) {
    const dateNum = timestamp.getMonth(); // getMonth() returns 0 for January, 1 for February, etc.
    return String(dateNum + 1).padStart(2, '0'); // getMonth() is zero-based
}

function localDatetoSerial(date) {
    const roundedMs = Math.round(date.getTime() / 60000) * 60000; // Round to the nearest minute
    const roundedDate = new Date(roundedMs);
    const epoch = Date.UTC(1899, 11, 30);
    const targetDate = Date.UTC(roundedDate.getFullYear(), roundedDate.getMonth(), roundedDate.getDate(), roundedDate.getHours(), roundedDate.getMinutes());
    return (targetDate - epoch) / (1000 * 60 * 60 * 24);
};