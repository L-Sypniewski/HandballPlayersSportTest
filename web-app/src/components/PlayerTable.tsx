import type { Player } from '../lib/types';
import { createEmptyPlayer } from '../lib/types';
import { calculateSprint30mScore } from '../lib/scoring';

interface PlayerTableProps {
  players: Player[];
  onUpdatePlayers: (players: Player[]) => void;
}

const FIELD_CONFIG: {
  key: keyof Player;
  label: string;
  type: 'text' | 'number';
  readOnly?: boolean;
  maxLength?: number;
  width: string;
}[] = [
  { key: 'firstName', label: 'Imię', type: 'text', maxLength: 15, width: '100px' },
  { key: 'lastName', label: 'Nazwisko', type: 'text', maxLength: 15, width: '100px' },
  { key: 'sprint30m_time', label: 'Czas 30m', type: 'number', width: '80px' },
  { key: 'sprint30m_score', label: 'Wynik 30m', type: 'number', readOnly: true, width: '80px' },
  { key: 'medicineBall_forward', label: 'Piłka lekarska\nprzód', type: 'number', width: '75px' },
  { key: 'medicineBall_backward', label: 'Piłka lekarska\ntył', type: 'number', width: '75px' },
  { key: 'medicineBall_sum', label: 'Piłka lekarska\nsuma', type: 'number', readOnly: true, width: '75px' },
  { key: 'medicineBall_score', label: 'Wynik\npiłka lekarska', type: 'number', width: '80px' },
  { key: 'fiveJump_distance', label: 'Pięcioskok\ndystans', type: 'number', width: '85px' },
  { key: 'fiveJump_score', label: 'Wynik\npięcioskok', type: 'number', width: '85px' },
  { key: 'handThrow_distance', label: 'Rzut ręczny\ndystans', type: 'number', width: '85px' },
  { key: 'handThrow_score', label: 'Wynik\nrzut ręczny', type: 'number', width: '85px' },
  { key: 'envelope_time', label: 'Czas\nkoperta', type: 'number', width: '80px' },
  { key: 'envelope_score', label: 'Wynik\nkoperta', type: 'number', width: '80px' },
];

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
  },
  input: {
    width: '100%',
    padding: '6px 4px',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '13px',
    textAlign: 'center' as const,
    backgroundColor: '#ffffff',
    transition: 'border-color 0.2s',
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
  const handleFieldChange = (
    playerIndex: number,
    key: keyof Player,
    value: string
  ) => {
    const updated = [...players];
    const player = { ...updated[playerIndex] };

    if (key === 'firstName' || key === 'lastName') {
      player[key] = value.slice(0, 15);
    } else {
      const numVal = value === '' ? null : Number(value);
      (player as Record<string, unknown>)[key] =
        numVal !== null && isNaN(numVal) ? null : numVal;
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
    onUpdatePlayers(updated);
  };

  return (
    <div style={styles.wrapper}>
      {players.length === 0 ? (
        <div style={styles.emptyMsg}>
          Brak zawodników. Kliknij "Dodaj zawodnika", aby rozpocząć.
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.actionTh}>#</th>
              {FIELD_CONFIG.map((field) => (
                <th key={field.key} style={styles.th}>
                  {field.label}
                </th>
              ))}
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
                {FIELD_CONFIG.map((field) => (
                  <td key={field.key} style={styles.td}>
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
                    />
                  </td>
                ))}
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
      <button style={styles.addBtn} onClick={handleAddPlayer}>
        + Dodaj zawodnika
      </button>
    </div>
  );
}
