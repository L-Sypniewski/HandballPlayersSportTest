import styles from './FileControls.module.css';

interface FileControlsProps {
  onDownload: () => void;
  onStartTour: () => void;
  hasData: boolean;
  activeFileName: string | null;
  isTourActive?: boolean;
}

export default function FileControls({
  onDownload,
  onStartTour,
  hasData,
  activeFileName,
  isTourActive = false,
}: FileControlsProps) {
  return (
    <div className={styles.wrapper}>
      <div id="file-controls" className={styles.container}>
        {activeFileName && (
          <span className={styles.fileNameBadge} title={activeFileName}>
            📝 {activeFileName}
          </span>
        )}
        <div className={styles.spacer} />
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
      {isTourActive && (
        <div
          id="unsaved-indicator"
          className={styles.unsavedIndicator}
          title="Dane przykładowe dla samouczka"
        >
          <span className={styles.unsavedDot} />
          Dane przykładowe
        </div>
      )}
    </div>
  );
}
