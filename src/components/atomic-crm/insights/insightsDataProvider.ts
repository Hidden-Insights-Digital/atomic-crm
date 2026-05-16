// src/components/atomic-crm/insights/insightsDataProvider.ts

import { createClient } from '@supabase/supabase-js';
import { supabaseDataProvider } from 'ra-supabase-core';

// ── CUSTOM: Second Supabase client for google-business-profiles ──
const gbpClient = createClient(
  import.meta.env.VITE_GBP_SUPABASE_URL,
  import.meta.env.VITE_GBP_SB_PUBLISHABLE_KEY,
);

const baseProvider = supabaseDataProvider({
  instanceUrl: import.meta.env.VITE_GBP_SUPABASE_URL,
  apiKey: import.meta.env.VITE_GBP_SB_PUBLISHABLE_KEY,
  supabaseClient: gbpClient,
  primaryKeys: new Map([
    ['insights', ['cid']],
  ]),
});

export const insightsDataProvider = {
  ...baseProvider,
  getList: async (resource: string, params: any) => {
    if (resource === 'insights') {
      const { q, ...restFilter } = params.filter ?? {};
      return baseProvider.getList(resource, {
        ...params,
        filter: {
          ...restFilter,
          ...(q ? { 'name@ilike': `%${q}%` } : {}),
        },
      });
    }
    return baseProvider.getList(resource, params);
  },
};
// ── END CUSTOM ───────────────────────────────────────────────────