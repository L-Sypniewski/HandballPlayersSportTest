import { useState, useRef, useEffect, useCallback } from 'react';
import type { Group } from '../lib/types';
import { SAMPLE_PLAYERS } from '../lib/types';
import { readExcelFile, writeExcelFile } from '../lib/excel';
import {
  listFiles,
  saveFile,
  loadFile,
  deleteFile,
  createFile,
  type SavedFileInfo,
} from '../lib/storage';
import FileControls from './FileControls';
import FileManager from './FileManager';
import GroupTabs from './GroupTabs';
import PlayerTableMRT from './PlayerTableMRT';
import TourGuide, { useTourGuide } from './TourGuide';
import styles from './App.module.css';

const DEFAULT_GROUPS: Group[] = [{ name: 'Grupa 1', players: [] }];

// Sample group for tour demonstration
const createSampleGroups = (): Group[] => [
  { name: 'Rocznik 2008', players: [...SAMPLE_PLAYERS] },
];

export default function App() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);
  const [scrollResetKey, setScrollResetKey] = useState(0);
  const { startTour } = useTourGuide();

  // File management state
  const [savedFiles, setSavedFiles] = useState<SavedFileInfo[]>(() => listFiles());
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);

  // Track if current data is sample data shown for tour
  const isShowingSampleDataRef = useRef(false);

  // Debounce timer for auto-save
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasData = groups.length > 0;

  // Auto-save to localStorage when groups change
  const autoSave = useCallback(() => {
    if (!activeFileId || !activeFileName || isShowingSampleDataRef.current) return;
    saveFile(activeFileId, activeFileName, groups);
    setSavedFiles(listFiles());
  }, [activeFileId, activeFileName, groups]);

  useEffect(() => {
    if (!activeFileId || isShowingSampleDataRef.current) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(autoSave, 500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [groups, autoSave, activeFileId]);

  const handleUpload = async (file: File) => {
    try {
      setError(null);
      isShowingSampleDataRef.current = false;
      const loaded = await readExcelFile(file);
      if (loaded.length === 0) {
        loaded.push({ name: 'Grupa 1', players: [] });
      }

      // Create a new file entry using the uploaded filename (without extension)
      const baseName = file.name.replace(/\.xlsx$/i, '') || 'Przesłany plik';
      const newId = createFile(baseName);
      saveFile(newId, baseName, loaded);

      setActiveFileId(newId);
      setActiveFileName(baseName);
      setGroups(loaded);
      setActiveGroupIndex(0);
      setSavedFiles(listFiles());
      setScrollResetKey((k) => k + 1);
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
      const downloadName = activeFileName
        ? `${activeFileName}_${timestamp}.xlsx`
        : `dane_testowe_zawodnikow_${timestamp}.xlsx`;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Nie udało się utworzyć pliku: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleNewFile = (name: string) => {
    isShowingSampleDataRef.current = false;
    const newGroups = [...DEFAULT_GROUPS.map((g) => ({ ...g, players: [...g.players] }))];

    const newId = createFile(name);
    saveFile(newId, name, newGroups);

    setActiveFileId(newId);
    setActiveFileName(name);
    setGroups(newGroups);
    setActiveGroupIndex(0);
    setError(null);
    setSavedFiles(listFiles());
    setScrollResetKey((k) => k + 1);
  };

  const handleSelectFile = (id: string) => {
    const loaded = loadFile(id);
    if (!loaded) {
      setError('Nie udało się wczytać pliku z pamięci lokalnej.');
      return;
    }
    isShowingSampleDataRef.current = false;
    const fileInfo = savedFiles.find((f) => f.id === id);
    setActiveFileId(id);
    setActiveFileName(fileInfo?.name ?? null);
    setGroups(loaded);
    setActiveGroupIndex(0);
    setError(null);
    setScrollResetKey((k) => k + 1);
  };

  const handleDeleteFile = (id: string) => {
    deleteFile(id);
    setSavedFiles(listFiles());
    if (activeFileId === id) {
      setActiveFileId(null);
      setActiveFileName(null);
      setGroups([]);
      setActiveGroupIndex(0);
    }
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
    isShowingSampleDataRef.current = false;
    const updated = [...groups];
    updated[activeGroupIndex] = { ...updated[activeGroupIndex], players };
    setGroups(updated);
  };

  const handleTourStart = () => {
    setIsTourActive(true);
    if (groups.length === 0) {
      isShowingSampleDataRef.current = true;
      setGroups(createSampleGroups());
      setActiveGroupIndex(0);
    }
  };

  const handleTourEnd = () => {
    setIsTourActive(false);
    if (isShowingSampleDataRef.current) {
      setGroups([]);
      setActiveGroupIndex(0);
    }
  };

  const handleStartTourClick = () => {
    if (groups.length === 0) {
      isShowingSampleDataRef.current = true;
      setGroups(createSampleGroups());
      setActiveGroupIndex(0);
      setIsTourActive(true);
      startTour(() => {
        setIsTourActive(false);
        if (isShowingSampleDataRef.current) {
          setGroups([]);
          setActiveGroupIndex(0);
        }
      });
    } else {
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

      <FileManager
        files={savedFiles}
        activeFileId={activeFileId}
        onSelectFile={handleSelectFile}
        onCreateFile={handleNewFile}
        onDeleteFile={handleDeleteFile}
        onUpload={handleUpload}
      />

      {activeFileId && (
        <FileControls
          onDownload={handleDownload}
          onStartTour={handleStartTourClick}
          hasData={hasData}
          activeFileName={activeFileName}
          isTourActive={isTourActive}
        />
      )}

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
