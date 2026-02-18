export function calculateSprint30mScore(time: number): number {
  if (time <= 3.70) return 80;

  // 3.70 to 4.60: each 0.02s increment = -1 point, from 80 down to 35
  if (time < 4.60) {
    const steps = Math.floor((time - 3.70) / 0.02);
    const score = 80 - steps;
    return Math.max(score, 35);
  }

  // 4.60 to 5.20: each 0.04s increment = -1 point, from 34 down to 20
  if (time < 5.20) {
    const steps = Math.floor((time - 4.60) / 0.04);
    const score = 34 - steps;
    return Math.max(score, 20);
  }

  // 5.20 to 5.50: each 0.05s increment = -1 point, from 19 down to 14
  if (time < 5.50) {
    const steps = Math.floor((time - 5.20) / 0.05);
    const score = 19 - steps;
    return Math.max(score, 14);
  }

  // 5.50 to 5.90: each 0.10s increment = -1 point, from 13 down to 10
  if (time < 5.90) {
    const steps = Math.floor((time - 5.50) / 0.10);
    const score = 13 - steps;
    return Math.max(score, 10);
  }

  // > 5.90
  return 0;
}
