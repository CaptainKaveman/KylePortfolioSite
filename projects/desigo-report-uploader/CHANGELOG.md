# Changelog

All notable changes to the Desigo Report Uploader are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [2.1.0] - 2026-08-25

### Fixed
- Data rows in the output files (Bindley, Main Tank, HP Line columns) were
  displayed in full unrounded precision instead of two decimal places. Only
  the summary "Average CFM" row had `0.00` formatting applied. Added the
  same number format to every per-row value cell in `build-bindley.js` and
  `build-rich.js`.
- Timestamps in the output files were shifted by a fixed hour offset from
  the raw data, causing the report to appear to start late and bleed into
  the next month at the tail end. Root cause: writing a JS `Date` object
  directly into an xlsx cell round-trips through SheetJS's internal
  timezone/DST offset comparison, which can introduce a shift when the
  report month's DST status differs from whenever the page happened to
  load. Fix: convert dates to a raw Excel serial number using only local
  calendar fields (never `getTime()`/`getTimezoneOffset()`) before writing.

### Added
- (planned) Centered column alignment and thick borders on the summary
  rows, ported from the manually-styled July reference file.

### Changed
- (planned) Swap the write side (`build-bindley.js`, `build-rich.js`) from
  SheetJS to ExcelJS to support cell styling (alignment, borders) on
  output, since SheetJS's community build does not write cell styles.
  Read side (`file-reader.js`, `validators.js`) is unaffected.

---

## Template for future entries

## [X.Y.Z] - YYYY-MM-DD
### Added
- New features.
### Changed
- Changes to existing behavior.
### Fixed
- Bug fixes.
### Removed
- Removed features or files.