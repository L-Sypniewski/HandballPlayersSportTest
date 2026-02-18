import { useState, useRef } from 'react';
import type { Group } from '../lib/types';
import { SAMPLE_PLAYERS } from '../lib/types';
import { readExcelFile, writeExcelFile } from '../lib/excel';
import FileControls from './FileControls';
import GroupTabs from './GroupTabs';
import PlayerTable from './PlayerTable';
import TourGuide, { useTourGuide } from './TourGuide';

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    textAlign: 'center' as const,
    padding: '24px',
    backgroundColor: '#2b6cb0',
    color: '#ffffff',
    borderRadius: '8px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'relative' as const,
  },
  title: {
    fontSize: '28px',
    fontWeight: 700 as const,
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    opacity: 0.8,
    marginTop: '4px',
  },
  headerButtons: {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    display: 'flex',
    gap: '8px',
  },
  scoringLink: {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    padding: '6px 12px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    transition: 'background-color 0.2s',
  },
  helpBtn: {
    color: '#ffffff',
    border: 'none',
    fontSize: '14px',
    fontWeight: 500,
    padding: '6px 12px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  error: {
    padding: '12px 16px',
    backgroundColor: '#fed7d7',
    color: '#c53030',
    borderRadius: '6px',
    marginTop: '12px',
    fontSize: '14px',
  },
};

const DEFAULT_GROUPS: Group[] = [{ name: 'Grupa 1', players: [] }];

// Sample group for tour demonstration
const createSampleGroups = (): Group[] => [
  { name: 'Rocznik 2008', players: [...SAMPLE_PLAYERS] },
];

export default function App() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { startTour } = useTourGuide();

  // Track if current data is sample data shown for tour
  const isShowingSampleDataRef = useRef(false);

  const hasData = groups.length > 0;

  const handleUpload = async (file: File) => {
    try {
      setError(null);
      isShowingSampleDataRef.current = false;
      const loaded = await readExcelFile(file);
      if (loaded.length === 0) {
        loaded.push({ name: 'Grupa 1', players: [] });
      }
      setGroups(loaded);
      setActiveGroupIndex(0);
    } catch (err) {
      setError(`Nie udało się odczytać pliku: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDownload = async () => {
    if (!hasData) return;
    try {
      setError(null);
      const blob = await writeExcelFile(groups);
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestamp = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear().toString().slice(-2)}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dane_testowe_zawodnikow_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Nie udało się utworzyć pliku: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleNewFile = () => {
    isShowingSampleDataRef.current = false;
    setGroups([...DEFAULT_GROUPS.map((g) => ({ ...g, players: [...g.players] }))]);
    setActiveGroupIndex(0);
    setError(null);
  };

  const handleAddGroup = () => {
    const newName = `Grupa ${groups.length + 1}`;
    setGroups([...groups, { name: newName, players: [] }]);
    setActiveGroupIndex(groups.length);
  };

  const handleRemoveGroup = (index: number) => {
    if (groups.length <= 1) return;
    const updated = groups.filter((_, i) => i !== index);
    setGroups(updated);
    setActiveGroupIndex(Math.min(activeGroupIndex, updated.length - 1));
  };

  const handleRenameGroup = (index: number, newName: string) => {
    const updated = [...groups];
    updated[index] = { ...updated[index], name: newName };
    setGroups(updated);
  };

  const handleUpdatePlayers = (players: Group['players']) => {
    // User modified data, so it's no longer just sample data
    isShowingSampleDataRef.current = false;
    const updated = [...groups];
    updated[activeGroupIndex] = { ...updated[activeGroupIndex], players };
    setGroups(updated);
  };

  const handleTourStart = () => {
    // Only load sample data if there's no existing data
    if (groups.length === 0) {
      isShowingSampleDataRef.current = true;
      setGroups(createSampleGroups());
      setActiveGroupIndex(0);
    }
  };

  const handleTourEnd = () => {
    // Clear sample data only if it wasn't modified by user
    if (isShowingSampleDataRef.current) {
      setGroups([]);
      setActiveGroupIndex(0);
    }
  };

  const handleStartTourClick = () => {
    // For manual tour start, also load sample data if no data exists
    if (groups.length === 0) {
      isShowingSampleDataRef.current = true;
      setGroups(createSampleGroups());
      setActiveGroupIndex(0);
      startTour(() => {
        // Clear sample data after tour ends
        if (isShowingSampleDataRef.current) {
          setGroups([]);
          setActiveGroupIndex(0);
        }
      });
    } else {
      // User has data, just start tour without modifying data
      startTour();
    }
  };

  return (
    <div style={styles.container}>
      <TourGuide onTourStart={handleTourStart} onTourEnd={handleTourEnd} />
      <div style={styles.header}>
        <div style={styles.headerButtons}>
          <button
            id="help-btn"
            style={styles.helpBtn}
            onClick={handleStartTourClick}
            title="Uruchom przewodnik"
          >
            🎓 Pokaż samouczek
          </button>
          <a id="scoring-link" href="/punktacja" style={styles.scoringLink}>
            📊 Punktacja
          </a>
        </div>
        <h1 style={styles.title}>🤾 Test Sprawności Fizycznej Piłkarzy Ręcznych</h1>
        <p style={styles.subtitle}>
          Prześlij, utwórz i zarządzaj danymi testowymi zawodników
        </p>
      </div>

      <FileControls
        onUpload={handleUpload}
        onDownload={handleDownload}
        onNewFile={handleNewFile}
        hasData={hasData}
      />

      {error && <div style={styles.error}>{error}</div>}

      {hasData && (
        <>
          <GroupTabs
            groups={groups}
            activeIndex={activeGroupIndex}
            onSelectGroup={setActiveGroupIndex}
            onAddGroup={handleAddGroup}
            onRemoveGroup={handleRemoveGroup}
            onRenameGroup={handleRenameGroup}
          />

          <PlayerTable
            players={groups[activeGroupIndex].players}
            onUpdatePlayers={handleUpdatePlayers}
          />
        </>
      )}
    </div>
  );
}
