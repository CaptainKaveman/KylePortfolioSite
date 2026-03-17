# Desigo Report Uploader — Development Reference

**Language:** JavaScript (Vanilla)  
**Library:** SheetJS (`xlsx`) — loaded via CDN  
**Output:** Single `.html` file or hosted multi-file project  
**Purpose:** Read raw Desigo `.xlsx` export, produce two formatted output files (Bindley and Rich)

---

## Table of Contents

1. [Project Structure Decision](#1-project-structure-decision)
2. [SheetJS Quick Reference](#2-sheetjs-quick-reference)
3. [Full Pseudocode](#3-full-pseudocode)
4. [Error Handling Reference](#4-error-handling-reference)
5. [Development Notes](#5-development-notes)
6. [Future Upgrade Path](#6-future-upgrade-path)

---

## 1. Project Structure Decision

### Single `.html` File (Recommended to start)

All HTML, CSS, and JavaScript lives in one file. SheetJS is loaded from CDN.

**Pros:**
- Dead simple to distribute — email it, drop it on a shared drive, done
- No server needed, opens locally in any browser
- Easier to maintain when solo developing
- Good starting point before deciding if hosting is worth it

**Cons:**
- File gets long as logic grows
- Harder to read once the JS exceeds a few hundred lines
- No build tooling, no module imports

**Best for:** Current version of this tool. One function, one audience, no backend needed.

---

### Hosted Multi-File Structure

If you host this (e.g. on your personal site at `kylecor.win`), you can split into proper folders:

```
/desigo-uploader/
  index.html
  /css/
    styles.css
  /js/
    main.js          ← UI event handlers, wires everything together
    fileReader.js    ← ReadRawFile(), ExtractData()
    buildBindley.js  ← GenerateBindleyReport()
    buildRich.js     ← GenerateRichReport()
    validators.js    ← All error checking functions
    utils.js         ← Shared helpers (date formatting, cell encoding, etc.)
```

**Pros:**
- Clean separation of concerns — each file has one job
- Much easier to navigate as the project grows
- Mirrors real-world web project structure (good for portfolio)
- Easy to add features later (progress bar, drag-and-drop, settings page)

**Cons:**
- Requires a web server to run locally (browser blocks local JS module imports)
  - Fix: use VS Code's Live Server extension, or `npx serve .`
- Slightly more setup overhead

**Best for:** If you decide to host it or plan to add features over time.

---

### Recommendation

Start with the single `.html` file. Once it's working, splitting into the multi-file structure is a straightforward refactor — you're mostly just cutting and pasting functions into separate files and adding `<script src="...">` tags. You don't have to decide now.

---

## 2. SheetJS Quick Reference

### Loading from CDN

```html
<script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>
```

> **Note:** Pin to a specific version in production (e.g. `xlsx-0.20.1`) rather than `xlsx-latest`
> to avoid breaking changes from future updates affecting your coworkers.

---

### Cell Type Codes (`t` property)

The `t` key tells SheetJS what kind of data a cell holds:

| Code | Type    | Example value         |
|------|---------|-----------------------|
| `n`  | Number  | `42`, `3.14`          |
| `s`  | String  | `"Date and Time"`     |
| `b`  | Boolean | `true`, `false`       |
| `d`  | Date    | `new Date()`          |
| `e`  | Error   | `#REF!`               |
| `z`  | Empty   | —                     |

---

### Cell Object Structure

Every cell in SheetJS is a plain JS object (think: Python dictionary) with specific keys:

```javascript
// Regular value cell
{ t: 'n', v: 83.77 }                        // number
{ t: 's', v: "Date and Time" }              // string
{ t: 'd', v: new Date(), z: 'm/d/yyyy h:mm' } // date with display format

// Formula cell — use 'f' instead of 'v', no leading = sign
{ t: 'n', f: 'AVERAGE(B2:B8641)' }
{ t: 'n', f: 'AVERAGE(B2:B8641)', z: '0.00' }  // with number format
{ t: 'n', f: 'B8642/C8642', z: '0.00%' }       // percentage format
```

> **Key distinction:** `v` = static value, `f` = formula. A cell has one or the other, not both.
> The `z` property sets the display format (same format strings as Excel).

---

### Building Cell Addresses Dynamically

SheetJS uses `"A1"` string keys on the worksheet object. Use the encode helper
rather than building strings manually — it avoids off-by-one errors:

```javascript
// XLSX.utils.encode_cell is zero-based for both row and column
// Row 1, Col A  → { r: 0, c: 0 }
// Row 2, Col B  → { r: 1, c: 1 }

const addr = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
worksheet[addr] = { t: 'n', v: 83.77 };
```

---

### Required: Set the Sheet Range

SheetJS needs to know the bounds of the sheet explicitly. Always set `!ref` after writing all cells:

```javascript
worksheet['!ref'] = XLSX.utils.encode_range({
  s: { r: 0, c: 0 },           // start: row 0, col 0 (A1)
  e: { r: lastRowIndex, c: 2 } // end: last row, col 2 (C)
});
```

---

### Setting Column Widths

```javascript
worksheet['!cols'] = [
  { wch: 22 },  // Col A width in characters
  { wch: 15 },  // Col B
  { wch: 15 },  // Col C
];
```

---

### Triggering a File Download

```javascript
XLSX.writeFile(workbook, "Bindley N2 Report November 2025.xlsx");
```

> **Note:** Calling `writeFile()` twice in a row triggers two downloads. Most browsers
> allow this but may show a "allow multiple downloads" prompt on the first use.
> Warn your coworkers so they aren't surprised.

---

### Reading a File

```javascript
const reader = new FileReader();
reader.onload = function(e) {
  const workbook = XLSX.read(e.target.result, {
    type: 'array',
    cellDates: true   // CRITICAL: parses date cells as JS Date objects
  });                 // Without this, dates come back as Excel serial numbers (e.g. 45596)
};
reader.readAsArrayBuffer(selectedFile);
```

---

## 3. Full Pseudocode

### Constants

```
DEFINE EXPECTED_SHEET_COUNT = 3

// Raw sheet index mapping
DEFINE IDX_MAIN_TANK = 0
DEFINE IDX_HP_LINE   = 1
DEFINE IDX_BINDLEY   = 2
```

---

### HTML Structure

```
LOAD SheetJS from CDN in <script> tag

CREATE page layout:
  Title heading: "Desigo Report Uploader"
  File input element (accept=".xlsx" only)
  Status/message label (hidden initially)
  "Generate Reports" button (disabled until file is selected)
```

---

### Entry Point — Page Load

```
ON page load:
  GET references to: fileInput, generateButton, statusLabel
  ADD event listener → fileInput onChange  : call EnableButton()
  ADD event listener → generateButton onClick : call RunProcessor()
  DISABLE generateButton initially
```

---

### EnableButton()

```
FUNCTION: EnableButton()

  IF fileInput has a file selected:
    ENABLE generateButton
  ELSE:
    DISABLE generateButton
```

---

### RunProcessor()

```
FUNCTION: RunProcessor()

  DISABLE generateButton        // prevent double-click during processing
  SET statusLabel = "Processing..."
  HIDE statusLabel error styles if any

  GET selectedFile from fileInput

  CREATE FileReader
  ON file loaded (onload callback):
    TRY:
      workbook = ParseRawFile(arrayBuffer)
      rawData  = ExtractData(workbook)        // also runs validation internally
      monthYear = DeriveMonthYear(rawData.bindleyList[0].timestamp)

      BuildBindleyFile(rawData, monthYear)
      BuildRichFile(rawData, monthYear)

      SET statusLabel = "Done! Both files have been downloaded."
      APPLY success styling to statusLabel

    CATCH error:
      SET statusLabel = "Error: " + error.message
      APPLY error styling to statusLabel (red text)

    FINALLY:
      RE-ENABLE generateButton

  reader.readAsArrayBuffer(selectedFile)
```

---

### ParseRawFile(arrayBuffer) → workbook

```
FUNCTION: ParseRawFile(arrayBuffer)

  USE SheetJS: XLSX.read(arrayBuffer, { type: 'array', cellDates: true })
  RETURN workbook
```

---

### ExtractData(workbook) → rawData object

```
FUNCTION: ExtractData(workbook)

  // --- Structural validation ---
  CALL ValidateWorkbook(workbook)

  // --- Process each sheet ---
  FOR sheetIndex in [IDX_MAIN_TANK, IDX_HP_LINE, IDX_BINDLEY]:

    GET worksheet = workbook.Sheets[ workbook.SheetNames[sheetIndex] ]

    CONVERT to array-of-arrays:
      rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false })

    // Find where real data starts — look for first row where col A is a Date
    SET dataStartIndex = -1
    FOR i = 0 to rows.length - 1:
      IF rows[i][0] is a valid Date object:
        SET dataStartIndex = i
        BREAK

    IF dataStartIndex === -1:
      THROW error → ValidateDataFound() handles this

    // Extract expected month/year from very first timestamp found
    IF this is the first sheet processed (IDX_MAIN_TANK):
      SET expectedMonth = rows[dataStartIndex][0].getMonth()
      SET expectedYear  = rows[dataStartIndex][0].getFullYear()

    // Read rows — stop at end of month or invalid row
    SET dataList = []
    SET trimmedCount = 0

    FOR i = dataStartIndex to rows.length - 1:
      SET row = rows[i]

      IF row[0] is not a valid Date: BREAK   // end of data
      IF row[0] is empty: BREAK

      // Month boundary check
      IF row[0].getMonth()    !== expectedMonth
      OR row[0].getFullYear() !== expectedYear:
        INCREMENT trimmedCount
        CONTINUE   // skip this row, keep scanning in case of gaps

      // Value check
      SET val = parseFloat(row[1])
      IF val is NaN:
        INCREMENT skippedRowCount
        CONTINUE   // skip bad row, log warning later

      ADD { timestamp: row[0], value: val } to dataList

    // Store results by sheet
    IF sheetIndex === IDX_MAIN_TANK: SET mainTankList = dataList
    IF sheetIndex === IDX_HP_LINE:   SET hpLineList   = dataList
    IF sheetIndex === IDX_BINDLEY:   SET bindleyList  = dataList

  // --- Data validation after all sheets read ---
  CALL ValidateDataFound(mainTankList, "Main Tank")
  CALL ValidateDataFound(hpLineList,   "HP Line")
  CALL ValidateDataFound(bindleyList,  "Bindley")
  CALL ValidateRowAlignment(bindleyList, mainTankList)

  // --- Warnings (non-fatal) ---
  IF trimmedCount > 0:
    LOG warning: trimmedCount + " rows from outside the expected month were excluded"

  IF skippedRowCount > 0:
    LOG warning: skippedRowCount + " rows were skipped due to non-numeric values"

  // Append warnings to statusLabel if any (distinct from errors)

  RETURN { mainTankList, hpLineList, bindleyList, expectedMonth, expectedYear }
```

---

### DeriveMonthYear(timestamp) → string

```
FUNCTION: DeriveMonthYear(timestamp)

  SET month = timestamp.toLocaleString('default', { month: 'long' })
  SET year  = timestamp.getFullYear().toString()
  RETURN month + " " + year
  // e.g. "November 2025"
```

---

### BuildBindleyFile(rawData, monthYear)

```
FUNCTION: BuildBindleyFile(rawData, monthYear)

  CREATE workbook:  wb = XLSX.utils.book_new()
  CREATE worksheet: ws = {}

  SET bindleyList  = rawData.bindleyList
  SET mainTankList = rawData.mainTankList
  SET dataCount    = bindleyList.length
  SET dataLastRow  = dataCount + 1   // row 1 = header, data = rows 2 to dataLastRow

  // --- Header row (row index 0 = Excel row 1) ---
  ws[ encode_cell(0,0) ] = { t:'s', v:'Date and Time' }
  ws[ encode_cell(0,1) ] = { t:'s', v:'Bindley' }
  ws[ encode_cell(0,2) ] = { t:'s', v:'Main Tank' }
  // Apply bold via xlsx-js-style if used:
  //   add  s: { font: { bold: true } }  to each header cell object

  // --- Data rows ---
  FOR i = 0 to dataCount - 1:
    SET excelRow = i + 1   // zero-based row index (row 0 is header)

    ws[ encode_cell(excelRow, 0) ] = {
      t: 'd',
      v: bindleyList[i].timestamp,
      z: 'm/d/yyyy h:mm'
    }
    ws[ encode_cell(excelRow, 1) ] = { t:'n', v: bindleyList[i].value }
    ws[ encode_cell(excelRow, 2) ] = { t:'n', v: mainTankList[i].value }

  // --- Average row ---
  // dataLastRow is the Excel row number (1-based); zero-based index = dataLastRow
  SET avgRowIndex = dataCount + 1   // zero-based

  ws[ encode_cell(avgRowIndex, 0) ] = { t:'s', v:'Average CFM' }
  ws[ encode_cell(avgRowIndex, 1) ] = { t:'n', f:`AVERAGE(B2:B${dataLastRow})`, z:'0.00' }
  ws[ encode_cell(avgRowIndex, 2) ] = { t:'n', f:`AVERAGE(C2:C${dataLastRow})`, z:'0.00' }

  // --- Bindley % of Total row ---
  SET avgExcelRow  = dataLastRow + 1   // 1-based Excel row of average
  SET pctRowIndex  = dataCount + 2     // zero-based

  ws[ encode_cell(pctRowIndex, 0) ] = { t:'s', v:'Bindley % of Total' }
  ws[ encode_cell(pctRowIndex, 1) ] = { t:'n', f:`B${avgExcelRow}/C${avgExcelRow}`, z:'0.00%' }

  // --- Sheet bounds (required) ---
  ws['!ref'] = XLSX.utils.encode_range({
    s: { r:0, c:0 },
    e: { r: pctRowIndex, c: 2 }
  })

  // --- Column widths ---
  ws['!cols'] = [ { wch:22 }, { wch:15 }, { wch:15 } ]

  // --- Add sheet and download ---
  XLSX.utils.book_append_sheet(wb, ws, monthYear)
  XLSX.writeFile(wb, "Bindley N2 Report " + monthYear + ".xlsx")
```

---

### BuildRichFile(rawData, monthYear)

```
FUNCTION: BuildRichFile(rawData, monthYear)

  CREATE workbook: wb = XLSX.utils.book_new()

  DEFINE sheetDefinitions = [
    { name: "Main Tank", dataList: rawData.mainTankList },
    { name: "HP Line",   dataList: rawData.hpLineList   },
    { name: "Bindley",   dataList: rawData.bindleyList  }
  ]

  FOR each sheetDef in sheetDefinitions:

    CREATE worksheet: ws = {}
    SET dataCount = sheetDef.dataList.length

    // Header row
    ws[ encode_cell(0,0) ] = { t:'s', v:'Date and Time' }
    ws[ encode_cell(0,1) ] = { t:'s', v: sheetDef.name }

    // Data rows
    FOR i = 0 to dataCount - 1:
      SET excelRow = i + 1
      ws[ encode_cell(excelRow, 0) ] = {
        t: 'd',
        v: sheetDef.dataList[i].timestamp,
        z: 'm/d/yyyy h:mm'
      }
      ws[ encode_cell(excelRow, 1) ] = { t:'n', v: sheetDef.dataList[i].value }

    // No average rows in Rich file

    ws['!ref'] = XLSX.utils.encode_range({
      s: { r:0, c:0 },
      e: { r: dataCount, c: 1 }
    })

    ws['!cols'] = [ { wch:22 }, { wch:15 } ]

    XLSX.utils.book_append_sheet(wb, ws, sheetDef.name)

  XLSX.writeFile(wb, "Rich N2 Report " + monthYear + ".xlsx")
```

---

## 4. Error Handling Reference

### ValidateWorkbook(workbook)

```
FUNCTION: ValidateWorkbook(workbook)

  IF workbook.SheetNames.length < EXPECTED_SHEET_COUNT:
    THROW "Invalid file: expected 3 sheets, found " + workbook.SheetNames.length
          + ". Make sure you selected the raw Desigo export file."
```

*Catches:* Wrong file selected entirely.

---

### ValidateDataFound(list, sheetLabel)

```
FUNCTION: ValidateDataFound(list, sheetLabel)

  IF list.length === 0:
    THROW "No valid data found in sheet: " + sheetLabel
          + ". The Desigo export format may have changed."
```

*Catches:* Data start row was never detected — sheet structure changed, or wrong file.

---

### ValidateRowAlignment(bindleyList, mainTankList)

```
FUNCTION: ValidateRowAlignment(list1, list2)

  IF list1.length !== list2.length:
    THROW "Row count mismatch: Bindley has " + list1.length + " rows, "
          + "Main Tank has " + list2.length + " rows. "
          + "The two sheets may cover different time ranges."
```

*Catches:* Silent data corruption — mismatched rows would pair wrong timestamps with wrong values.

---

### Month Boundary Check (inline in ExtractData)

```
// Inside the data-reading loop:
IF row[0].getMonth()    !== expectedMonth
OR row[0].getFullYear() !== expectedYear:
  INCREMENT trimmedCount
  CONTINUE
```

*Catches:* Desigo export bleeding into the next month.  
*Behavior:* Non-fatal — rows are silently excluded, count is reported as a warning.

---

### NaN Value Check (inline in ExtractData)

```
SET val = parseFloat(row[1])
IF val is NaN:
  INCREMENT skippedRowCount
  CONTINUE
```

*Catches:* Blank cells or unexpected text in the value column.  
*Behavior:* Non-fatal — rows are skipped, count is reported as a warning.

---

### Summary: Fatal vs Warning

| Check | Type | Behavior |
|---|---|---|
| Wrong sheet count | Fatal error | Stops processing, shows message |
| No data found in sheet | Fatal error | Stops processing, shows message |
| Row count mismatch | Fatal error | Stops processing, shows message |
| Rows from wrong month | Warning | Skipped silently, count shown |
| Non-numeric value in cell | Warning | Skipped silently, count shown |

---

## 5. Development Notes

### Raw File Structure

The Desigo export has 3 sheets with different header row counts — do not hardcode skip amounts.
Use Date detection instead (find the first row where col A is a `Date` object):

| Sheet Index | Contains      | Header rows before data |
|-------------|---------------|-------------------------|
| 0           | Main Tank     | 4 (extra instructions row) |
| 1           | HP Line       | 3                          |
| 2           | Bindley       | 3                          |

---

### Output File Structure

**Bindley N2 Report [Month Year].xlsx**
- 1 sheet named after the month (e.g. "November 2025")
- Columns: `Date and Time | Bindley | Main Tank`
- Source: Sheet 2 (Bindley timestamps + values) combined with Sheet 0 (Main Tank values)
- Last two rows: Average CFM formula row + Bindley % of Total formula row

**Rich N2 Report [Month Year].xlsx**
- 3 sheets: `Main Tank`, `HP Line`, `Bindley`
- Each sheet: `Date and Time | [sensor name]`
- No formula rows
- Source: one sheet per raw data sheet

---

### Styling Note

Base SheetJS (free CDN version) has **limited style support**. Number formats (`z` property)
and column widths (`!cols`) work fine. Bold headers require either:

- **xlsx-js-style** — drop-in CDN replacement, adds `s: { font: { bold: true } }` support
- **Skipping bold** — functionally the files work without it

CDN for xlsx-js-style:
```html
<script src="https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js"></script>
```

Use it as a direct replacement for the base SheetJS CDN — same API, just add the `s` style key.

---

### Two Downloads Behavior

Calling `XLSX.writeFile()` twice triggers two browser downloads back-to-back.
Browsers may show a "allow multiple downloads from this site?" prompt on first use.
This is normal — let your coworkers know to click Allow.

---

### Date Handling

Always pass `{ cellDates: true }` when calling `XLSX.read()`. Without it, Excel date
serial numbers (e.g. `45596`) are returned instead of JS Date objects, making the
data-start detection loop much harder to implement.

---

### Local Testing Without a Server

If you go the multi-file route, browsers block local JS imports (CORS policy).
Options to run locally during development:

- **VS Code Live Server extension** — right-click `index.html` → "Open with Live Server"
- **Node.js one-liner:** `npx serve .` in the project folder
- Single `.html` file avoids this entirely — no imports needed

---

## 6. Future Upgrade Path

### Adding a Specific Network Save Path

Browsers are sandboxed — JavaScript cannot write files directly to a network share or
specific folder. The current approach (browser download) is the limit of what's possible
in a plain HTML/JS app.

When this feature is needed, two options:

**Option A — Migrate to Electron**
Electron wraps the existing HTML/JS code into a desktop app with full filesystem access.
The core logic (SheetJS processing, validation, build functions) is **100% reusable** —
you would only add file-write logic and remove the `XLSX.writeFile()` download trigger.
Electron apps are distributed as `.exe` installers.

**Option B — Rewrite in C#**
C# with ClosedXML and Windows Forms gives native filesystem access, near-instant startup,
and a compiled `.exe`. The pseudocode in this document translates directly to C# — the
logic is identical, only the syntax and library API change.
Good choice if you want to build on your IN251 coursework.

---

### Potential Feature Ideas

- Drag-and-drop file input instead of Browse button
- Progress indicator for large files
- Preview table showing first few rows before generating
- Settings panel to configure output folder (once on Electron/C#)
- Version number displayed in the UI for easier support conversations

---

*Document version: 1.0 — Created by Kyle C.*
