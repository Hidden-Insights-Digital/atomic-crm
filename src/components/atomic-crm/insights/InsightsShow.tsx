// src/components/atomic-crm/insights/InsightsShow.tsx

import { ShowBase, useShowContext } from 'ra-core';
import { Link } from 'react-router';
import { ExternalLink, Building2, MapPin, Phone, Globe, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ── Tier config ───────────────────────────────────────────────────────────────

const TIERS: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  green:  { label: 'Tier 1', dot: 'bg-green-500',  bg: 'bg-green-100 dark:bg-green-900/40',   text: 'text-green-800 dark:text-green-300'  },
  yellow: { label: 'Tier 2', dot: 'bg-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300' },
  orange: { label: 'Tier 3', dot: 'bg-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-800 dark:text-orange-300' },
  red:    { label: 'Tier 4', dot: 'bg-red-500',    bg: 'bg-red-100 dark:bg-red-900/40',       text: 'text-red-800 dark:text-red-300'       },
};

const TierBadge = ({ tier }: { tier: string | null }) => {
  if (!tier || !TIERS[tier]) return null;
  const { label, dot, bg, text } = TIERS[tier];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${bg} ${text}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

// ── Score breakdown (collapsible) ─────────────────────────────────────────────

const ScoreBar = ({ label, score, max = 100 }: { label: string; score: number | null; max?: number }) => {
  const pct = score != null ? Math.round((score / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score ?? '—'}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const ScoreBreakdown = ({ record }: { record: any }) => (
  <details className="mt-2 group">
    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground list-none flex items-center gap-1 select-none">
      <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
      Score breakdown
    </summary>
    <div className="mt-3 flex flex-col gap-3 pt-2 border-t">
      <ScoreBar label="Website" score={record.website_score} />
      <ScoreBar label="Google"  score={record.google_score} />
      <ScoreBar label="Social"  score={record.social_score} />
      <ScoreBar label="Content" score={record.content_score} />
      <ScoreBar label="Reviews" score={record.review_score} />
    </div>
  </details>
);

// ── JSON list ─────────────────────────────────────────────────────────────────

const JsonList = ({ data, emptyText }: { data: any; emptyText: string }) => {
  const items: string[] = Array.isArray(data)
    ? data
    : typeof data === 'string'
    ? JSON.parse(data)
    : [];
  if (!items.length) return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  return (
    <ul className="list-disc list-inside space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm">{item}</li>
      ))}
    </ul>
  );
};

// ── Main show ─────────────────────────────────────────────────────────────────

export const InsightsShow = () => (
  <ShowBase>
    <InsightsShowContent />
  </ShowBase>
);

const InsightsShowContent = () => {
  const { record, isPending } = useShowContext();
  if (isPending || !record) return null;

  const mapsUrl = record.place_id
    ? `https://www.google.com/maps/place/?q=place_id:${record.place_id}`
    : null;

  return (
    <div className="mt-2 flex flex-col gap-4 pb-8 max-w-4xl">

      {/* Back link */}
      <Link
        to="/insights"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft size={16} />
        Back to Insights
      </Link>

      {/* Header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold">{record.name}</h1>

              {/* CRM company link — same style as address */}
              {record.crm_company_id && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 size={14} />
                  <Link
                    to={`/companies/${record.crm_company_id}/show`}
                    className="hover:underline"
                  >
                    View linked company in CRM
                  </Link>
                </div>
              )}

              {record.address && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  {mapsUrl ? (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                      {record.address}
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    record.address
                  )}
                </div>
              )}

              {record.phone && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone size={14} />
                  <a href={`tel:${record.phone}`} className="hover:underline">{record.phone}</a>
                </div>
              )}
            </div>

            {/* Tier + score + collapsible breakdown */}
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <TierBadge tier={record.tier} />
              {record.total_score != null && (
                <div className="flex flex-col items-end">
                  <div className="text-3xl font-bold tabular-nums">
                    {record.total_score}
                    <span className="text-base font-normal text-muted-foreground ml-1">/ 100</span>
                  </div>
                  <ScoreBreakdown record={record} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunity Summary */}
      {record.opportunity_summary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Opportunity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{record.opportunity_summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Strengths / Weaknesses / Recommended Services */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-green-700 dark:text-green-400">Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonList data={record.strengths} emptyText="No strengths recorded." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-red-700 dark:text-red-400">Weaknesses</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonList data={record.weaknesses} emptyText="No weaknesses recorded." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recommended Services</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonList data={record.recommended_services} emptyText="No recommendations recorded." />
          </CardContent>
        </Card>
      </div>

      {/* Website */}
      {record.website && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe size={16} />
              Website
              {record.website_score != null && (
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  Score: {record.website_score} / 100
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <a
              href={record.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium hover:underline text-primary"
            >
              {record.website}
              <ExternalLink size={12} />
            </a>
            {record.website_title && (
              <p className="text-sm font-medium">{record.website_title}</p>
            )}
            {record.website_description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{record.website_description}</p>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
};