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

/**
 * Calculate score for Medicine Ball 2kg throw (sum of forward + backward)
 * Based on: Test sprawności ukierunkowanej – J. Noszczaka
 *
 * Scoring table:
 * - 80 pts: ≥30.00m
 * - 79-35 pts: 29.80-21.00m (0.20m steps)
 * - 34-20 pts: 20.80-18.00m (0.20m steps)
 * - 19-14 pts: 17.80-16.60m (0.20m steps)
 * - 13-10 pts: 16.00-14.50m (0.50m steps)
 * - 0 pts: <14.50m
 */
export function calculateMedicineBallScore(sum: number): number {
  if (sum >= 30.00) return 80;

  const EPS = 1e-9;

  // [21.00, 30.00): each 0.20m bucket, scores: 79, 78, ..., 35
  if (sum >= 21.00 - EPS) {
    const steps = Math.floor((30.00 - sum) / 0.20 + EPS);
    return Math.max(80 - steps, 35);
  }

  // [18.00, 21.00): each 0.20m bucket, scores: 34, 33, ..., 20
  if (sum >= 18.00 - EPS) {
    const steps = Math.floor((21.00 - sum) / 0.20 + EPS);
    return Math.max(35 - steps, 20);
  }

  // [16.60, 18.00): each 0.20m bucket, scores: 19, 18, ..., 14
  if (sum >= 16.60 - EPS) {
    const steps = Math.floor((18.00 - sum) / 0.20 + EPS);
    return Math.max(20 - steps, 14);
  }

  // [14.50, 16.60): each 0.50m bucket, scores: 13, 12, 11, 10
  if (sum >= 14.50 - EPS) {
    const steps = Math.floor((16.60 - sum) / 0.50 + EPS);
    return Math.max(14 - steps, 10);
  }

  // < 14.50
  return 0;
}

/**
 * Calculate score for Five-Jump (pięcioskok)
 * Based on: Test sprawności ukierunkowanej – J. Noszczaka
 *
 * Scoring table:
 * - 80 pts: ≥13.50m
 * - 79-40 pts: 13.45-11.50m (0.05m steps)
 * - 39-35 pts: 11.40-11.00m (0.10m steps)
 * - 34-20 pts: 10.90-9.50m (0.10m steps)
 * - 19-10 pts: 9.40-7.80m (0.20m steps)
 * - 0 pts: <7.80m
 */
export function calculateFiveJumpScore(distance: number): number {
  if (distance >= 13.50) return 80;

  const EPS = 1e-9;

  // [11.50, 13.50): each 0.05m bucket, scores: 79, 78, ..., 40
  if (distance >= 11.50 - EPS) {
    const steps = Math.floor((13.50 - distance) / 0.05 + EPS);
    return Math.max(80 - steps, 40);
  }

  // [11.00, 11.50): each 0.10m bucket, scores: 39, 38, ..., 35
  if (distance >= 11.00 - EPS) {
    const steps = Math.floor((11.50 - distance) / 0.10 + EPS);
    return Math.max(40 - steps, 35);
  }

  // [9.50, 11.00): each 0.10m bucket, scores: 34, 33, ..., 20
  if (distance >= 9.50 - EPS) {
    const steps = Math.floor((11.00 - distance) / 0.10 + EPS);
    return Math.max(35 - steps, 20);
  }

  // [7.80, 9.50): each 0.20m bucket, scores: 19, 18, ..., 10
  if (distance >= 7.80 - EPS) {
    const steps = Math.floor((9.50 - distance) / 0.20 + EPS);
    return Math.max(20 - steps, 10);
  }

  // < 7.80
  return 0;
}
