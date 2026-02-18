import { useState } from 'react';
import type { Player } from '../lib/types';
import { createEmptyPlayer } from '../lib/types';
import { calculateSprint30mScore } from '../lib/scoring';
import styles from './PlayerTable.module.css';

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

const INVALID_FORMAT_MESSAGE = 'Wymagana liczba';

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
  section?: 'sprint' | 'medicineBall' | 'other';
}[] = [
  { key: 'firstName', label: 'Imię', type: 'text', maxLength: 15, width: '100px', id: 'player-name-cols' },
  { key: 'lastName', label: 'Nazwisko', type: 'text', maxLength: 15, width: '100px', id: 'player-name-cols' },
  { key: 'sprint30m_time', label: 'Czas 30m', type: 'number', width: '80px', id: 'sprint-col', section: 'sprint' },
  { key: 'sprint30m_score', label: 'Wynik 30m', type: 'number', readOnly: true, width: '80px', id: 'sprint-col', section: 'sprint' },
  { key: 'medicineBall_forward', label: 'Piłka lekarska\nprzód', type: 'number', width: '75px', id: 'medicine-ball-col', section: 'medicineBall' },
  { key: 'medicineBall_backward', label: 'Piłka lekarska\ntył', type: 'number', width: '75px', id: 'medicine-ball-col', section: 'medicineBall' },
  { key: 'medicineBall_sum', label: 'Piłka lekarska\nsuma', type: 'number', readOnly: true, width: '75px', id: 'medicine-ball-col', section: 'medicineBall' },
  { key: 'medicineBall_score', label: 'Wynik\npiłka lekarska', type: 'number', width: '80px', id: 'other-scores-col', section: 'medicineBall' },
  { key: 'fiveJump_distance', label: 'Pięcioskok\ndystans', type: 'number', width: '85px', id: 'other-scores-col', section: 'other' },
  { key: 'fiveJump_score', label: 'Wynik\npięcioskok', type: 'number', width: '85px', id: 'other-scores-col', section: 'other' },
  { key: 'handThrow_distance', label: 'Rzut ręczny\ndystans', type: 'number', width: '85px', id: 'other-scores-col', section: 'other' },
  { key: 'handThrow_score', label: 'Wynik\nrzut ręczny', type: 'number', width: '85px', id: 'other-scores-col', section: 'other' },
  { key: 'envelope_time', label: 'Czas\nkoperta', type: 'number', width: '80px', id: 'other-scores-col', section: 'other' },
  { key: 'envelope_score', label: 'Wynik\nkoperta', type: 'number', width: '80px', id: 'other-scores-col', section: 'other' },
];

// CSS styles for validation tooltips (injected once)
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
      // For numeric fields, validate the raw string input first
      const trimmedValue = value.trim();

      if (trimmedValue === '') {
        // Empty or whitespace-only - clear value and error
        (player as Record<string, unknown>)[key] = null;
        setValidationErrors(prev => {
          const updated = { ...prev };
          delete updated[inputKey];
          return updated;
        });
      } else {
        const numVal = Number(trimmedValue);

        if (isNaN(numVal)) {
          // Non-numeric input (letters, symbols) - show format error
          (player as Record<string, unknown>)[key] = null;
          setValidationErrors(prev => ({ ...prev, [inputKey]: INVALID_FORMAT_MESSAGE }));
        } else {
          // Valid number - check range
          (player as Record<string, unknown>)[key] = numVal;
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
        }
      }
    }

    // Auto-calculate sprint score
    if (key === 'sprint30m_time') {
      const time = player.sprint30m_time;
      player.sprint30m_score =
        time !== null ? calculateSprint30mScore(time) : null;
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

  // Render input with validation tooltip
  const renderInput = (playerIndex: number, field: typeof FIELD_CONFIG[0]) => {
    const inputKey = `${playerIndex}-${field.key}`;
    const errorMsg = validationErrors[inputKey];
    const hasError = !!errorMsg;

    return (
      <div className="input-wrapper">
        <input
          style={{ width: field.width }}
          className={`${styles.input} ${field.readOnly ? styles.readOnlyInput : ''} ${hasError ? 'input-invalid' : ''}`}
          type={field.type}
          value={players[playerIndex][field.key] ?? ''}
          readOnly={field.readOnly}
          maxLength={field.maxLength}
          step={field.type === 'number' ? 'any' : undefined}
          onChange={(e) => handleFieldChange(playerIndex, field.key, e.target.value)}
        />
        {hasError && (
          <span className="validation-tooltip">{errorMsg}</span>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{cssStyles}</style>
      <div id="player-table" className={styles.wrapper}>
        {players.length === 0 ? (
          <div className={styles.emptyMsg}>
            Brak zawodników. Kliknij "Dodaj zawodnika", aby rozpocząć.
          </div>
        ) : (
          <>
            {/* Table view for larger screens */}
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.actionTh}>#</th>
                  {FIELD_CONFIG.map((field, index) => {
                    const prevField = FIELD_CONFIG[index - 1];
                    const isFirstInGroup = !prevField || prevField.id !== field.id;
                    return (
                      <th
                        key={field.key}
                        id={isFirstInGroup && field.id ? field.id : undefined}
                        className={styles.th}
                      >
                        {field.label}
                      </th>
                    );
                  })}
                  <th className={styles.actionTh}>Usuń</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, pIdx) => (
                  <tr
                    key={pIdx}
                    className={pIdx % 2 === 0 ? styles.evenRow : styles.oddRow}
                  >
                    <td className={styles.rowIndex}>{pIdx + 1}</td>
                    {FIELD_CONFIG.map((field) => (
                      <td key={field.key} className={styles.td}>
                        {renderInput(pIdx, field)}
                      </td>
                    ))}
                    <td className={styles.td}>
                      <button
                        className={styles.removeBtn}
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

            {/* Card view for mobile screens */}
            <div className={styles.cardContainer}>
              {players.map((player, pIdx) => (
                <div key={pIdx} className={styles.playerCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardPlayerNumber}>#{pIdx + 1}</span>
                    <div className={styles.cardPlayerName}>
                      <input
                        className={styles.cardNameInput}
                        type="text"
                        placeholder="Imię"
                        value={player.firstName ?? ''}
                        maxLength={15}
                        onChange={(e) => handleFieldChange(pIdx, 'firstName', e.target.value)}
                      />
                      <input
                        className={styles.cardNameInput}
                        type="text"
                        placeholder="Nazwisko"
                        value={player.lastName ?? ''}
                        maxLength={15}
                        onChange={(e) => handleFieldChange(pIdx, 'lastName', e.target.value)}
                      />
                    </div>
                    <button
                      className={styles.cardRemoveBtn}
                      onClick={() => handleRemovePlayer(pIdx)}
                      title="Usuń zawodnika"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Sprint 30m section */}
                  <div className={styles.cardSection}>
                    <div className={styles.cardSectionTitle}>Bieg 30m</div>
                    <div className={styles.cardFields}>
                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Czas (s)</span>
                        <input
                          className={styles.cardInput}
                          type="number"
                          step="any"
                          value={player.sprint30m_time ?? ''}
                          onChange={(e) => handleFieldChange(pIdx, 'sprint30m_time', e.target.value)}
                        />
                      </div>
                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Wynik (pkt)</span>
                        <input
                          className={`${styles.cardInput} ${styles.readOnly}`}
                          type="number"
                          value={player.sprint30m_score ?? ''}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Medicine ball section */}
                  <div className={styles.cardSection}>
                    <div className={styles.cardSectionTitle}>Piłka lekarska</div>
                    <div className={styles.cardFields}>
                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Przód (m)</span>
                        <input
                          className={styles.cardInput}
                          type="number"
                          step="any"
                          value={player.medicineBall_forward ?? ''}
                          onChange={(e) => handleFieldChange(pIdx, 'medicineBall_forward', e.target.value)}
                        />
                      </div>
                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Tył (m)</span>
                        <input
                          className={styles.cardInput}
                          type="number"
                          step="any"
                          value={player.medicineBall_backward ?? ''}
                          onChange={(e) => handleFieldChange(pIdx, 'medicineBall_backward', e.target.value)}
                        />
                      </div>
                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Suma (m)</span>
                        <input
                          className={`${styles.cardInput} ${styles.readOnly}`}
                          type="number"
                          value={player.medicineBall_sum ?? ''}
                          readOnly
                        />
                      </div>
                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Wynik (pkt)</span>
                        <input
                          className={styles.cardInput}
                          type="number"
                          step="any"
                          value={player.medicineBall_score ?? ''}
                          onChange={(e) => handleFieldChange(pIdx, 'medicineBall_score', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Other tests section */}
                  <div className={styles.cardSection}>
                    <div className={styles.cardSectionTitle}>Inne testy</div>
                    <div className={styles.cardFields}>
                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Pięcioskok (m)</span>
                        <input
                          className={styles.cardInput}
                          type="number"
                          step="any"
                          value={player.fiveJump_distance ?? ''}
                          onChange={(e) => handleFieldChange(pIdx, 'fiveJump_distance', e.target.value)}
                        />
                      </div>
                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Wynik (pkt)</span>
                        <input
                          className={styles.cardInput}
                          type="number"
                          step="any"
                          value={player.fiveJump_score ?? ''}
                          onChange={(e) => handleFieldChange(pIdx, 'fiveJump_score', e.target.value)}
                        />
                      </div>
                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Rzut ręczny (m)</span>
                        <input
                          className={styles.cardInput}
                          type="number"
                          step="any"
                          value={player.handThrow_distance ?? ''}
                          onChange={(e) => handleFieldChange(pIdx, 'handThrow_distance', e.target.value)}
                        />
                      </div>
                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Wynik (pkt)</span>
                        <input
                          className={styles.cardInput}
                          type="number"
                          step="any"
                          value={player.handThrow_score ?? ''}
                          onChange={(e) => handleFieldChange(pIdx, 'handThrow_score', e.target.value)}
                        />
                      </div>
                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Koperta (s)</span>
                        <input
                          className={styles.cardInput}
                          type="number"
                          step="any"
                          value={player.envelope_time ?? ''}
                          onChange={(e) => handleFieldChange(pIdx, 'envelope_time', e.target.value)}
                        />
                      </div>
                      <div className={styles.cardField}>
                        <span className={styles.cardLabel}>Wynik (pkt)</span>
                        <input
                          className={styles.cardInput}
                          type="number"
                          step="any"
                          value={player.envelope_score ?? ''}
                          onChange={(e) => handleFieldChange(pIdx, 'envelope_score', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <button id="add-player-btn" className={styles.addBtn} onClick={handleAddPlayer}>
          + Dodaj zawodnika
        </button>
      </div>
    </>
  );
}
