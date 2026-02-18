import { useState } from 'react';
import type { Player } from '../lib/types';
import { createEmptyPlayer } from '../lib/types';
import { calculateSprint30mScore } from '../lib/scoring';

interface PlayerTableProps {
  players: Player[];
  onUpdatePlayers: (players: Player[]) => void;
}

// Validation rules for each field
interface ValidationRule {
  min: number;
  max: number;
  errorMessage: string;
}

const VALIDATION_RULES: Partial<Record<keyof Player, ValidationRule>> = {
  sprint30m_time: {
    min: 0.1,
    max: 99.99,
    errorMessage: 'Czas 30m: 0.1 - 99.99 s',
  },
  medicineBall_forward: {
    min: 0,
    max: 30,
    errorMessage: 'Piłka lekarska (przód): 0 - 30 m',
  },
  medicineBall_backward: {
    min: 0,
    max: 30,
    errorMessage: 'Piłka lekarska (tył): 0 - 30 m',
  },
  medicineBall_score: {
    min: 0,
    max: 80,
    errorMessage: 'Wynik: 0 - 80 pkt',
  },
  fiveJump_distance: {
    min: 0,
    max: 25,
    errorMessage: 'Pięcioskok: 0 - 25 m',
  },
  fiveJump_score: {
    min: 0,
    max: 80,
    errorMessage: 'Wynik: 0 - 80 pkt',
  },
  handThrow_distance: {
    min: 0,
    max: 60,
    errorMessage: 'Rzut ręczny: 0 - 60 m',
  },
  handThrow_score: {
    min: 0,
    max: 80,
    errorMessage: 'Wynik: 0 - 80 pkt',
  },
  envelope_time: {
    min: 0.1,
    max: 999.9,
    errorMessage: 'Czas koperty: 0.1 - 999.9 s',
  },
  envelope_score: {
    min: 0,
    max: 80,
    errorMessage: 'Wynik: 0 - 80 pkt',
  },
};

function validateField(key: keyof Player, value: number | null): string | null {
  const rule = VALIDATION_RULES[key];
  if (!rule || value === null) return null;

  if (value < rule.min || value > rule.max) {
    return rule.errorMessage;
  }
  return null;
}

const FIELD_CONFIG: {
  key: keyof Player;
  label: string;
  type: 'text' | 'number';
  readOnly?: boolean;
  maxLength?: number;
  width: string;
  id?: string;
}[] = [
  { key: 'firstName', label: 'Imię', type: 'text', maxLength: 15, width: '100px', id: 'player-name-cols' },
  { key: 'lastName', label: 'Nazwisko', type: 'text', maxLength: 15, width: '100px', id: 'player-name-cols' },
  { key: 'sprint30m_time', label: 'Czas 30m', type: 'number', width: '80px', id: 'sprint-col' },
  { key: 'sprint30m_score', label: 'Wynik 30m', type: 'number', readOnly: true, width: '80px', id: 'sprint-col' },
  { key: 'medicineBall_forward', label: 'Piłka lekarska\nprzód', type: 'number', width: '75px', id: 'medicine-ball-col' },
  { key: 'medicineBall_backward', label: 'Piłka lekarska\ntył', type: 'number', width: '75px', id: 'medicine-ball-col' },
  { key: 'medicineBall_sum', label: 'Piłka lekarska\nsuma', type: 'number', readOnly: true, width: '75px', id: 'medicine-ball-col' },
  { key: 'medicineBall_score', label: 'Wynik\npiłka lekarska', type: 'number', width: '80px', id: 'other-scores-col' },
  { key: 'fiveJump_distance', label: 'Pięcioskok\ndystans', type: 'number', width: '85px', id: 'other-scores-col' },
  { key: 'fiveJump_score', label: 'Wynik\npięcioskok', type: 'number', width: '85px', id: 'other-scores-col' },
  { key: 'handThrow_distance', label: 'Rzut ręczny\ndystans', type: 'number', width: '85px', id: 'other-scores-col' },
  { key: 'handThrow_score', label: 'Wynik\nrzut ręczny', type: 'number', width: '85px', id: 'other-scores-col' },
  { key: 'envelope_time', label: 'Czas\nkoperta', type: 'number', width: '80px', id: 'other-scores-col' },
  { key: 'envelope_score', label: 'Wynik\nkoperta', type: 'number', width: '80px', id: 'other-scores-col' },
];

// CSS styles as a string for injection
const cssStyles = `
  .input-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  .validation-tooltip {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #c53030;
    color: #fff;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    z-index: 1000;
    margin-top: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    pointer-events: none;
    animation: tooltipFadeIn 0.15s ease-out;
  }

  .validation-tooltip::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid #c53030;
  }

  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .input-invalid {
    border-color: #e53e3e !important;
    box-shadow: 0 0 0 2px rgba(229, 62, 62, 0.3) !important;
  }
`;

const styles = {
  wrapper: {
    overflowX: 'auto' as const,
    marginTop: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  th: {
    padding: '10px 6px',
    backgroundColor: '#2b6cb0',
    color: '#ffffff',
    fontWeight: 600 as const,
    textAlign: 'center' as const,
    whiteSpace: 'pre-line' as const,
    fontSize: '12px',
    borderBottom: '2px solid #2c5282',
    lineHeight: 1.3,
  },
  td: {
    padding: '4px',
    textAlign: 'center' as const,
    borderBottom: '1px solid #e2e8f0',
    verticalAlign: 'top' as const,
  },
  input: {
    width: '100%',
    padding: '6px 4px',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '13px',
    textAlign: 'center' as const,
    backgroundColor: '#ffffff',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  readOnlyInput: {
    backgroundColor: '#f7fafc',
    color: '#718096',
    border: '1px solid #edf2f7',
  },
  actionTh: {
    padding: '10px 6px',
    backgroundColor: '#2b6cb0',
    color: '#ffffff',
    fontWeight: 600 as const,
    textAlign: 'center' as const,
    width: '50px',
  },
  removeBtn: {
    padding: '4px 10px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#e53e3e',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600 as const,
  },
  addBtn: {
    marginTop: '12px',
    padding: '10px 20px',
    border: '2px dashed #a0aec0',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#4a5568',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500 as const,
    transition: 'all 0.2s',
  },
  emptyMsg: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    color: '#a0aec0',
    fontSize: '16px',
  },
  rowIndex: {
    padding: '4px 8px',
    color: '#a0aec0',
    fontSize: '12px',
    textAlign: 'center' as const,
    borderBottom: '1px solid #e2e8f0',
  },
};

export default function PlayerTable({
  players,
  onUpdatePlayers,
}: PlayerTableProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (
    playerIndex: number,
    key: keyof Player,
    value: string
  ) => {
    const inputKey = `${playerIndex}-${key}`;
    const updated = [...players];
    const player = { ...updated[playerIndex] };

    if (key === 'firstName' || key === 'lastName') {
      player[key] = value.slice(0, 15);
    } else {
      const numVal = value === '' ? null : Number(value);
      (player as Record<string, unknown>)[key] =
        numVal !== null && isNaN(numVal) ? null : numVal;

      // Validate and update error state
      if (numVal !== null && !isNaN(numVal)) {
        const error = validateField(key, numVal);
        if (error) {
          setValidationErrors(prev => ({ ...prev, [inputKey]: error }));
        } else {
          setValidationErrors(prev => {
            const updated = { ...prev };
            delete updated[inputKey];
            return updated;
          });
        }
      } else {
        // Clear error when field is empty or invalid number
        setValidationErrors(prev => {
          const updated = { ...prev };
          delete updated[inputKey];
          return updated;
        });
      }
    }

    // Auto-calculate sprint score
    if (key === 'sprint30m_time') {
      const time = value === '' ? null : Number(value);
      player.sprint30m_score =
        time !== null && !isNaN(time) ? calculateSprint30mScore(time) : null;
    }

    // Auto-calculate medicine ball sum
    if (key === 'medicineBall_forward' || key === 'medicineBall_backward') {
      const fwd = player.medicineBall_forward;
      const bwd = player.medicineBall_backward;
      player.medicineBall_sum =
        fwd !== null && bwd !== null ? fwd + bwd : null;
    }

    updated[playerIndex] = player;
    onUpdatePlayers(updated);
  };

  const handleAddPlayer = () => {
    onUpdatePlayers([...players, createEmptyPlayer()]);
  };

  const handleRemovePlayer = (index: number) => {
    const updated = players.filter((_, i) => i !== index);
    // Clear validation errors for removed player
    setValidationErrors(prev => {
      const cleared = { ...prev };
      Object.keys(cleared).forEach(key => {
        if (key.startsWith(`${index}-`)) {
          delete cleared[key];
        }
      });
      return cleared;
    });
    onUpdatePlayers(updated);
  };

  return (
    <>
      <style>{cssStyles}</style>
      <div id="player-table" style={styles.wrapper}>
        {players.length === 0 ? (
          <div style={styles.emptyMsg}>
            Brak zawodników. Kliknij "Dodaj zawodnika", aby rozpocząć.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.actionTh}>#</th>
                {FIELD_CONFIG.map((field, index) => {
                  const prevField = FIELD_CONFIG[index - 1];
                  const isFirstInGroup = !prevField || prevField.id !== field.id;
                  return (
                    <th
                      key={field.key}
                      id={isFirstInGroup && field.id ? field.id : undefined}
                      style={styles.th}
                    >
                      {field.label}
                    </th>
                  );
                })}
                <th style={styles.actionTh}>Usuń</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, pIdx) => (
                <tr
                  key={pIdx}
                  style={{
                    backgroundColor: pIdx % 2 === 0 ? '#ffffff' : '#f7fafc',
                  }}
                >
                  <td style={styles.rowIndex}>{pIdx + 1}</td>
                  {FIELD_CONFIG.map((field) => {
                    const inputKey = `${pIdx}-${field.key}`;
                    const errorMsg = validationErrors[inputKey];
                    const hasError = !!errorMsg;

                    return (
                      <td key={field.key} style={styles.td}>
                        <div className="input-wrapper">
                          <input
                            style={{
                              ...styles.input,
                              ...(field.readOnly ? styles.readOnlyInput : {}),
                              width: field.width,
                            }}
                            type={field.type}
                            value={player[field.key] ?? ''}
                            readOnly={field.readOnly}
                            maxLength={field.maxLength}
                            step={field.type === 'number' ? 'any' : undefined}
                            onChange={(e) =>
                              handleFieldChange(pIdx, field.key, e.target.value)
                            }
                            className={hasError ? 'input-invalid' : undefined}
                          />
                          {hasError && (
                            <span className="validation-tooltip">
                              {errorMsg}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td style={styles.td}>
                    <button
                      style={styles.removeBtn}
                      onClick={() => handleRemovePlayer(pIdx)}
                      title="Usuń zawodnika"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button id="add-player-btn" style={styles.addBtn} onClick={handleAddPlayer}>
          + Dodaj zawodnika
        </button>
      </div>
    </>
  );
}
