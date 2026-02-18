import { useState, useMemo, useRef, useEffect } from 'react';
import { HotTable } from '@handsontable/react-wrapper';
import { Box, Button, useMediaQuery } from '@mui/material';
import { registerAllModules } from 'handsontable/registry';
import type { Player } from '../lib/types';
import { createEmptyPlayer } from '../lib/types';
import { calculateSprint30mScore, calculateMedicineBallScore, calculateFiveJumpScore } from '../lib/scoring';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';

registerAllModules();

interface PlayerTableProps {
  players: Player[];
  onUpdatePlayers: (players: Player[]) => void;
  resetScrollKey?: number | string;
}

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

const EDITABLE_FIELDS: Array<keyof Player> = [
  'firstName',
  'lastName',
  'sprint30m_time',
  'medicineBall_forward',
  'medicineBall_backward',
  'fiveJump_distance',
  'handThrow_distance',
  'handThrow_score',
  'envelope_time',
  'envelope_score',
];

const NUMBER_FIELDS = new Set<keyof Player>([
  'sprint30m_time',
  'medicineBall_forward',
  'medicineBall_backward',
  'fiveJump_distance',
  'handThrow_distance',
  'handThrow_score',
  'envelope_time',
  'envelope_score',
]);

export default function PlayerTableMRT({ players, onUpdatePlayers, resetScrollKey }: PlayerTableProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    const holder = tableContainerRef.current?.querySelector<HTMLElement>('.wtHolder');
    if (holder) {
      holder.scrollLeft = 0;
    }
  }, [resetScrollKey]);

  const isPlayerValid = (player: Player): boolean => {
    const hasValidFirstName = player.firstName.trim().length > 0;
    const hasValidLastName = player.lastName.trim().length > 0;
    return hasValidFirstName && hasValidLastName;
  };

  const handleAddPlayer = () => {
    const invalidPlayerIndex = players.findIndex((p) => !isPlayerValid(p));
    if (invalidPlayerIndex !== -1) {
      setValidationErrors((prev) => ({
        ...prev,
        [`${invalidPlayerIndex}-firstName`]: players[invalidPlayerIndex].firstName.trim() === '' ? 'Imię jest wymagane' : '',
        [`${invalidPlayerIndex}-lastName`]: players[invalidPlayerIndex].lastName.trim() === '' ? 'Nazwisko jest wymagane' : '',
      }));
      return;
    }
    onUpdatePlayers([...players, createEmptyPlayer()]);
  };

  const handleAfterChange = (changes: [number, string | number, unknown, unknown][] | null, source: string) => {
    if (!changes || source === 'loadData') return;

    const updated = [...players];
    let hasChanges = false;

    for (const [rowIndex, prop, , newValue] of changes) {
      if (typeof prop !== 'string' || rowIndex < 0 || rowIndex >= updated.length) continue;
      if (!EDITABLE_FIELDS.includes(prop as keyof Player)) continue;

      const player = { ...updated[rowIndex] };
      const key = prop as keyof Player;
      const inputKey = `${rowIndex}-${key}`;

      if (key === 'firstName' || key === 'lastName') {
        const strValue = String(newValue ?? '').slice(0, 15);
        player[key] = strValue;
        if (strValue.trim() === '') {
          setValidationErrors((prev) => ({ ...prev, [inputKey]: key === 'firstName' ? 'Imię jest wymagane' : 'Nazwisko jest wymagane' }));
        } else {
          setValidationErrors((prev) => {
            const next = { ...prev };
            delete next[inputKey];
            return next;
          });
        }
      } else if (NUMBER_FIELDS.has(key)) {
        const strValue = String(newValue ?? '').trim();
        if (strValue === '') {
          (player as Record<string, unknown>)[key] = null;
          setValidationErrors((prev) => {
            const next = { ...prev };
            delete next[inputKey];
            return next;
          });
        } else {
          const numVal = Number(strValue);
          if (Number.isNaN(numVal)) {
            setValidationErrors((prev) => ({ ...prev, [inputKey]: 'Wymagana liczba' }));
            continue;
          }

          (player as Record<string, unknown>)[key] = numVal;

          const rule = VALIDATION_RULES[key];
          if (rule && (numVal < rule.min || numVal > rule.max)) {
            setValidationErrors((prev) => ({ ...prev, [inputKey]: rule.message }));
          } else {
            setValidationErrors((prev) => {
              const next = { ...prev };
              delete next[inputKey];
              return next;
            });
          }
        }
      }

      if (key === 'sprint30m_time' && player.sprint30m_time !== null) {
        player.sprint30m_score = calculateSprint30mScore(player.sprint30m_time);
      }

      if (key === 'medicineBall_forward' || key === 'medicineBall_backward') {
        const fwd = player.medicineBall_forward;
        const bwd = player.medicineBall_backward;
        player.medicineBall_sum = fwd !== null && bwd !== null ? fwd + bwd : null;
        player.medicineBall_score = player.medicineBall_sum !== null ? calculateMedicineBallScore(player.medicineBall_sum) : null;
      }

      if (key === 'fiveJump_distance' && player.fiveJump_distance !== null) {
        player.fiveJump_score = calculateFiveJumpScore(player.fiveJump_distance);
      }

      updated[rowIndex] = player;
      hasChanges = true;
    }

    if (hasChanges) {
      onUpdatePlayers(updated);
    }
  };

  const handleAfterRemoveRow = (index: number, amount: number) => {
    if (amount <= 0) return;
    const updated = [...players];
    updated.splice(index, amount);
    onUpdatePlayers(updated);
  };

  const tableData = useMemo(
    () => players.map((player, index) => ({ ...player, rowNumber: index + 1 })),
    [players]
  );

  return (
    <Box id="player-table-mrt" sx={{ width: '100%', mt: 1.5, bgcolor: '#fff', borderRadius: 1, boxShadow: 1, p: 2 }}>
      <div ref={tableContainerRef}>
        <HotTable
          data={tableData}
          columns={[
            { data: 'rowNumber', readOnly: true },
            { data: 'firstName' },
            { data: 'lastName' },
            { data: 'sprint30m_time', type: 'numeric', numericFormat: { pattern: '0.00' } },
            { data: 'sprint30m_score', readOnly: true },
            { data: 'medicineBall_forward', type: 'numeric', numericFormat: { pattern: '0.00' } },
            { data: 'medicineBall_backward', type: 'numeric', numericFormat: { pattern: '0.00' } },
            { data: 'medicineBall_sum', readOnly: true, type: 'numeric', numericFormat: { pattern: '0.00' } },
            { data: 'medicineBall_score', readOnly: true },
            { data: 'fiveJump_distance', type: 'numeric', numericFormat: { pattern: '0.00' } },
            { data: 'fiveJump_score', readOnly: true },
            { data: 'handThrow_distance', type: 'numeric', numericFormat: { pattern: '0.00' } },
            { data: 'handThrow_score', type: 'numeric' },
            { data: 'envelope_time', type: 'numeric', numericFormat: { pattern: '0.00' } },
            { data: 'envelope_score', type: 'numeric' },
          ]}
          colHeaders={[
            '#',
            'Imię',
            'Nazwisko',
            'Czas 30m',
            'Wynik 30m',
            'Lekarska przód',
            'Lekarska tył',
            'Lekarska suma',
            'Wynik Lekarska',
            'Pięcioskok dystans',
            'Wynik pięcioskok',
            'Rzut ręczny dystans',
            'Wynik rzut ręczny',
            'Czas koperta',
            'Wynik koperta',
          ]}
          width="100%"
          height={isMobile ? 460 : 600}
          rowHeaders={!isMobile}
          stretchH={isMobile ? 'none' : 'all'}
          autoWrapRow={true}
          autoWrapCol={true}
          manualColumnResize={!isMobile}
          colWidths={isMobile ? [40, 120, 120, 95, 85, 110, 110, 110, 110, 115, 110, 120, 120, 105, 105] : undefined}
          contextMenu={['remove_row']}
          licenseKey="non-commercial-and-evaluation"
          afterChange={handleAfterChange}
          afterRemoveRow={handleAfterRemoveRow}
        />
      </div>
      {isMobile && (
        <Box sx={{ mt: 1, color: '#4a5568', fontSize: '12px' }}>
          Wskazówka: przesuń tabelę poziomo, aby zobaczyć wszystkie kolumny.
        </Box>
      )}

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
      {Object.keys(validationErrors).length > 0 && (
        <Box sx={{ mt: 1, color: '#c53030', fontSize: '12px' }}>Popraw błędy walidacji przed dodaniem kolejnego zawodnika.</Box>
      )}
    </Box>
  );
}
