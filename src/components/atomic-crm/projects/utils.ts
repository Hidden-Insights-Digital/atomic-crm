import type { Project, Step } from './types';

// Whole days elapsed since an ISO date or date-only string. Null-safe.
export function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const then = new Date(dateStr.length <= 10 ? dateStr + 'T00:00:00' : dateStr);
  const ms = Date.now() - then.getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

// The first not-yet-done step in delivery order.
export function nextStep(p: Project): Step | null {
  return [...p.steps].sort((a, b) => a.position - b.position).find((s) => !s.done) ?? null;
}

// "Davies Joinery website build" -> "Davies Joinery"
export function shortName(name: string): string {
  return name.replace(/\s+website build$/i, '');
}
