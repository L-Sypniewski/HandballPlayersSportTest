import ExcelJS from 'exceljs';
import type { Group, Player } from './types';

const COLUMNS = [
  'Imię',
  'Nazwisko',
  'Czas Biegu 30m',
  'Punkty Bieg 30m',
  'Rzut Piłką Lek. Do Przodu',
  'Rzut Piłką Lek. Do Tyłu',
  'Suma Rzutów Piłką Lek.',
  'Punkty Rzut Piłką Lek.',
  'Dystans Pięcioskoku',
  'Punkty Pięcioskok',
  'Dystans Rzutu Ręcznego',
  'Punkty Rzut Ręczny',
  'Czas Testu Koperta',
  'Punkty Test Koperta',
];

const PLAYER_KEYS: (keyof Player)[] = [
  'firstName',
  'lastName',
  'sprint30m_time',
  'sprint30m_score',
  'medicineBall_forward',
  'medicineBall_backward',
  'medicineBall_sum',
  'medicineBall_score',
  'fiveJump_distance',
  'fiveJump_score',
  'handThrow_distance',
  'handThrow_score',
  'envelope_time',
  'envelope_score',
];

export async function readExcelFile(file: File): Promise<Group[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const groups: Group[] = [];

  workbook.eachSheet((worksheet) => {
    const players: Player[] = [];
    let isFirstRow = true;

    worksheet.eachRow((row) => {
      if (isFirstRow) {
        isFirstRow = false;
        return;
      }

      const values = row.values as (string | number | null)[];
      // ExcelJS row.values is 1-indexed (index 0 is undefined)
      const player: Player = {
        firstName: String(values[1] ?? ''),
        lastName: String(values[2] ?? ''),
        sprint30m_time: toNum(values[3]),
        sprint30m_score: toNum(values[4]),
        medicineBall_forward: toNum(values[5]),
        medicineBall_backward: toNum(values[6]),
        medicineBall_sum: toNum(values[7]),
        medicineBall_score: toNum(values[8]),
        fiveJump_distance: toNum(values[9]),
        fiveJump_score: toNum(values[10]),
        handThrow_distance: toNum(values[11]),
        handThrow_score: toNum(values[12]),
        envelope_time: toNum(values[13]),
        envelope_score: toNum(values[14]),
      };

      players.push(player);
    });

    groups.push({ name: worksheet.name, players });
  });

  return groups;
}

export async function writeExcelFile(groups: Group[]): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();

  for (const group of groups) {
    const worksheet = workbook.addWorksheet(group.name);

    // Add header row
    worksheet.addRow(COLUMNS);

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };

    // Add player rows
    for (const player of group.players) {
      const row = PLAYER_KEYS.map((key) => player[key] ?? '');
      worksheet.addRow(row);
    }

    // Auto-fit column widths
    worksheet.columns.forEach((column, i) => {
      column.width = Math.max(COLUMNS[i].length + 2, 14);
    });
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

function toNum(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}
