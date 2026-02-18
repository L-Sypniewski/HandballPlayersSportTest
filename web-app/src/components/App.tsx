import { useState, useRef, useEffect } from 'react';
import type { Group, Player } from '../lib/types';
import { SAMPLE_PLAYERS } from '../lib/types';
import { readExcelFile, writeExcelFile } from '../lib/excel';
import { calculateSprint30mScore, calculateMedicineBallScore, calculateFiveJumpScore } from '../lib/scoring';
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
const LOCAL_STORAGE_FILES_KEY = 'handball-saved-files-v1';
const LOCAL_STORAGE_ACTIVE_FILE_KEY = 'handball-active-file-id';

type PersistedPlayer = Pick<
  Player,
  | 'firstName'
  | 'lastName'
  | 'sprint30m_time'
  | 'medicineBall_forward'
  | 'medicineBall_backward'
  | 'fiveJump_distance'
  | 'handThrow_distance'
  | 'handThrow_score'
  | 'envelope_time'
  | 'envelope_score'
>;

interface PersistedGroup {
  name: string;
  players: PersistedPlayer[];
}

interface StoredFile {
  id: string;
  name: string;
  groups: PersistedGroup[];
}

// Sample group for tour demonstration
const createSampleGroups = (): Group[] => [
  { name: 'Rocznik 2008', players: [...SAMPLE_PLAYERS] },
];

const cloneGroups = (groups: Group[]): Group[] => JSON.parse(JSON.stringify(groups));

const toPersistedGroups = (groups: Group[]): PersistedGroup[] =>
  groups.map((group) => ({
    name: group.name,
    players: group.players.map((player) => ({
      firstName: player.firstName,
      lastName: player.lastName,
      sprint30m_time: player.sprint30m_time,
      medicineBall_forward: player.medicineBall_forward,
      medicineBall_backward: player.medicineBall_backward,
      fiveJump_distance: player.fiveJump_distance,
      handThrow_distance: player.handThrow_distance,
      handThrow_score: player.handThrow_score,
      envelope_time: player.envelope_time,
      envelope_score: player.envelope_score,
    })),
  }));

const toHydratedPlayer = (player: PersistedPlayer): Player => {
  const medicineBall_sum =
    player.medicineBall_forward !== null && player.medicineBall_backward !== null
      ? player.medicineBall_forward + player.medicineBall_backward
      : null;
  return {
    ...player,
    sprint30m_score: player.sprint30m_time !== null ? calculateSprint30mScore(player.sprint30m_time) : null,
    medicineBall_sum,
    medicineBall_score: medicineBall_sum !== null ? calculateMedicineBallScore(medicineBall_sum) : null,
    fiveJump_score: player.fiveJump_distance !== null ? calculateFiveJumpScore(player.fiveJump_distance) : null,
  };
};

const fromPersistedGroups = (groups: PersistedGroup[]): Group[] =>
  groups.map((group) => ({
    name: group.name,
    players: group.players.map(toHydratedPlayer),
  }));

const readStoredFiles = (): StoredFile[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as StoredFile[] : [];
  } catch {
    return [];
  }
};

const writeStoredFiles = (files: StoredFile[]) => {
  localStorage.setItem(LOCAL_STORAGE_FILES_KEY, JSON.stringify(files));
};

const createFileId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export default function App() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [scrollResetKey, setScrollResetKey] = useState(0); // Key to reset table scroll
  const [savedFiles, setSavedFiles] = useState<Array<{ id: string; name: string }>>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
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

  useEffect(() => {
    const storedFiles = readStoredFiles();
    setSavedFiles(storedFiles.map(({ id, name }) => ({ id, name })));
    if (storedFiles.length === 0) return;

    const activeFileId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_FILE_KEY);
    const fileToLoad = storedFiles.find((file) => file.id === activeFileId) ?? storedFiles[0];
    const hydrated = fromPersistedGroups(fileToLoad.groups);
    setGroups(hydrated);
    setCurrentFileId(fileToLoad.id);
    setActiveGroupIndex(0);
    baselineGroupsRef.current = cloneGroups(hydrated);
    setHasUnsavedChanges(false);
    setScrollResetKey(k => k + 1);
  }, []);

  useEffect(() => {
    if (!currentFileId || groups.length === 0 || isShowingSampleDataRef.current) return;
    const storedFiles = readStoredFiles();
    const fileIndex = storedFiles.findIndex((file) => file.id === currentFileId);
    if (fileIndex === -1) return;
    storedFiles[fileIndex] = {
      ...storedFiles[fileIndex],
      groups: toPersistedGroups(groups),
    };
    writeStoredFiles(storedFiles);
    setSavedFiles(storedFiles.map(({ id, name }) => ({ id, name })));
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_FILE_KEY, currentFileId);
  }, [groups, currentFileId]);

  const saveAsNewStoredFile = (fileName: string, nextGroups: Group[]) => {
    const storedFiles = readStoredFiles();
    const fileId = createFileId();
    storedFiles.push({
      id: fileId,
      name: fileName,
      groups: toPersistedGroups(nextGroups),
    });
    writeStoredFiles(storedFiles);
    setSavedFiles(storedFiles.map(({ id, name }) => ({ id, name })));
    setCurrentFileId(fileId);
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_FILE_KEY, fileId);
  };

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
      baselineGroupsRef.current = cloneGroups(loaded);
      setHasUnsavedChanges(false);
      saveAsNewStoredFile(file.name.replace(/\.xlsx$/i, '') || 'Przesłany plik', loaded);
      // Reset scroll position
      setScrollResetKey(k => k + 1);
    } catch (err) {
      setError(`Nie udało się odczytać pliku: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDownload = async () => {
    if (!hasData) return;
    try {
      setError(null);
      const blob = await writeExcelFile(groups);
      const currentFileName = savedFiles.find((file) => file.id === currentFileId)?.name ?? 'dane_testowe_zawodnikow';
      const safeFileName = currentFileName.replace(/[\\/:*?"<>|]+/g, '_');
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestamp = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear().toString().slice(-2)}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeFileName}_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      // Update baseline after successful download
      baselineGroupsRef.current = cloneGroups(groups);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(`Nie udało się utworzyć pliku: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleNewFile = () => {
    const fileName = window.prompt('Podaj nazwę nowego pliku:', `Nowy plik ${savedFiles.length + 1}`)?.trim();
    if (!fileName) return;
    isShowingSampleDataRef.current = false;
    const newGroups = [...DEFAULT_GROUPS.map((g) => ({ ...g, players: [...g.players] }))];
    setGroups(newGroups);
    setActiveGroupIndex(0);
    setError(null);
    // Update baseline after creating new file
    baselineGroupsRef.current = cloneGroups(newGroups);
    setHasUnsavedChanges(false);
    saveAsNewStoredFile(fileName, newGroups);
    // Reset scroll position
    setScrollResetKey(k => k + 1);
  };

  const handleSelectStoredFile = (fileId: string) => {
    if (!fileId || fileId === currentFileId) return;
    const storedFile = readStoredFiles().find((file) => file.id === fileId);
    if (!storedFile) return;
    isShowingSampleDataRef.current = false;
    const hydrated = fromPersistedGroups(storedFile.groups);
    setGroups(hydrated);
    setCurrentFileId(fileId);
    setActiveGroupIndex(0);
    setError(null);
    baselineGroupsRef.current = cloneGroups(hydrated);
    setHasUnsavedChanges(false);
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_FILE_KEY, fileId);
    setScrollResetKey(k => k + 1);
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
        onSelectStoredFile={handleSelectStoredFile}
        onStartTour={handleStartTourClick}
        hasData={hasData}
        savedFiles={savedFiles}
        currentFileId={currentFileId}
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
            resetScrollKey={scrollResetKey}
          />
        </>
      )}
    </div>
  );
}
