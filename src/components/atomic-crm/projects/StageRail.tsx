import { Check } from 'lucide-react';

import { PHASES, type Step } from './types';

interface Props {
  steps: Step[];
  onToggle: (stepId: number, done: boolean) => void;
}

// The signature element: every delivery stage as a tappable chip, grouped by
// phase. Tap a chip to mark its stage done (or not done). The first not-done
// stage is highlighted as "current".
export function StageRail({ steps, onToggle }: Props) {
  const ordered = [...steps].sort((a, b) => a.position - b.position);
  const current = ordered.find((s) => !s.done)?.id ?? null;

  return (
    <div className="phases">
      {PHASES.map((phase) => {
        const inPhase = ordered.filter((s) => s.phase === phase);
        if (!inPhase.length) return null;
        return (
          <div className="phase" key={phase}>
            <div className="phase-label">{phase}</div>
            <div className="chips">
              {inPhase.map((s) => {
                const state = s.done
                  ? 'is-done'
                  : s.id === current
                    ? 'is-current'
                    : 'is-todo';
                return (
                  <button
                    key={s.id}
                    className={`chip ${state}`}
                    title={s.label}
                    aria-pressed={s.done}
                    aria-label={`${s.label}: ${s.done ? 'done' : 'not done'}. Mark ${
                      s.done ? 'not done' : 'done'
                    }.`}
                    onClick={() => onToggle(s.id, !s.done)}
                  >
                    <span className="node">{s.done && <Check size={11} strokeWidth={3} />}</span>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
