export type StatHealth = 'success' | 'warning' | 'error';

/** Higher percentage is better (coverage, achievement). Aligned with sales-insights rules (80/70). */
export function pctHealth(pct: number, goodMin = 80, warnMin = 70): StatHealth {
  if (pct >= goodMin) return 'success';
  if (pct >= warnMin) return 'warning';
  return 'error';
}

/** Lower count is better (missed calls, drafts, pending). */
export function countHealth(count: number, warnAt = 1, errorAt = 5): StatHealth {
  if (count === 0) return 'success';
  if (count < errorAt) return 'warning';
  return 'error';
}
