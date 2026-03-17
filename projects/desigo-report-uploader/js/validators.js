const EXPECTED_SHEET_COUNT = 3;

function validateWorkbook(workbook) {
    if (workbook.SheetNames.length !== EXPECTED_SHEET_COUNT) {
        throw new Error(`Expected ${EXPECTED_SHEET_COUNT} sheets, but found ${workbook.SheetNames.length}.`);
    }
};

function validateDataFound(list, sheetLabel) {
    if (list.length === 0) {
        throw new Error(`No data found for ${sheetLabel}.`);
    }
};

function validateRowAlignment(list1, list2) {
    if (list1.length !== list2.length) {
        throw new Error(`Row count mismatch: ${list1.length} vs ${list2.length}.`);
    }
};
