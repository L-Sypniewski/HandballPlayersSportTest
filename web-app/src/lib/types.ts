export interface Player {
  firstName: string;
  lastName: string;
  sprint30m_time: number | null;
  sprint30m_score: number | null;
  medicineBall_forward: number | null;
  medicineBall_backward: number | null;
  medicineBall_sum: number | null;
  medicineBall_score: number | null;
  fiveJump_distance: number | null;
  fiveJump_score: number | null;
  handThrow_distance: number | null;
  handThrow_score: number | null;
  envelope_time: number | null;
  envelope_score: number | null;
}

export interface Group {
  name: string;
  players: Player[];
}

export function createEmptyPlayer(): Player {
  return {
    firstName: '',
    lastName: '',
    sprint30m_time: null,
    sprint30m_score: null,
    medicineBall_forward: null,
    medicineBall_backward: null,
    medicineBall_sum: null,
    medicineBall_score: null,
    fiveJump_distance: null,
    fiveJump_score: null,
    handThrow_distance: null,
    handThrow_score: null,
    envelope_time: null,
    envelope_score: null,
  };
}

// Sample players for tour demonstration
export const SAMPLE_PLAYERS: Player[] = [
  {
    firstName: 'Jan',
    lastName: 'Kowalski',
    sprint30m_time: 4.2,
    sprint30m_score: 56,
    medicineBall_forward: 8.5,
    medicineBall_backward: 9.2,
    medicineBall_sum: 17.7,
    medicineBall_score: 45,
    fiveJump_distance: 12.3,
    fiveJump_score: 38,
    handThrow_distance: 25.5,
    handThrow_score: 42,
    envelope_time: 15.3,
    envelope_score: 35,
  },
  {
    firstName: 'Piotr',
    lastName: 'Nowak',
    sprint30m_time: 3.9,
    sprint30m_score: 68,
    medicineBall_forward: 9.1,
    medicineBall_backward: 9.8,
    medicineBall_sum: 18.9,
    medicineBall_score: 52,
    fiveJump_distance: 13.1,
    fiveJump_score: 44,
    handThrow_distance: 28.2,
    handThrow_score: 48,
    envelope_time: 14.1,
    envelope_score: 42,
  },
  {
    firstName: 'Adam',
    lastName: 'Wiśniewski',
    sprint30m_time: 4.5,
    sprint30m_score: 44,
    medicineBall_forward: 7.8,
    medicineBall_backward: 8.4,
    medicineBall_sum: 16.2,
    medicineBall_score: 38,
    fiveJump_distance: 11.5,
    fiveJump_score: 32,
    handThrow_distance: 22.1,
    handThrow_score: 35,
    envelope_time: 16.8,
    envelope_score: 28,
  },
];
