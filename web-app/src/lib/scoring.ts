export function calculateSprint30mScore(time: number): number {
  if (time <= 3.70) return 80;

  const EPS = 1e-9;

  // (3.70, 4.60]: each 0.02s bucket, scores: 79, 78, ..., 35
  if (time <= 4.60 + EPS) {
    const steps = Math.ceil((time - 3.70) / 0.02 - EPS);
    return Math.max(80 - steps, 35);
  }

  // (4.60, 5.20]: each 0.04s bucket, scores: 34, 33, ..., 20
  if (time <= 5.20 + EPS) {
    const steps = Math.ceil((time - 4.60) / 0.04 - EPS);
    return Math.max(35 - steps, 20);
  }

  // (5.20, 5.50]: each 0.05s bucket, scores: 19, 18, ..., 14
  if (time <= 5.50 + EPS) {
    const steps = Math.ceil((time - 5.20) / 0.05 - EPS);
    return Math.max(20 - steps, 14);
  }

  // (5.50, 5.90]: each 0.10s bucket, scores: 13, 12, 11, 10
  if (time <= 5.90 + EPS) {
    const steps = Math.ceil((time - 5.50) / 0.10 - EPS);
    return Math.max(14 - steps, 10);
  }

  // > 5.90
  return 0;
}
