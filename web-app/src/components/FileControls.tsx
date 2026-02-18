import { useRef } from 'react';
import styles from './FileControls.module.css';

interface FileControlsProps {
  onUpload: (file: File) => void;
  onDownload: () => void;
  onNewFile: () => void;
  onSelectStoredFile: (fileId: string) => void;
  onStartTour: () => void;
  hasData: boolean;
  savedFiles: Array<{ id: string; name: string }>;
  currentFileId: string | null;
  hasUnsavedChanges: boolean;
  isTourActive?: boolean;
}

export default function FileControls({
  onUpload,
  onDownload,
  onNewFile,
  onSelectStoredFile,
  onStartTour,
  hasData,
  savedFiles,
  currentFileId,
  hasUnsavedChanges,
  isTourActive = false,
}: FileControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = '';
    }
  };

  const showUnsavedIndicator = hasUnsavedChanges || isTourActive;

  return (
    <div className={styles.wrapper}>
      <div id="file-controls" className={styles.container}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className={styles.hiddenInput}
        />
        <button
          id="upload-btn"
          className={`${styles.btn} ${styles.uploadBtn}`}
          onClick={() => fileInputRef.current?.click()}
        >
          📂 Prześlij XLSX
        </button>
        <button
          id="new-file-btn"
          className={`${styles.btn} ${styles.newBtn}`}
          onClick={onNewFile}
        >
          ✨ Nowy plik
        </button>
        <div className={styles.fileSelector}>
          <label htmlFor="saved-files-select" className={styles.fileSelectorLabel}>
            📁 Aktywny plik
          </label>
          <select
            id="saved-files-select"
            className={styles.fileSelectorInput}
            value={currentFileId ?? ''}
            onChange={(e) => onSelectStoredFile(e.target.value)}
          >
            {savedFiles.length === 0 ? (
              <option value="">Brak zapisanych plików</option>
            ) : (
              savedFiles.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.name}
                </option>
              ))
            )}
          </select>
        </div>
        <button
          id="download-btn"
          className={`${styles.btn} ${hasData ? styles.downloadBtn : styles.disabledBtn}`}
          onClick={onDownload}
          disabled={!hasData}
        >
          💾 Pobierz XLSX
        </button>
        <button
          id="help-btn"
          className={`${styles.btn} ${styles.helpBtn}`}
          onClick={onStartTour}
          title="Uruchom przewodnik"
        >
          🎓 Pokaż samouczek
        </button>
        <a id="scoring-link" href="/punktacja" className={`${styles.btn} ${styles.scoringBtn}`}>
          📊 Punktacja
        </a>
      </div>
      <div
        id="unsaved-indicator"
        className={styles.unsavedIndicator}
        style={{ visibility: showUnsavedIndicator ? 'visible' : 'hidden' }}
        title="Masz niezapisane zmiany. Kliknij 'Pobierz XLSX', aby zapisać."
      >
        <span className={styles.unsavedDot} />
        Niezapisane zmiany
      </div>
    </div>
  );
}
