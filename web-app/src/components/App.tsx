import { useState, useRef, useEffect } from 'react';
import type { Group } from '../lib/types';
import { SAMPLE_PLAYERS } from '../lib/types';
import { readExcelFile, writeExcelFile } from '../lib/excel';
import FileControls from './FileControls';
import GroupTabs from './GroupTabs';
import PlayerTableMRT from './PlayerTableMRT';
import TourGuide, { useTourGuide } from './TourGuide';
import styles from './App.module.css';

// Deep comparison helper for groups arrays
const groupsAreEqual = (a: Group[], b: Group[]): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const { startTour } = useTourGuide();

  // Track if current data is sample data shown for tour
  const isShowingSampleDataRef = useRef(false);

  // Store baseline for unsaved changes detection
  const baselineGroupsRef = useRef<Group[] | null>(null);

  const hasData = groups.length > 0;

  // Check for changes whenever groups change
  useEffect(() => {
    if (baselineGroupsRef.current !== null) {
      setHasUnsavedChanges(!groupsAreEqual(groups, baselineGroupsRef.current));
    }
  }, [groups]);

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
      // Update baseline after successful upload
      baselineGroupsRef.current = JSON.parse(JSON.stringify(loaded));
      setHasUnsavedChanges(false);
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
      // Update baseline after successful download
      baselineGroupsRef.current = JSON.parse(JSON.stringify(groups));
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(`Nie udało się utworzyć pliku: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleNewFile = () => {
    isShowingSampleDataRef.current = false;
    const newGroups = [...DEFAULT_GROUPS.map((g) => ({ ...g, players: [...g.players] }))];
    setGroups(newGroups);
    setActiveGroupIndex(0);
    setError(null);
    // Update baseline after creating new file
    baselineGroupsRef.current = JSON.parse(JSON.stringify(newGroups));
    setHasUnsavedChanges(false);
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
    setIsTourActive(true);
    // Only load sample data if there's no existing data
    if (groups.length === 0) {
      isShowingSampleDataRef.current = true;
      setGroups(createSampleGroups());
      setActiveGroupIndex(0);
    }
  };

  const handleTourEnd = () => {
    setIsTourActive(false);
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
      setIsTourActive(true);
      startTour(() => {
        setIsTourActive(false);
        // Clear sample data after tour ends
        if (isShowingSampleDataRef.current) {
          setGroups([]);
          setActiveGroupIndex(0);
        }
      });
    } else {
      // User has data, just start tour without modifying data
      setIsTourActive(true);
      startTour(() => {
        setIsTourActive(false);
      });
    }
  };

  return (
    <div className={styles.container}>
      <TourGuide onTourStart={handleTourStart} onTourEnd={handleTourEnd} />
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>🤾 Test Sprawności Fizycznej Piłkarzy Ręcznych</h1>
        </div>
        <p className={styles.subtitle}>
          Prześlij, utwórz i zarządzaj danymi testowymi zawodników
        </p>
      </div>

      <FileControls
        onUpload={handleUpload}
        onDownload={handleDownload}
        onNewFile={handleNewFile}
        onStartTour={handleStartTourClick}
        hasData={hasData}
        hasUnsavedChanges={hasUnsavedChanges}
        isTourActive={isTourActive}
      />

      {error && <div className={styles.error}>{error}</div>}

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

          <PlayerTableMRT
            players={groups[activeGroupIndex].players}
            onUpdatePlayers={handleUpdatePlayers}
          />
        </>
      )}
    </div>
  );
}
