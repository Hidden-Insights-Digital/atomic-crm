// src/components/atomic-crm/insights/InsightsShow.tsx

import { ShowBase, useShowContext } from 'ra-core';
import { Link } from 'react-router';
import { ExternalLink, Building2, MapPin, Phone, ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';


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
  const raw = typeof data === 'string' ? JSON.parse(data) : data;
  const items: string[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
    ? raw.items
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


// ── Section heading ───────────────────────────────────────────────────────────


const SectionHeading = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-lg font-semibold mb-3 ${className}`}>{children}</h2>
);


// ── Brand icons (inline SVG — lucide deprecated its brand icons) ──────────────


const IconFacebook = ({ muted = false }: { muted?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={muted ? 'currentColor' : '#1877F2'} aria-hidden="true">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.027 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

const IconInstagram = ({ muted = false }: { muted?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={muted ? 'currentColor' : 'url(#ig-grad)'} aria-hidden="true">
    {!muted && (
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433"/>
          <stop offset="25%" stopColor="#e6683c"/>
          <stop offset="50%" stopColor="#dc2743"/>
          <stop offset="75%" stopColor="#cc2366"/>
          <stop offset="100%" stopColor="#bc1888"/>
        </linearGradient>
      </defs>
    )}
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const IconLinkedIn = ({ muted = false }: { muted?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={muted ? 'currentColor' : '#0A66C2'} aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const IconWhatsApp = ({ muted = false }: { muted?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={muted ? 'currentColor' : '#25D366'} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const IconYouTube = ({ muted = false }: { muted?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={muted ? 'currentColor' : '#FF0000'} aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);


// ── Social link button ─────────────────────────────────────────────────────────


type SocialLinkProps = {
  href: string | null | undefined;
  label: string;
  icon: React.ReactNode;
  mutedIcon: React.ReactNode;
};

const SocialLink = ({ href, label, icon, mutedIcon }: SocialLinkProps) => {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
      >
        {icon}
        {label}
        <ExternalLink size={11} className="text-muted-foreground shrink-0 ml-auto" />
      </a>
    );
  }
  return (
    <span
      className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground/50 cursor-default select-none"
      title={`No ${label} page found`}
    >
      <span className="opacity-40">{mutedIcon}</span>
      {label}
    </span>
  );
};


// ── Digital signal pill ───────────────────────────────────────────────────────


const SignalPill = ({ active, label }: { active: boolean | null; label: string }) => {
  if (active === null || active === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border border-dashed border-border text-muted-foreground/50 cursor-default select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
        {label}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
        active
          ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700'
          : 'bg-muted text-muted-foreground border-border'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
      {label}
    </span>
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
        <CardContent className="px-5 pt-4 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold">{record.name}</h1>

              {record.crm_company_id && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 size={14} />
                  <Link to={`/companies/${record.crm_company_id}/show`} className="hover:underline">
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
                  ) : record.address}
                </div>
              )}

              {record.phone && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone size={14} />
                  <a href={`tel:${record.phone}`} className="hover:underline">{record.phone}</a>
                </div>
              )}
            </div>

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


      {/* Website + Social Media */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Website */}
        <Card>
          <CardContent className="px-5 pt-4 pb-5">
            <SectionHeading>Website</SectionHeading>
            {record.website && record.website.trim() !== '' ? (
              <>
                <a
                  href={record.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline transition-colors mb-1"
                >
                  {record.website}
                  <ExternalLink size={12} className="shrink-0" />
                </a>
                {record.website_score != null && (
                  <span className="ml-3 text-xs text-muted-foreground">Score: {record.website_score} / 100</span>
                )}
                {record.website_title && (
                  <p className="font-medium text-sm mt-1">{record.website_title}</p>
                )}
                {record.website_generator && (
                  <p className="text-xs text-muted-foreground mt-0.5">Built with: {record.website_generator}</p>
                )}
                {record.website_description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">{record.website_description}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No website recorded.</p>
            )}
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardContent className="px-5 pt-4 pb-5">
            <SectionHeading>Social Media</SectionHeading>
            <div className="flex flex-wrap gap-2 mb-5">
              <SocialLink
                href={record.social_facebook}
                label="Facebook"
                icon={<IconFacebook />}
                mutedIcon={<IconFacebook muted />}
              />
              <SocialLink
                href={record.social_instagram}
                label="Instagram"
                icon={<IconInstagram />}
                mutedIcon={<IconInstagram muted />}
              />
              <SocialLink
                href={record.social_twitter}
                label="X / Twitter"
                icon={<IconX />}
                mutedIcon={<IconX />}
              />
              <SocialLink
                href={record.social_linkedin}
                label="LinkedIn"
                icon={<IconLinkedIn />}
                mutedIcon={<IconLinkedIn muted />}
              />
              <SocialLink
                href={record.social_whatsapp}
                label="WhatsApp"
                icon={<IconWhatsApp />}
                mutedIcon={<IconWhatsApp muted />}
              />
              <SocialLink
                href={record.social_youtube}
                label="YouTube"
                icon={<IconYouTube />}
                mutedIcon={<IconYouTube muted />}
              />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Digital Signals
            </h3>
            <div className="flex flex-wrap gap-2">
              <SignalPill active={record.has_fb_pixel ?? null} label="Facebook Pixel" />
              <SignalPill active={record.has_google_tag ?? null} label="Google Tag" />
            </div>
          </CardContent>
        </Card>

      </div>


      {/* Strengths / Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="px-5 pt-4 pb-5">
            <SectionHeading className="text-green-700 dark:text-green-400">Strengths</SectionHeading>
            <JsonList data={record.strengths} emptyText="No strengths recorded." />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="px-5 pt-4 pb-5">
            <SectionHeading className="text-red-700 dark:text-red-400">Weaknesses</SectionHeading>
            <JsonList data={record.weaknesses} emptyText="No weaknesses recorded." />
          </CardContent>
        </Card>
      </div>


      {/* Opportunity Summary + Recommended Services */}
      {(record.opportunity_summary || record.recommended_services) && (
        <Card>
          <CardContent className="px-5 pt-4 pb-5">

            {record.opportunity_summary && (
              <>
                <SectionHeading>Opportunity Summary</SectionHeading>
                <p className="text-sm leading-relaxed mb-5">{record.opportunity_summary}</p>
              </>
            )}

            <SectionHeading>Recommended Services</SectionHeading>
            <JsonList data={record.recommended_services} emptyText="No recommendations recorded." />

          </CardContent>
        </Card>
      )}


    </div>
  );
};
