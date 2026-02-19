import { useState } from 'react';
import type { Group } from '../lib/types';
import styles from './GroupTabs.module.css';

interface GroupTabsProps {
  groups: Group[];
  activeIndex: number;
  onSelectGroup: (index: number) => void;
  onAddGroup: () => void;
  onRemoveGroup: (index: number) => void;
  onRenameGroup: (index: number, newName: string) => void;
}

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
    <div id="group-tabs" className={styles.container}>
      {groups.map((group, index) => (
        <div
          key={index}
          className={`${styles.tab} ${index === activeIndex ? styles.activeTab : ''}`}
          onClick={() => onSelectGroup(index)}
        >
          {editingIndex === index ? (
            <input
              className={styles.renameInput}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleRenameSubmit(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <span
              className={styles.tabName}
              onDoubleClick={() => handleDoubleClick(index)}
            >
              {group.name}
            </span>
          )}
          {groups.length > 1 && (
            <button
              className={styles.removeBtn}
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Czy na pewno chcesz usunąć grupę "${group.name}"?`)) {
                  onRemoveGroup(index);
                }
              }}
              title="Usuń grupę"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button id="add-group-btn" className={styles.addBtn} onClick={onAddGroup}>
        + Dodaj grupę
      </button>
    </div>
  );
}
