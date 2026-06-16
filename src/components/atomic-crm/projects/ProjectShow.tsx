import { useEffect, useState } from 'react';
import {
  ShowBase,
  useGetIdentity,
  useGetList,
  useGetOne,
  useNotify,
  useShowContext,
  useUpdate,
} from 'ra-core';
import { Link } from 'react-router';
import { AlertTriangle, ArrowLeft, Check, ExternalLink } from 'lucide-react';

import { OWNERS, PHASES, STAGE_DEFS, type Deal, type Project, type Step } from './types';
import { daysSince, shortName } from './utils';
import { ZohoActivityList } from '../feed/ZohoActivityList';
import './cockpit.css';

const FRESH = { staleTime: 30_000, refetchOnWindowFocus: true } as const;

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}
const today = () => new Date().toISOString().slice(0, 10);

/**
 * Project detail — the `projects` resource `show`. Bespoke (editable blocker,
 * per-stage notes, money/ops strip, embedded Zoho activity), reading and
 * writing through ra-core hooks. Reached from the cockpit's project cards.
 */
export const ProjectShow = () => (
  <ShowBase>
    <ProjectShowContent />
  </ShowBase>
);

const ProjectShowContent = () => {
  const { record, isPending } = useShowContext<Project>();
  const projectId = record?.id;
  const dealId = record?.deal_id;

  const { data: steps } = useGetList<Step>(
    'project_steps',
    {
      filter: projectId != null ? { project_id: projectId } : {},
      sort: { field: 'position', order: 'ASC' },
      pagination: { page: 1, perPage: 1000 },
    },
    { ...FRESH, enabled: projectId != null },
  );

  const { data: deal } = useGetOne<Deal>(
    'deals',
    { id: dealId ?? 0 },
    { enabled: dealId != null },
  );

  const { identity } = useGetIdentity();
  const notify = useNotify();
  const [updateProject] = useUpdate();
  const [updateStep] = useUpdate();

  const [blocker, setBlocker] = useState(record?.blocker ?? '');
  // Reset the editor only when navigating to a different project (keyed on id),
  // never on a background refetch, so it can't clobber text the user is editing.
  useEffect(() => {
    setBlocker(record?.blocker ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id]);

  if (isPending || !record) return null;

  const ordered = [...(steps ?? [])].sort((a, b) => a.position - b.position);
  const currentId = ordered.find((s) => !s.done)?.id ?? null;
  const total = ordered.length || record.steps_total;
  const done = ordered.filter((s) => s.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const blockerChanged = blocker.trim() !== (record.blocker ?? '');

  const saveBlocker = () => {
    const v = blocker.trim();
    updateProject(
      'projects',
      {
        id: record.id,
        data: {
          blocker: v || null,
          blocker_since: v ? (record.blocker ? record.blocker_since : today()) : null,
        },
        previousData: record,
      },
      {
        mutationMode: 'optimistic',
        onError: () => notify('Could not save the blocker.', { type: 'error' }),
      },
    );
  };

  const togglePaid = () => {
    updateProject(
      'projects',
      { id: record.id, data: { paid: !record.paid }, previousData: record },
      {
        mutationMode: 'optimistic',
        onError: () => notify('Could not update payment status.', { type: 'error' }),
      },
    );
  };

  const toggleStep = (step: Step) => {
    const isDone = !step.done;
    updateStep(
      'project_steps',
      {
        id: step.id,
        data: {
          done: isDone,
          done_at: isDone ? new Date().toISOString() : null,
          done_by: isDone ? (identity?.id ?? null) : null,
        },
        previousData: step,
      },
      {
        mutationMode: 'optimistic',
        onError: () => notify('Could not update that stage.', { type: 'error' }),
      },
    );
  };

  const saveNote = (step: Step, notes: string) => {
    if (notes.trim() === (step.notes ?? '')) return;
    updateStep(
      'project_steps',
      { id: step.id, data: { notes: notes.trim() || null }, previousData: step },
      {
        mutationMode: 'optimistic',
        onError: () => notify('Could not save the note.', { type: 'error' }),
      },
    );
  };

  return (
    <div className="hid-cockpit">
      <Link className="back-link" to="/">
        <ArrowLeft size={15} /> Board
      </Link>

      <div className="detail-head">
        <h1>{shortName(record.name)}</h1>
        <span className={`status-pill ${record.status === 'live' ? 'live' : ''}`}>
          {record.status === 'live' ? 'live' : 'in build'}
        </span>
        <span className="spacer" />
        <span className="links">
          {record.live_url && (
            <a className="link" href={record.live_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} /> Visit site
            </a>
          )}
          {record.deal_id != null && (
            <Link className="link" to={`/deals/${record.deal_id}/show`}>
              Deal
            </Link>
          )}
        </span>
      </div>

      <div className="progress">
        <div className="progressbar">
          <span style={{ width: `${pct}%` }} />
        </div>
        <span className="progress-count">
          <b>{String(done).padStart(2, '0')}</b> / {total} done
        </span>
      </div>

      <div className="facts">
        <Fact label="Build fee" value={record.build_fee != null ? `$${record.build_fee}` : '—'} />
        <Fact
          label="Care / month"
          value={record.care_monthly != null ? `$${record.care_monthly}` : '—'}
        />
        <Fact
          label="Expected close"
          value={fmtDate(deal?.expected_closing_date ?? null) || '—'}
        />
        <Fact
          label="Owner"
          value={record.sales_id != null ? (OWNERS[record.sales_id] ?? '—') : '—'}
        />
        {record.domain && <Fact label="Domain" value={record.domain} />}
      </div>

      <div className="moneyops">
        <button
          className={`pay-toggle ${record.paid ? 'is-paid' : ''}`}
          onClick={togglePaid}
          aria-pressed={record.paid}
        >
          {record.paid ? (
            <>
              <Check size={14} /> Paid in full
            </>
          ) : (
            'Mark paid in full'
          )}
        </button>
        {record.status === 'live' && (
          <span
            className={`site-status ${
              record.site_up ? 'up' : record.site_up === false ? 'down' : 'unknown'
            }`}
          >
            <span className="dot" aria-hidden="true" />
            {record.site_up
              ? 'Site up'
              : record.site_up === false
                ? 'Site down'
                : 'Site status unknown'}
            {record.ops_checked_at ? ` · checked ${fmtDate(record.ops_checked_at)}` : ''}
          </span>
        )}
      </div>

      <div className="blocker-editor">
        <label htmlFor="blocker">
          <AlertTriangle size={14} /> What's blocking go-live
        </label>
        <textarea
          id="blocker"
          rows={2}
          placeholder="e.g. waiting on the client for photos and opening hours…"
          value={blocker}
          onChange={(e) => setBlocker(e.target.value)}
        />
        <div className="blocker-editor-foot">
          <span className="hint">
            {record.blocker && record.blocker_since
              ? `set ${daysSince(record.blocker_since)} days ago`
              : "leave empty if nothing's blocking"}
          </span>
          <button className="btn-save" onClick={saveBlocker} disabled={!blockerChanged}>
            Save
          </button>
        </div>
      </div>

      <h2 className="section-label">Activity</h2>
      <ZohoActivityList
        companyId={record.company_id}
        empty="No calls, emails or tickets linked to this client yet."
      />

      <h2 className="section-label">Stages</h2>
      {PHASES.map((phase) => {
        const inPhase = ordered.filter((s) => s.phase === phase);
        if (!inPhase.length) return null;
        return (
          <div className="phase-group" key={phase}>
            <div className="phase-label">{phase}</div>
            {inPhase.map((s) => (
              <StepRow
                key={s.id}
                step={s}
                current={s.id === currentId}
                onToggle={() => toggleStep(s)}
                onSaveNote={(notes) => saveNote(s, notes)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <div className="fact-label">{label}</div>
      <div className="fact-value">{value}</div>
    </div>
  );
}

function StepRow({
  step: s,
  current,
  onToggle,
  onSaveNote,
}: {
  step: Step;
  current: boolean;
  onToggle: () => void;
  onSaveNote: (notes: string) => void;
}) {
  // Initialised once per step (the row is keyed by s.id, so it remounts when
  // navigating to a different project's steps). No content resync: that would
  // clobber an in-progress note on a background refetch.
  const [note, setNote] = useState(s.notes ?? '');

  const state = s.done ? 'is-done' : current ? 'is-current' : 'is-todo';
  const who = s.done ? (s.done_by != null ? (OWNERS[s.done_by] ?? null) : 'auto') : null;

  return (
    <div className={`step-row ${state}`}>
      <button
        className="step-toggle"
        onClick={onToggle}
        aria-pressed={s.done}
        aria-label={`${s.label}: ${s.done ? 'done' : 'not done'}. Mark ${
          s.done ? 'not done' : 'done'
        }.`}
      >
        {s.done && <Check size={13} strokeWidth={3} />}
      </button>
      <div className="step-body">
        <div className="step-head">
          <span className="step-label">{s.label}</span>
          {s.done && (
            <span className="step-meta">
              done {fmtDate(s.done_at)}
              {who ? ` · ${who}` : ''}
            </span>
          )}
        </div>
        <div className="step-def">{STAGE_DEFS[s.stage_key] ?? ''}</div>
        <input
          className="step-note"
          type="text"
          placeholder="Add a note…"
          aria-label={`Note for stage: ${s.label}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => onSaveNote(note)}
        />
      </div>
    </div>
  );
}
