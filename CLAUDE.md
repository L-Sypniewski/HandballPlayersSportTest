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
- **Key Dependencies**: ExcelJS (Excel file handling), file-saver

#### Source Structure
```
web-app/src/
├── components/       # React components
│   ├── App.tsx       # Main app container with state management
│   ├── FileControls.tsx  # Upload/download/new file buttons
│   ├── GroupTabs.tsx     # Tab system for multiple groups
│   └── PlayerTable.tsx   # Editable player data table
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
- **Medicine Ball**: `medicineBall_forward`, `medicineBall_backward` → `medicineBall_sum` (auto) → `medicineBall_score`
- **Five-Jump**: `fiveJump_distance` → `fiveJump_score`
- **Hand Throw**: `handThrow_distance` → `handThrow_score`
- **Envelope**: `envelope_time` → `envelope_score`

Each Excel sheet becomes a `Group` with its own `players` array.

#### Pages
- `/` - Main app with player data management
- `/punktacja` - Scoring tables reference page

#### Auto-Calculations
- **30m Sprint score**: Auto-calculated via `calculateSprint30mScore()` in `scoring.ts`
- **Medicine Ball sum**: Auto-calculated (forward + backward)
- **All other scores**: Manually entered (no scoring functions implemented yet)

## Scoring Logic

Scoring tables are based on **Test sprawności ukierunkowanej – J. Noszczaka**. The `/punktacja` page displays all scoring tables.

**Only 30m sprint scoring is implemented** in both the Delphi app (`UnitLiczPunkty.pas`) and web app (`scoring.ts`). The scoring table:
- ≤3.70s → 80 points (max)
- Time ranges have different step sizes (0.02s, 0.04s, 0.05s, 0.10s)
- >5.90s → 0 points

**Available scoring tables (in PDF `Test-sprawności-fizycznej-piłka-ręczna.pdf`):**
- 30m Sprint ✓ (implemented)
- Medicine Ball 2kg throw (sum) - manual entry
- Five-Jump (distance) - manual entry
- 300m Shuttle Run - not implemented (app uses "Envelope/Koperta" test instead)

**No scoring tables available for:**
- Hand Throw (Rzut ręczny)
- Envelope test (Koperta)
