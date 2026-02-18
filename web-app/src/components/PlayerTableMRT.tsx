import { useState, useMemo } from 'react';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import type { Player } from '../lib/types';
import { createEmptyPlayer } from '../lib/types';
import { calculateSprint30mScore, calculateMedicineBallScore, calculateFiveJumpScore } from '../lib/scoring';

interface PlayerTableProps {
  players: Player[];
  onUpdatePlayers: (players: Player[]) => void;
}

// Validation rules
const VALIDATION_RULES: Record<string, { min: number; max: number; message: string }> = {
  sprint30m_time: { min: 0.1, max: 99.99, message: 'Czas 30m: 0.1 - 99.99 s' },
  medicineBall_forward: { min: 0, max: 30, message: 'Lekarska (przód): 0 - 30 m' },
  medicineBall_backward: { min: 0, max: 30, message: 'Lekarska (tył): 0 - 30 m' },
  fiveJump_distance: { min: 0, max: 25, message: 'Pięcioskok: 0 - 25 m' },
  handThrow_distance: { min: 0, max: 60, message: 'Rzut ręczny: 0 - 60 m' },
  handThrow_score: { min: 0, max: 80, message: 'Wynik: 0 - 80 pkt' },
  envelope_time: { min: 0.1, max: 999.9, message: 'Czas koperty: 0.1 - 999.9 s' },
  envelope_score: { min: 0, max: 80, message: 'Wynik: 0 - 80 pkt' },
};

type PlayerWithRowNumber = Player & { rowNumber: number };

export default function PlayerTableMRT({ players, onUpdatePlayers }: PlayerTableProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<number | null>(null);

  const handleAddPlayer = () => {
    onUpdatePlayers([...players, createEmptyPlayer()]);
  };

  const handleDeleteClick = (rowIndex: number) => {
    setPlayerToDelete(rowIndex);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (playerToDelete !== null) {
      onUpdatePlayers(players.filter((_, i) => i !== playerToDelete));
    }
    setDeleteDialogOpen(false);
    setPlayerToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPlayerToDelete(null);
  };

  const handleCellValueChange = (rowIndex: number, key: keyof Player, value: unknown) => {
    const updated = [...players];
    const player = { ...updated[rowIndex] };
    const inputKey = `${rowIndex}-${key}`;

    if (key === 'firstName' || key === 'lastName') {
      player[key] = (value as string).slice(0, 15);
    } else {
      const strValue = String(value || '').trim();
      if (strValue === '') {
        (player as Record<string, unknown>)[key] = null;
        setValidationErrors(prev => {
          const next = { ...prev };
          delete next[inputKey];
          return next;
        });
      } else {
        const numVal = Number(strValue);
        if (isNaN(numVal)) {
          setValidationErrors(prev => ({ ...prev, [inputKey]: 'Wymagana liczba' }));
          return;
        }
        (player as Record<string, unknown>)[key] = numVal;

        const rule = VALIDATION_RULES[key];
        if (rule && (numVal < rule.min || numVal > rule.max)) {
          setValidationErrors(prev => ({ ...prev, [inputKey]: rule.message }));
        } else {
          setValidationErrors(prev => {
            const next = { ...prev };
            delete next[inputKey];
            return next;
          });
        }
      }
    }

    // Auto-calculate sprint30m_score
    if (key === 'sprint30m_time' && player.sprint30m_time !== null) {
      player.sprint30m_score = calculateSprint30mScore(player.sprint30m_time);
    }

    // Auto-calculate medicineBall_sum and medicineBall_score
    if (key === 'medicineBall_forward' || key === 'medicineBall_backward') {
      const fwd = player.medicineBall_forward;
      const bwd = player.medicineBall_backward;
      player.medicineBall_sum = fwd !== null && bwd !== null ? fwd + bwd : null;
      player.medicineBall_score = player.medicineBall_sum !== null ? calculateMedicineBallScore(player.medicineBall_sum) : null;
    }

    // Auto-calculate fiveJump_score
    if (key === 'fiveJump_distance' && player.fiveJump_distance !== null) {
      player.fiveJump_score = calculateFiveJumpScore(player.fiveJump_distance);
    }

    updated[rowIndex] = player;
    onUpdatePlayers(updated);
  };

  const columns = useMemo<MRT_ColumnDef<PlayerWithRowNumber>[]>(
    () => [
      { accessorKey: 'rowNumber', header: '#', size: 50, enableEditing: false },
      { accessorKey: 'firstName', header: 'Imię', size: 100 },
      { accessorKey: 'lastName', header: 'Nazwisko', size: 100 },
      { accessorKey: 'sprint30m_time', header: 'Czas 30m', size: 80 },
      { accessorKey: 'sprint30m_score', header: 'Wynik 30m', size: 80, enableEditing: false },
      { accessorKey: 'medicineBall_forward', header: 'Lekarska przód', size: 100 },
      { accessorKey: 'medicineBall_backward', header: 'Lekarska tył', size: 100 },
      { accessorKey: 'medicineBall_sum', header: 'Lekarska suma', size: 100, enableEditing: false },
      { accessorKey: 'medicineBall_score', header: 'Wynik Lekarska', size: 100, enableEditing: false },
      { accessorKey: 'fiveJump_distance', header: 'Pięcioskok dystans', size: 100 },
      { accessorKey: 'fiveJump_score', header: 'Wynik pięcioskok', size: 100, enableEditing: false },
      { accessorKey: 'handThrow_distance', header: 'Rzut ręczny dystans', size: 100 },
      { accessorKey: 'handThrow_score', header: 'Wynik rzut ręczny', size: 100 },
      { accessorKey: 'envelope_time', header: 'Czas koperta', size: 80 },
      { accessorKey: 'envelope_score', header: 'Wynik koperta', size: 80 },
    ],
    []
  );

  const tableData = useMemo<PlayerWithRowNumber[]>(
    () => players.map((player, index) => ({ ...player, rowNumber: index + 1 })),
    [players]
  );

  return (
    <Box id="player-table-mrt" sx={{ width: '100%', mt: 1.5, bgcolor: '#fff', borderRadius: 1, boxShadow: 1, p: 2 }}>
      <MaterialReactTable
        columns={columns}
        data={tableData}
        enableEditing={true}
        editDisplayMode="cell"
        enableRowActions={true}
        positionActionsColumn="last"
        renderRowActions={({ row }) => (
          <Button color="error" size="small" onClick={() => handleDeleteClick(row.index)}>
            Usuń
          </Button>
        )}
        muiEditTextFieldProps={({ cell }) => ({
          onBlur: (event) => {
            const key = cell.column.id;
            if (key !== 'rowNumber') {
              handleCellValueChange(cell.row.index, key as keyof Player, event.target.value);
            }
          },
        })}
        muiTableContainerProps={{
          sx: { maxHeight: '600px' },
        }}
        muiTableHeadCellProps={({ column }) => {
          const colId = column.columnDef.id;
          // Color groups for related columns
          const groupColors: Record<string, string> = {
            // Player info (pinned) - darker blue
            rowNumber: '#1a365d',
            firstName: '#1a365d',
            lastName: '#1a365d',
            // Sprint - teal
            sprint30m_time: '#2c7a7b',
            sprint30m_score: '#2c7a7b',
            // Medicine ball - purple
            medicineBall_forward: '#6b46c1',
            medicineBall_backward: '#6b46c1',
            medicineBall_sum: '#6b46c1',
            medicineBall_score: '#6b46c1',
            // Five-jump - orange
            fiveJump_distance: '#c05621',
            fiveJump_score: '#c05621',
            // Hand throw - green
            handThrow_distance: '#276749',
            handThrow_score: '#276749',
            // Envelope - red
            envelope_time: '#c53030',
            envelope_score: '#c53030',
          };
          return {
            id: colId,
            sx: {
              backgroundColor: groupColors[colId] || '#2b6cb0',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '12px',
              padding: '10px 6px',
              textAlign: 'center',
              borderBottom: `2px solid ${groupColors[colId] || '#2c5282'}`,
              boxShadow: column.getIsPinned() ? '2px 0 4px rgba(0,0,0,0.2)' : 'none',
              '& .MuiBadge-root, & .MuiIconButton-root, & svg': {
                color: '#ffffff !important',
              },
              '& button': {
                color: '#ffffff !important',
              },
            },
          };
        }}
        muiColumnActionsButtonProps={{
          sx: {
            color: '#ffffff !important',
            opacity: 1,
            '&:hover': { color: '#e2e8f0 !important', opacity: 0.9 },
            '& svg': { color: '#ffffff !important' },
          },
        }}
        muiTableBodyRowProps={({ row }) => ({
          sx: {
            backgroundColor: row.index % 2 === 0 ? '#ffffff' : '#f7fafc',
          },
        })}
        muiTableBodyCellProps={({ cell, column }) => {
          const isEditable = column.columnDef.enableEditing !== false;
          const isPinned = column.getIsPinned();
          return {
            sx: {
              fontSize: '13px',
              padding: '4px',
              textAlign: 'center',
              borderBottom: '1px solid #e2e8f0',
              // Read-only cells: gray background
              backgroundColor: !isEditable ? '#f0f4f8' : 'inherit',
              // Editable cells: cursor pointer + light hover + subtle border
              cursor: isEditable ? 'pointer' : 'default',
              borderRight: isEditable ? '1px solid #e2e8f0' : 'none',
              '&:hover': isEditable ? { backgroundColor: '#edf2f7' } : {},
              // Pinned cells: ensure sticky background matches row
              ...(isPinned && { backgroundColor: cell.row.index % 2 === 0 ? '#fff' : '#f7fafc' }),
            },
          };
        }}
        muiBottomToolbarProps={{
          sx: { display: 'none' },
        }}
        muiTopToolbarProps={{
          sx: { display: 'none' },
        }}
        initialState={{
          columnPinning: { left: ['rowNumber', 'firstName', 'lastName'] },
        }}
        state={{ columnPinning: { left: ['rowNumber', 'firstName', 'lastName'] } }}
        localization={{
          language: 'pl',
          actions: 'Akcje',
          noRecordsToDisplay: 'Brak zawodników. Kliknij "Dodaj zawodnika", aby rozpocząć.',
          noResultsFound: 'Brak wyników do wyświetlenia',
          cancel: 'Anuluj',
          clearFilter: 'Wyczyść filtr',
          clearSearch: 'Wyczyść wyszukiwanie',
          clearSelection: 'Wyczyść zaznaczenie',
          clearSort: 'Wyczyść sortowanie',
          clickToCopy: 'Kliknij, aby skopiować',
          collapse: 'Zwiń',
          collapseAll: 'Zwiń wszystkie',
          columnActions: 'Akcje kolumny',
          copiedToClipboard: 'Skopiowano do schowka',
          copy: 'Kopiuj',
          dropToGroupBy: 'Upuść, aby grupować po {column}',
          edit: 'Edytuj',
          expand: 'Rozwiń',
          expandAll: 'Rozwiń wszystkie',
          filterArrIncludes: 'Zawiera',
          filterArrIncludesAll: 'Zawiera wszystkie',
          filterArrIncludesSome: 'Zawiera niektóre',
          filterBetween: 'Między',
          filterBetweenInclusive: 'Między (włącznie)',
          filterByColumn: 'Filtruj według {column}',
          filterContains: 'Zawiera',
          filterEmpty: 'Puste',
          filterEndsWith: 'Kończy się na',
          filterEquals: 'Równe',
          filterEqualsString: 'Równe',
          filterFuzzy: 'Rozmyte',
          filterGreaterThan: 'Większe niż',
          filterGreaterThanOrEqualTo: 'Większe lub równe',
          filterInNumberRange: 'W zakresie',
          filterIncludesString: 'Zawiera',
          filterIncludesStringSensitive: 'Zawiera (uwzględniając wielkość liter)',
          filterLessThan: 'Mniejsze niż',
          filterLessThanOrEqualTo: 'Mniejsze lub równe',
          filterMode: 'Tryb filtrowania',
          filterNotEmpty: 'Nie puste',
          filterNotEquals: 'Nie równe',
          filterStartsWith: 'Zaczyna się od',
          filterWeakEquals: 'W przybliżeniu równe',
          filteringByColumn: 'Filtrowanie według {column}',
          goToFirstPage: 'Przejdź do pierwszej strony',
          goToLastPage: 'Przejdź do ostatniej strony',
          goToNextPage: 'Przejdź do następnej strony',
          goToPreviousPage: 'Przejdź do poprzedniej strony',
          grab: 'Chwyć',
          groupByColumn: 'Grupuj według {column}',
          groupedBy: 'Grupowane według',
          hideAll: 'Ukryj wszystkie',
          hideColumn: 'Ukryj kolumnę {column}',
          max: 'Max',
          min: 'Min',
          move: 'Przenieś',
          of: 'z',
          or: 'lub',
          pin: 'Przypnij',
          pinToLeft: 'Przypnij do lewej',
          pinToRight: 'Przypnij do prawej',
          resetColumnSize: 'Resetuj rozmiar kolumny',
          resetOrder: 'Resetuj kolejność',
          rowActions: 'Akcje wiersza',
          rowNumber: '#{row}',
          rowNumbers: 'Numery wierszy',
          rowsPerPage: 'Wierszy na stronę',
          save: 'Zapisz',
          search: 'Szukaj',
          selectedCountOfRowCountRowsSelected: 'Wybrano {selectedCount} z {rowCount} wierszy',
          select: 'Wybierz',
          showAll: 'Pokaż wszystkie',
          showAllColumns: 'Pokaż wszystkie kolumny',
          showHideColumns: 'Pokaż/ukryj kolumny',
          showHideFilters: 'Pokaż/ukryj filtry',
          showHideSearch: 'Pokaż/ukryj wyszukiwanie',
          sortByColumnAsc: 'Sortuj według {column} rosnąco',
          sortByColumnDesc: 'Sortuj według {column} malejąco',
          sortedByColumnAsc: 'Posortowano według {column} rosnąco',
          sortedByColumnDesc: 'Posortowano według {column} malejąco',
          thenBy: 'następnie według',
          toggleDensity: 'Przełącz gęstość',
          toggleFullScreen: 'Przełącz pełny ekran',
          toggleSelectAll: 'Zaznacz/odznacz wszystko',
          toggleSelectRow: 'Zaznacz/odznacz wiersz',
          toggleVisibility: 'Przełącz widoczność',
          ungroupByColumn: 'Rozgrupuj według {column}',
          unpin: 'Odepnij',
          unpinAll: 'Odepnij wszystkie',
          and: 'i',
          changeFilterMode: 'Zmień tryb filtrowania',
          changeSearchMode: 'Zmień tryb wyszukiwania',
        }}
      />
      <Button
        id="add-player-btn"
        variant="outlined"
        onClick={handleAddPlayer}
        sx={{
          mt: 1.5,
          py: 1.25,
          px: 2.5,
          border: '2px dashed #a0aec0',
          color: '#4a5568',
          fontSize: '14px',
          fontWeight: 500,
          '&:hover': {
            borderColor: '#718096',
            color: '#2d3748',
            backgroundColor: 'transparent',
          },
        }}
      >
        + Dodaj zawodnika
      </Button>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Potwierdź usunięcie</DialogTitle>
        <DialogContent>
          <Typography>
            Czy na pewno chcesz usunąć tego zawodnika?
            {playerToDelete !== null && players[playerToDelete] && (
              <><br /><strong>{players[playerToDelete].firstName} {players[playerToDelete].lastName}</strong></>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Anuluj
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Usuń
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
