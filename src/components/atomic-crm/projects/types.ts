// Delivery-hub domain model. Mirrors the `projects` and `project_steps` tables
// in the CRM's Supabase. These are the rows the cockpit and project detail
// screens read through ra-core's data provider (resources registered in
// root/CRM.tsx). Ported from the standalone hub.

export type Phase = 'Win' | 'Gather' | 'Build' | 'Review' | 'Launch' | 'Care';

export const PHASES: Phase[] = ['Win', 'Gather', 'Build', 'Review', 'Launch', 'Care'];

export interface Step {
  id: number;
  project_id: number;
  stage_key: string;
  phase: Phase;
  label: string;
  position: number;
  done: boolean;
  done_at: string | null;
  done_by: number | null;
  notes: string | null;
}

export interface Project {
  id: number;
  name: string;
  slug: string | null;
  status: string;
  steps_total: number;
  steps_done: number;
  live_url: string | null;
  domain: string | null;
  repo_url: string | null;
  care_monthly: number | null;
  build_fee: number | null;
  paid: boolean;
  site_up: boolean | null;
  ops_checked_at: string | null;
  blocker: string | null;
  blocker_since: string | null;
  deal_id: number | null;
  company_id: number | null;
  sales_id: number | null;
  // Joined client-side in the cockpit from the project_steps resource.
  steps: Step[];
}

// kind -> human label (Zoho activity feed, used by the activity screen)
export const KIND_LABEL: Record<string, string> = {
  call: 'Call',
  chat: 'Chat',
  email: 'Email',
  form: 'Form lead',
  ticket: 'Ticket',
};

// sales_id -> short owner label, mirrors the CRM sales table (1 Adrian, 2 Nathan)
export const OWNERS: Record<number, string> = { 1: 'Adrian', 2: 'Nathan' };

// Plain-language "done when..." per stage, mirrors project_step_templates.
export const STAGE_DEFS: Record<string, string> = {
  deal_won: 'A deal for this company is marked won in the CRM.',
  deposit_paid: 'The agreed deposit has been received.',
  info_email_sent: 'The email asking for business info and content has gone to the client.',
  content_received: 'Photos, hours, services, logo and copy facts are in hand.',
  repo_created: 'A private repo exists under the Hidden-Insights-Digital org.',
  site_built: 'The site builds cleanly, reads in the house voice, checked on a phone.',
  contact_form: 'The Formspree contact form is wired and submitting.',
  internal_review: 'Reviewed internally; the build meets the bar.',
  client_signoff: 'The client has seen the demo and approved going live.',
  domain_dns: 'The domain is pointed at the Render origin via Synergy DNS.',
  deployed_render: 'The Render static site has a successful live deploy from main.',
  gbp_done: 'The Google Business Profile is created, optimised and verified.',
  go_live: 'The production domain serves the new site for the client.',
  care_setup: 'The ongoing monthly care arrangement is active.',
  invoiced: 'The build fee (and any balance) has been invoiced.',
};
