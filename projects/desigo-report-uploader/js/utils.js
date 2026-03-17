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