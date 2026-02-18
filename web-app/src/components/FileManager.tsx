import { useState } from 'react';
import type { SavedFileInfo } from '../lib/storage';
import styles from './FileManager.module.css';

interface FileManagerProps {
  files: SavedFileInfo[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onCreateFile: (name: string) => void;
  onDeleteFile: (id: string) => void;
  onUpload: (file: File) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function FileManager({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onUpload,
}: FileManagerProps) {
  const [newFileName, setNewFileName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = () => {
    const trimmed = newFileName.trim();
    if (!trimmed) return;
    onCreateFile(trimmed);
    setNewFileName('');
    setShowNewInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') {
      setShowNewInput(false);
      setNewFileName('');
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(null);
    onDeleteFile(id);
  };

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) onUpload(file);
    };
    input.click();
  };

  const sortedFiles = [...files].sort(
    (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );

  return (
    <div id="file-manager" className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.heading}>📁 Zapisane pliki</h2>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleUploadClick} title="Prześlij plik XLSX">
            📂 Prześlij
          </button>
          <button
            className={`${styles.actionBtn} ${styles.createBtn}`}
            onClick={() => setShowNewInput(true)}
            title="Utwórz nowy plik"
          >
            ✨ Nowy
          </button>
        </div>
      </div>

      {showNewInput && (
        <div className={styles.newFileRow}>
          <input
            className={styles.newFileInput}
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nazwa pliku..."
            autoFocus
          />
          <button
            className={styles.confirmBtn}
            onClick={handleCreate}
            disabled={!newFileName.trim()}
          >
            Utwórz
          </button>
          <button
            className={styles.cancelBtn}
            onClick={() => { setShowNewInput(false); setNewFileName(''); }}
          >
            Anuluj
          </button>
        </div>
      )}

      {sortedFiles.length === 0 && !showNewInput ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📋</span>
          <p>Brak zapisanych plików</p>
          <p className={styles.emptyHint}>Utwórz nowy plik lub prześlij XLSX, aby rozpocząć</p>
        </div>
      ) : (
        <div className={styles.fileList}>
          {sortedFiles.map((file) => (
            <div
              key={file.id}
              className={`${styles.fileCard} ${file.id === activeFileId ? styles.active : ''}`}
              onClick={() => onSelectFile(file.id)}
            >
              <div className={styles.fileInfo}>
                <span className={styles.fileIcon}>
                  {file.id === activeFileId ? '📝' : '📄'}
                </span>
                <div className={styles.fileMeta}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileDate}>{formatDate(file.lastModified)}</span>
                </div>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingId(file.id);
                }}
                title="Usuń plik"
              >
                🗑️
              </button>
              {deletingId === file.id && (
                <div className={styles.deleteConfirm} onClick={(e) => e.stopPropagation()}>
                  <span>Usunąć?</span>
                  <button className={styles.confirmDeleteBtn} onClick={() => handleDelete(file.id)}>
                    Tak
                  </button>
                  <button className={styles.cancelDeleteBtn} onClick={() => setDeletingId(null)}>
                    Nie
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.autoSaveNote}>
        💾 Zmiany zapisują się automatycznie
      </div>
    </div>
  );
}
