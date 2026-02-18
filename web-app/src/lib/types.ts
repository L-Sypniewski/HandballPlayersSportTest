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
