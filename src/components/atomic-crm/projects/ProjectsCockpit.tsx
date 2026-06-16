import { useMemo } from 'react';
import { useGetList, useGetIdentity, useUpdate, useNotify } from 'ra-core';
import { Link, useNavigate } from 'react-router';
import { AlertTriangle, Check, ChevronRight, ExternalLink } from 'lucide-react';

import { OWNERS, type Project, type Step } from './types';
import { daysSince, nextStep, shortName } from './utils';
import { StageRail } from './StageRail';
import './cockpit.css';

// Keep persisted (PWA) caches honest: revalidate on focus, treat data as stale
// after 30s so Adrian never acts on an old board after reopening the app.
const FRESH = { staleTime: 30_000, refetchOnWindowFocus: true } as const;

/**
 * Delivery cockpit — the landing dashboard of the unified CRM.
 *
 * Reads the `projects` and `project_steps` resources through ra-core's data
 * provider, joins steps onto projects client-side, and lets either cofounder
 * tick a delivery stage straight from the board (optimistic write).
 */
export const ProjectsCockpit = () => {
  const {
    data: projects,
    isPending: projectsPending,
    error: projectsError,
  } = useGetList<Project>(
    'projects',
    {
      filter: { 'archived_at@is': null },
      sort: { field: 'id', order: 'ASC' },
      pagination: { page: 1, perPage: 1000 },
    },
    FRESH,
  );

  const { data: allSteps, isPending: stepsPending } = useGetList<Step>(
    'project_steps',
    {
      sort: { field: 'position', order: 'ASC' },
      pagination: { page: 1, perPage: 1000 },
    },
    FRESH,
  );

  const { identity } = useGetIdentity();
  const notify = useNotify();
  const [update] = useUpdate();
  const navigate = useNavigate();

  // Join steps onto their project. Progress is derived from this array (not the
  // denormalised projects.steps_done) so an optimistic tick shows immediately.
  const board: Project[] = useMemo(() => {
    if (!projects) return [];
    const steps = allSteps ?? [];
    return projects.map((p) => ({
      ...p,
      steps: steps.filter((s) => s.project_id === p.id),
    }));
  }, [projects, allSteps]);

  const onToggle = (stepId: number, done: boolean) => {
    const step = (allSteps ?? []).find((s) => s.id === stepId);
    if (!step) return;
    update(
      'project_steps',
      {
        id: stepId,
        data: {
          done,
          done_at: done ? new Date().toISOString() : null,
          // Stamp who ticked it, but only if we resolved a sales identity.
          done_by: done ? (identity?.id ?? null) : null,
        },
        previousData: step,
      },
      {
        mutationMode: 'optimistic',
        onError: () =>
          notify('Could not update that stage. Please try again.', { type: 'error' }),
      },
    );
  };

  const onOpen = (id: number) => navigate(`/projects/${id}/show`);

  if (projectsError) {
    return (
      <div className="hid-cockpit">
        <div className="errbox">Could not load the delivery board. Please refresh.</div>
      </div>
    );
  }

  if (projectsPending || stepsPending) {
    return (
      <div className="hid-cockpit">
        <div className="center">Loading the board…</div>
      </div>
    );
  }

  const live = board.filter((p) => p.status === 'live');
  const mrr = live.reduce((sum, p) => sum + (p.care_monthly ?? 0), 0);
  const owed = live
    .filter((p) => !p.paid)
    .reduce((sum, p) => sum + (p.build_fee ?? 0), 0);
  const booked = board.reduce((sum, p) => sum + (p.build_fee ?? 0), 0);
  const sitesUp = live.filter((p) => p.site_up === true).length;
  const blockers = board
    .filter((p) => p.blocker)
    .sort((a, b) => (daysSince(b.blocker_since) ?? 0) - (daysSince(a.blocker_since) ?? 0));

  return (
    <div className="hid-cockpit">
      <div className="pagehead">
        <h1>Delivery</h1>
        <p>Every client, every stage. Tick a stage to mark it done.</p>
      </div>

      <div className="metrics">
        <Metric label="Care / month" value={`$${mrr}`} />
        <Metric label="Owed now" value={`$${owed}`} />
        <Metric label="Booked" value={`$${booked}`} />
        <Metric label="Sites up" value={live.length ? `${sitesUp}/${live.length}` : '—'} />
      </div>

      <h2 className="section-label">What's blocking go-live</h2>
      {blockers.length === 0 ? (
        <div className="blocker-row ok">
          <span className="what">
            <Check size={15} className="ico" />
            Nothing blocking. Every project is on track.
          </span>
        </div>
      ) : (
        blockers.map((p) => {
          const age = daysSince(p.blocker_since);
          return (
            <div className="blocker-row" key={p.id}>
              <span className="who">{shortName(p.name)}</span>
              <span className="what">
                <AlertTriangle size={15} className="ico" />
                {p.blocker}
              </span>
              {p.sales_id != null && (
                <span className="owner-pill">{OWNERS[p.sales_id] ?? '—'}</span>
              )}
              {age != null && <span className="age">{age}d</span>}
            </div>
          );
        })
      )}

      <h2 className="section-label">Projects</h2>
      {board.map((p) => (
        <ProjectCard key={p.id} project={p} onToggle={onToggle} onOpen={onOpen} />
      ))}
    </div>
  );
};

function ProjectCard({
  project: p,
  onToggle,
  onOpen,
}: {
  project: Project;
  onToggle: (stepId: number, done: boolean) => void;
  onOpen: (id: number) => void;
}) {
  const total = p.steps.length || p.steps_total;
  const done = p.steps.filter((s) => s.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const next = nextStep(p);
  const age = daysSince(p.blocker_since);

  return (
    <div className="card">
      <div className="card-head">
        <h3 className="proj-name">
          <button className="proj-name-btn" onClick={() => onOpen(p.id)}>
            {shortName(p.name)}
          </button>
        </h3>
        <span className={`status-pill ${p.status === 'live' ? 'live' : ''}`}>
          {p.status === 'live' ? 'live' : 'in build'}
        </span>
        <span className="spacer" />
        <span className="links">
          <button className="link link-btn" onClick={() => onOpen(p.id)}>
            Open <ChevronRight size={14} />
          </button>
          {p.live_url && (
            <a className="link" href={p.live_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} /> Visit site
            </a>
          )}
          {p.deal_id != null && (
            <Link className="link" to={`/deals/${p.deal_id}/show`}>
              Deal <ChevronRight size={14} />
            </Link>
          )}
        </span>
      </div>

      <div className="progress">
        <div className="progressbar">
          <span style={{ width: `${pct}%` }} />
        </div>
        <span className="progress-count">
          <b>{String(done).padStart(2, '0')}</b> / {total}
        </span>
      </div>

      {p.blocker ? (
        <div className="cardblocker">
          <AlertTriangle size={15} />
          {p.blocker}
          {age != null && <span className="age">· {age} days</span>}
        </div>
      ) : (
        next && (
          <div className="cardblocker ok">
            <Check size={15} />
            On track. Next: {next.label}
          </div>
        )
      )}

      <StageRail steps={p.steps} onToggle={onToggle} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
}
