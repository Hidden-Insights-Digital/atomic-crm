-- ── HID COMPANY APP: Add hid_pipeline_stage to companies table and summary view ──

-- Step 1: Add the column to the companies table
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS hid_pipeline_stage text NOT NULL DEFAULT 'prospect'
CONSTRAINT companies_hid_pipeline_stage_check
CHECK (hid_pipeline_stage = ANY (ARRAY[
  'prospect'::text,
  'targeting'::text,
  'contacted'::text,
  'active'::text,
  'inactive'::text,
  'excluded'::text
]));

COMMENT ON COLUMN public.companies.hid_pipeline_stage
  IS 'HID: Company engagement pipeline stage. Added by Hidden Insights Digital.';

-- Step 2: Drop and recreate companies_summary view to include hid_pipeline_stage
-- (CREATE OR REPLACE cannot reorder columns, so we drop first)
DROP VIEW IF EXISTS public.companies_summary;

CREATE VIEW public.companies_summary AS
SELECT
    c.id,
    c.created_at,
    c.name,
    c.sector,
    c.size,
    c.linkedin_url,
    c.website,
    c.phone_number,
    c.address,
    c.zipcode,
    c.city,
    c.state_abbr,
    c.sales_id,
    c.context_links,
    c.country,
    c.description,
    c.revenue,
    c.tax_identifier,
    c.logo,
    COUNT(DISTINCT d.id)  AS nb_deals,
    COUNT(DISTINCT co.id) AS nb_contacts,
    c.hid_pipeline_stage
FROM companies c
LEFT JOIN deals d  ON c.id = d.company_id
LEFT JOIN contacts co ON c.id = co.company_id
GROUP BY c.id;

-- ── END HID COMPANY APP ───────────────────────────────────────────────────────