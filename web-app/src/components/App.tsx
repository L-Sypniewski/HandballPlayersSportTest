import { useState } from 'react';
import type { Group } from '../lib/types';
import { readExcelFile, writeExcelFile } from '../lib/excel';
import FileControls from './FileControls';
import GroupTabs from './GroupTabs';
import PlayerTable from './PlayerTable';

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
  error: {
    padding: '12px 16px',
    backgroundColor: '#fed7d7',
    color: '#c53030',
    borderRadius: '6px',
    marginTop: '12px',
    fontSize: '14px',
  },
};

const DEFAULT_GROUPS: Group[] = [{ name: 'Group 1', players: [] }];

export default function App() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const hasData = groups.length > 0;

  const handleUpload = async (file: File) => {
    try {
      setError(null);
      const loaded = await readExcelFile(file);
      if (loaded.length === 0) {
        loaded.push({ name: 'Group 1', players: [] });
      }
      setGroups(loaded);
      setActiveGroupIndex(0);
    } catch (err) {
      setError(`Failed to read file: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDownload = async () => {
    if (!hasData) return;
    try {
      setError(null);
      const blob = await writeExcelFile(groups);
      const { saveAs } = await import('file-saver');
      saveAs(blob, 'handball_test_data.xlsx');
    } catch (err) {
      setError(`Failed to create file: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleNewFile = () => {
    setGroups([...DEFAULT_GROUPS.map((g) => ({ ...g, players: [...g.players] }))]);
    setActiveGroupIndex(0);
    setError(null);
  };

  const handleAddGroup = () => {
    const newName = `Group ${groups.length + 1}`;
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
    const updated = [...groups];
    updated[activeGroupIndex] = { ...updated[activeGroupIndex], players };
    setGroups(updated);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🤾 Handball Players Sport Test</h1>
        <p style={styles.subtitle}>
          Upload, create, and manage player test data
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
