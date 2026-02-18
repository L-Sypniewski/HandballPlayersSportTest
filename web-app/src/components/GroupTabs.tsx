import { useState } from 'react';
import type { Group } from '../lib/types';

interface GroupTabsProps {
  groups: Group[];
  activeIndex: number;
  onSelectGroup: (index: number) => void;
  onAddGroup: () => void;
  onRemoveGroup: (index: number) => void;
  onRenameGroup: (index: number, newName: string) => void;
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    flexWrap: 'wrap' as const,
    marginTop: '12px',
  },
  tab: {
    padding: '8px 16px',
    border: '2px solid transparent',
    borderRadius: '6px 6px 0 0',
    fontSize: '14px',
    fontWeight: 500 as const,
    cursor: 'pointer',
    backgroundColor: '#edf2f7',
    color: '#4a5568',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  activeTab: {
    backgroundColor: '#3182ce',
    color: '#ffffff',
    borderColor: '#2b6cb0',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0 2px',
    lineHeight: 1,
    color: 'inherit',
    opacity: 0.7,
  },
  addBtn: {
    padding: '8px 16px',
    border: '2px dashed #a0aec0',
    borderRadius: '6px 6px 0 0',
    fontSize: '14px',
    fontWeight: 500 as const,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#718096',
    transition: 'all 0.2s',
  },
  renameInput: {
    padding: '4px 8px',
    fontSize: '14px',
    border: '1px solid #3182ce',
    borderRadius: '4px',
    outline: 'none',
    width: '120px',
  },
};

export default function GroupTabs({
  groups,
  activeIndex,
  onSelectGroup,
  onAddGroup,
  onRemoveGroup,
  onRenameGroup,
}: GroupTabsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleDoubleClick = (index: number) => {
    setEditingIndex(index);
    setEditName(groups[index].name);
  };

  const handleRenameSubmit = (index: number) => {
    const trimmed = editName.trim();
    if (trimmed) {
      onRenameGroup(index, trimmed);
    }
    setEditingIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(index);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  return (
    <div style={styles.container}>
      {groups.map((group, index) => (
        <div
          key={index}
          style={{
            ...styles.tab,
            ...(index === activeIndex ? styles.activeTab : {}),
          }}
          onClick={() => onSelectGroup(index)}
        >
          {editingIndex === index ? (
            <input
              style={styles.renameInput}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleRenameSubmit(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <span onDoubleClick={() => handleDoubleClick(index)}>
              {group.name}
            </span>
          )}
          {groups.length > 1 && (
            <button
              style={styles.removeBtn}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveGroup(index);
              }}
              title="Usuń grupę"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button style={styles.addBtn} onClick={onAddGroup}>
        + Dodaj grupę
      </button>
    </div>
  );
}
