// src/components/atomic-crm/insights/insightsDataProvider.ts
import { createClient } from '@supabase/supabase-js';
import { supabaseDataProvider } from 'ra-supabase-core';

// ── CUSTOM: Second Supabase client for google-business-profiles ──
const gbpClient = createClient(
  import.meta.env.VITE_GBP_SUPABASE_URL,
  import.meta.env.VITE_GBP_SUPABASE_ANON_KEY
);

export const insightsDataProvider = supabaseDataProvider({
  instanceUrl: import.meta.env.VITE_GBP_SUPABASE_URL,
  apiKey: import.meta.env.VITE_GBP_SUPABASE_ANON_KEY,
  supabaseClient: gbpClient,
});
// ── END CUSTOM ───────────────────────────────────────────────────