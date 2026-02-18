import type { Player, Group } from './types';
import { calculateSprint30mScore, calculateMedicineBallScore, calculateFiveJumpScore } from './scoring';

const FILES_INDEX_KEY = 'handball-files-index';
const FILE_DATA_PREFIX = 'handball-file-';

/** Metadata for a saved file */
export interface SavedFileInfo {
  id: string;
  name: string;
  lastModified: string; // ISO date string
}

/** Non-computed player fields stored in localStorage */
interface StoredPlayer {
  firstName: string;
  lastName: string;
  sprint30m_time: number | null;
  medicineBall_forward: number | null;
  medicineBall_backward: number | null;
  fiveJump_distance: number | null;
  handThrow_distance: number | null;
  handThrow_score: number | null;
  envelope_time: number | null;
  envelope_score: number | null;
}

interface StoredGroup {
  name: string;
  players: StoredPlayer[];
}

/** Generate a unique ID for a file */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Strip computed values from a player for storage */
function stripComputed(player: Player): StoredPlayer {
  return {
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
  };
}

/** Recompute calculated fields from stored player data */
function recompute(stored: StoredPlayer): Player {
  const sprint30m_score =
    stored.sprint30m_time !== null ? calculateSprint30mScore(stored.sprint30m_time) : null;

  const medicineBall_sum =
    stored.medicineBall_forward !== null && stored.medicineBall_backward !== null
      ? Math.round((stored.medicineBall_forward + stored.medicineBall_backward) * 100) / 100
      : null;

  const medicineBall_score =
    medicineBall_sum !== null ? calculateMedicineBallScore(medicineBall_sum) : null;

  const fiveJump_score =
    stored.fiveJump_distance !== null ? calculateFiveJumpScore(stored.fiveJump_distance) : null;

  return {
    firstName: stored.firstName,
    lastName: stored.lastName,
    sprint30m_time: stored.sprint30m_time,
    sprint30m_score,
    medicineBall_forward: stored.medicineBall_forward,
    medicineBall_backward: stored.medicineBall_backward,
    medicineBall_sum,
    medicineBall_score,
    fiveJump_distance: stored.fiveJump_distance,
    fiveJump_score,
    handThrow_distance: stored.handThrow_distance,
    handThrow_score: stored.handThrow_score,
    envelope_time: stored.envelope_time,
    envelope_score: stored.envelope_score,
  };
}

/** Get the files index from localStorage */
export function listFiles(): SavedFileInfo[] {
  try {
    const raw = localStorage.getItem(FILES_INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedFileInfo[];
  } catch {
    return [];
  }
}

/** Save the files index */
function saveIndex(files: SavedFileInfo[]): void {
  localStorage.setItem(FILES_INDEX_KEY, JSON.stringify(files));
}

/** Save file data to localStorage (creates or updates) */
export function saveFile(id: string, name: string, groups: Group[]): void {
  const storedGroups: StoredGroup[] = groups.map((g) => ({
    name: g.name,
    players: g.players.map(stripComputed),
  }));

  localStorage.setItem(FILE_DATA_PREFIX + id, JSON.stringify(storedGroups));

  const files = listFiles();
  const existing = files.findIndex((f) => f.id === id);
  const info: SavedFileInfo = { id, name, lastModified: new Date().toISOString() };

  if (existing >= 0) {
    files[existing] = info;
  } else {
    files.push(info);
  }
  saveIndex(files);
}

/** Load file data from localStorage */
export function loadFile(id: string): Group[] | null {
  try {
    const raw = localStorage.getItem(FILE_DATA_PREFIX + id);
    if (!raw) return null;
    const storedGroups = JSON.parse(raw) as StoredGroup[];
    return storedGroups.map((g) => ({
      name: g.name,
      players: g.players.map(recompute),
    }));
  } catch {
    return null;
  }
}

/** Delete a file from localStorage */
export function deleteFile(id: string): void {
  localStorage.removeItem(FILE_DATA_PREFIX + id);
  const files = listFiles().filter((f) => f.id !== id);
  saveIndex(files);
}

/** Create a new file and return its ID */
export function createFile(name: string): string {
  const id = generateId();
  const info: SavedFileInfo = { id, name, lastModified: new Date().toISOString() };
  const files = listFiles();
  files.push(info);
  saveIndex(files);
  localStorage.setItem(FILE_DATA_PREFIX + id, JSON.stringify([]));
  return id;
}

/** Rename a file */
export function renameFile(id: string, newName: string): void {
  const files = listFiles();
  const file = files.find((f) => f.id === id);
  if (file) {
    file.name = newName;
    saveIndex(files);
  }
}
