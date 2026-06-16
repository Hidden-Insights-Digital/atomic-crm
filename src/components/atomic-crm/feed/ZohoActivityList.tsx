import { useGetList } from 'ra-core';
import { ExternalLink, FileText, Mail, MessageSquare, Phone } from 'lucide-react';

import { KIND_LABEL, type Activity } from '../projects/types';

// Keep persisted (PWA) caches honest, same posture as the cockpit.
const FRESH = { staleTime: 30_000, refetchOnWindowFocus: true } as const;

function kindIcon(kind: string | null) {
  switch (kind) {
    case 'call':
      return <Phone size={15} />;
    case 'chat':
      return <MessageSquare size={15} />;
    case 'form':
      return <FileText size={15} />;
    default:
      return <Mail size={15} />;
  }
}

function fmtWhen(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

/**
 * Presentational Zoho activity feed. Takes already-loaded items and renders
 * them; each row links out to the underlying Zoho Desk record.
 */
export function ActivityFeed({ items, empty }: { items: Activity[]; empty?: string }) {
  if (!items.length) {
    return <div className="activity-empty">{empty ?? 'No activity yet.'}</div>;
  }
  return (
    <div className="activity-feed">
      {items.map((a) => {
        const contact = a.contact_email || a.contact_phone;
        return (
          <a
            key={a.id}
            className={`activity-item kind-${a.kind ?? 'ticket'}`}
            href={a.web_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="activity-icon" aria-hidden="true">
              {kindIcon(a.kind)}
            </span>
            <span className="activity-main">
              <span className="activity-subject">{a.subject || '(no subject)'}</span>
              <span className="activity-meta">
                {KIND_LABEL[a.kind ?? 'ticket'] ?? a.kind}
                {a.status ? ` · ${a.status}` : ''}
                {contact ? ` · ${contact}` : ''}
              </span>
            </span>
            <span className="activity-when">{fmtWhen(a.occurred_at)}</span>
            <span className="activity-ext" aria-hidden="true">
              <ExternalLink size={14} />
            </span>
          </a>
        );
      })}
    </div>
  );
}

/**
 * Data-connected activity feed. Reads the `activity` resource through ra-core.
 *
 * - `companyId={number}` scopes it to one client (used in the project detail).
 * - `companyId={null}` (a project with no linked company) shows nothing.
 * - `companyId` omitted = the full cross-client feed.
 *
 * Today the only call site is inside ProjectShow's `.hid-cockpit` wrapper. The
 * standalone full-feed route lands in Phase 5; whoever wires it must render this
 * inside a `.hid-cockpit` element, since the `.activity-*` styles are scoped to it.
 */
export const ZohoActivityList = ({
  companyId,
  empty,
}: {
  companyId?: number | null;
  empty?: string;
}) => {
  // undefined = unfiltered (the full cross-client feed); a number = that client;
  // null = the project has no linked company, so there is nothing to show.
  const noCompany = companyId === null;

  const { data, isPending, error } = useGetList<Activity>(
    'activity',
    {
      filter: typeof companyId === 'number' ? { company_id: companyId } : {},
      sort: { field: 'occurred_at', order: 'DESC' },
      pagination: { page: 1, perPage: 100 },
    },
    { ...FRESH, enabled: !noCompany },
  );

  if (noCompany) return <ActivityFeed items={[]} empty={empty} />;
  if (isPending) return <div className="activity-empty">Loading activity…</div>;
  if (error) return <div className="activity-empty">Could not load activity.</div>;

  return <ActivityFeed items={data ?? []} empty={empty} />;
};
