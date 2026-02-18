# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Handball Players Sport Test - a program for managing and scoring sport test results for handball players. The project contains two implementations:

1. **Legacy Delphi Application** - Windows desktop app (original implementation)
2. **Web Application** (`web-app/`) - Modern Astro + React implementation

## Web App Commands

```bash
cd web-app
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture

### Delphi Application (Legacy)
- `TSF.dpr` - Main project file
- `Unit1.pas` - Main form with player data entry and file operations
- `UnitLiczPunkty.pas` - Scoring calculation functions (30m sprint)
- `UnitOperacjeNaPlikach.pas` - File operations
- Uses typed files (`File of TZawodnik`) for binary data storage

### Web Application (`web-app/`)
- **Framework**: Astro 5.x with React 19 integration, static output
- **Key Dependencies**: ExcelJS (Excel file handling), driver.js (product tour)

#### Source Structure
```
web-app/src/
├── components/       # React components
│   ├── App.tsx       # Main app container with state management
│   ├── FileControls.tsx  # Upload/download/new file buttons
│   ├── GroupTabs.tsx     # Tab system for multiple groups
│   ├── PlayerTable.tsx   # Editable player data table
│   └── TourGuide.tsx     # Product tour using driver.js
├── lib/
│   ├── types.ts      # Player and Group TypeScript interfaces
│   ├── scoring.ts    # Score calculation functions
│   └── excel.ts      # Excel file read/write (ExcelJS)
├── pages/
│   └── index.astro   # Entry page
└── layouts/
    └── Layout.astro  # HTML wrapper
```

#### Data Model
The `Player` interface tracks 5 test categories:
- **30m Sprint**: `sprint30m_time` → `sprint30m_score` (auto-calculated)
- **Medicine Ball**: `medicineBall_forward`, `medicineBall_backward` → `medicineBall_sum` (auto) → `medicineBall_score` (auto-calculated)
- **Five-Jump**: `fiveJump_distance` → `fiveJump_score` (auto-calculated)
- **Hand Throw**: `handThrow_distance` → `handThrow_score` (manual entry)
- **Envelope**: `envelope_time` → `envelope_score` (manual entry)

Each Excel sheet becomes a `Group` with its own `players` array.

#### Pages
- `/` - Main app with player data management
- `/punktacja` - Scoring tables reference page

#### Auto-Calculations
- **30m Sprint score**: Auto-calculated via `calculateSprint30mScore()` in `scoring.ts`
- **Medicine Ball sum**: Auto-calculated (forward + backward)
- **Medicine Ball score**: Auto-calculated via `calculateMedicineBallScore()` in `scoring.ts`
- **Five-Jump score**: Auto-calculated via `calculateFiveJumpScore()` in `scoring.ts`
- **Hand Throw & Envelope scores**: Manually entered (no scoring tables available)

#### Product Tour
The app includes an interactive product tour using **driver.js**:
- **Auto-starts** for first-time users (checks `localStorage` for `handball-tour-completed`)
- **Help button** ("❓ Pomoc") in header to restart the tour
- **13 steps** covering: file controls, group tabs, player table, auto-calculations, scoring link
- **Polish UI text**: "Dalej", "Wstecz", "Gotowe", "Krok X z Y"
- Tour state persisted in localStorage

## Scoring Logic

Scoring tables are based on **Test sprawności ukierunkowanej – J. Noszczaka**. The `/punktacja` page displays all scoring tables.

### Implemented Scoring Functions

**30m Sprint** (`calculateSprint30mScore`):
- ≤3.70s → 80 points (max)
- Time ranges have different step sizes (0.02s, 0.04s, 0.05s, 0.10s)
- >5.90s → 0 points

**Medicine Ball 2kg** (`calculateMedicineBallScore`) - based on sum of forward + backward throws:
- ≥30.00m → 80 points (max)
- Distance ranges have different step sizes (0.20m, 0.50m)
- <14.50m → 0 points

**Five-Jump** (`calculateFiveJumpScore`) - based on total distance:
- ≥13.50m → 80 points (max)
- Distance ranges have different step sizes (0.05m, 0.10m, 0.20m)
- <7.80m → 0 points

### No Scoring Tables Available
- Hand Throw (Rzut ręczny) - manual entry only
- Envelope test (Koperta) - manual entry only
