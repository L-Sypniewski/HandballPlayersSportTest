import { useRef } from 'react';

interface FileControlsProps {
  onUpload: (file: File) => void;
  onDownload: () => void;
  onNewFile: () => void;
  hasData: boolean;
}

const styles = {
  container: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  btn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600 as const,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  uploadBtn: {
    backgroundColor: '#3182ce',
    color: '#ffffff',
  },
  newBtn: {
    backgroundColor: '#38a169',
    color: '#ffffff',
  },
  downloadBtn: {
    backgroundColor: '#2b6cb0',
    color: '#ffffff',
  },
  disabledBtn: {
    backgroundColor: '#a0aec0',
    color: '#ffffff',
    cursor: 'not-allowed' as const,
  },
  hiddenInput: {
    display: 'none',
  },
};

export default function FileControls({
  onUpload,
  onDownload,
  onNewFile,
  hasData,
}: FileControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div style={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        style={styles.hiddenInput}
      />
      <button
        style={{ ...styles.btn, ...styles.uploadBtn }}
        onClick={() => fileInputRef.current?.click()}
      >
        📂 Upload XLSX
      </button>
      <button
        style={{ ...styles.btn, ...styles.newBtn }}
        onClick={onNewFile}
      >
        ✨ New File
      </button>
      <button
        style={{
          ...styles.btn,
          ...(hasData ? styles.downloadBtn : styles.disabledBtn),
        }}
        onClick={onDownload}
        disabled={!hasData}
      >
        💾 Download XLSX
      </button>
    </div>
  );
}
