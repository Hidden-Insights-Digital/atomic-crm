// src/components/atomic-crm/insights/InsightsList.tsx

import { startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { Calendar, LayoutGrid, TrendingUp } from 'lucide-react';
import {
  RecordContextProvider,
  useListContext,
  useLocaleState,
} from 'ra-core';
import { Link } from 'react-router';

import { List } from '@/components/admin/list';
import { SortButton } from '@/components/admin/sort-button';
import { ToggleFilterButton } from '@/components/admin/toggle-filter-button';
import { ReferenceField } from '@/components/admin/reference-field';
import { TextField } from '@/components/admin/text-field';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import { FilterCategory } from '../filters/FilterCategory';
import { ActiveFilterButton } from '../misc/ActiveFilterButton';
import { ResponsiveFilters } from '../misc/ResponsiveFilters';
import { TopToolbar } from '../layout/TopToolbar';

// ── Constants ─────────────────────────────────────────────────────────────────

const TIERS = [
  { value: '1', label: 'Tier 1' },
  { value: '2', label: 'Tier 2' },
  { value: '3', label: 'Tier 3' },
  { value: '4', label: 'Tier 4' },
];

const ASSESSMENT_STATUSES = [
  { value: 'pending',   label: 'Pending' },
  { value: 'complete',  label: 'Complete' },
  { value: 'in_review', label: 'In Review' },
];

const tierVariant = (
  tier: string | null,
): 'default' | 'secondary' | 'outline' => {
  if (tier === '1') return 'default';
  if (tier === '2') return 'secondary';
  return 'outline';
};

// ── List ──────────────────────────────────────────────────────────────────────

export const InsightsList = () => (
  <List
    title={false}
    actions={<InsightsListActions />}
    perPage={25}
    sort={{ field: 'snap_name', order: 'ASC' }}
    filter={{ qualification_status: 'candidate' }}
  >
    <InsightsListLayout />
  </List>
);

// ── Layout ────────────────────────────────────────────────────────────────────

const InsightsListLayout = () => {
  const { isPending } = useListContext();

  if (isPending) return null;

  return (
    <div className="flex flex-row gap-8">
      <InsightsListFilter />
      <div className="w-full flex flex-col gap-4">
        <InsightsListFilterSummary />
        <Card className="py-0">
          <InsightsListContent />
        </Card>
      </div>
    </div>
  );
};

// ── Actions ───────────────────────────────────────────────────────────────────

const InsightsListActions = () => (
  <TopToolbar>
    <SortButton fields={['snap_name', 'updated_at']} />
  </TopToolbar>
);

// ── Filter sidebar ────────────────────────────────────────────────────────────

const InsightsListFilter = () => (
  <ResponsiveFilters searchInput={{ placeholder: 'Search by name…' }}>

    <FilterCategory label="Tier" icon={<LayoutGrid size={16} />}>
      {TIERS.map((tier) => (
        <ToggleFilterButton
          key={tier.value}
          className="w-auto md:w-full justify-between h-10 md:h-8"
          label={tier.label}
          value={{ tier: tier.value }}
        />
      ))}
    </FilterCategory>

    <FilterCategory label="Assessment Status" icon={<TrendingUp size={16} />}>
      {ASSESSMENT_STATUSES.map((s) => (
        <ToggleFilterButton
          key={s.value}
          className="w-auto md:w-full justify-between h-10 md:h-8"
          label={s.label}
          value={{ assessment_status: s.value }}
        />
      ))}
    </FilterCategory>

    <FilterCategory label="Last Updated" icon={<Calendar size={16} />}>
      <ToggleFilterButton
        className="w-auto md:w-full justify-between h-10 md:h-8"
        label="This week"
        value={{ 'updated_at@gte': startOfWeek(new Date()).toISOString() }}
      />
      <ToggleFilterButton
        className="w-auto md:w-full justify-between h-10 md:h-8"
        label="This month"
        value={{ 'updated_at@gte': startOfMonth(new Date()).toISOString() }}
      />
      <ToggleFilterButton
        className="w-auto md:w-full justify-between h-10 md:h-8"
        label="Last month"
        value={{
          'updated_at@gte': subMonths(startOfMonth(new Date()), 1).toISOString(),
          'updated_at@lte': startOfMonth(new Date()).toISOString(),
        }}
      />
      <ToggleFilterButton
        className="w-auto md:w-full justify-between h-10 md:h-8"
        label="Older than a month"
        value={{ 'updated_at@lte': startOfMonth(new Date()).toISOString() }}
      />
    </FilterCategory>

  </ResponsiveFilters>
);

// ── Active filter chips ───────────────────────────────────────────────────────

const InsightsListFilterSummary = () => {
  const { filterValues } = useListContext();
  const hasFilters = !!Object.entries(filterValues || {}).filter(
    ([key]) => key !== 'q' && key !== 'qualification_status',
  ).length;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-start gap-1">
      {TIERS.map((tier) => (
        <ActiveFilterButton
          key={tier.value}
          className="w-auto justify-between h-8"
          label={tier.label}
          value={{ tier: tier.value }}
        />
      ))}
      {ASSESSMENT_STATUSES.map((s) => (
        <ActiveFilterButton
          key={s.value}
          className="w-auto justify-between h-8"
          label={s.label}
          value={{ assessment_status: s.value }}
        />
      ))}
      <ActiveFilterButton
        className="w-auto justify-between h-8"
        label="This week"
        value={{ 'updated_at@gte': startOfWeek(new Date()).toISOString() }}
      />
      <ActiveFilterButton
        className="w-auto justify-between h-8"
        label="This month"
        value={{ 'updated_at@gte': startOfMonth(new Date()).toISOString() }}
      />
      <ActiveFilterButton
        className="w-auto justify-between h-8"
        label="Last month"
        value={{
          'updated_at@gte': subMonths(startOfMonth(new Date()), 1).toISOString(),
          'updated_at@lte': startOfMonth(new Date()).toISOString(),
        }}
      />
      <ActiveFilterButton
        className="w-auto justify-between h-8"
        label="Older than a month"
        value={{ 'updated_at@lte': startOfMonth(new Date()).toISOString() }}
      />
    </div>
  );
};

// ── Row list ──────────────────────────────────────────────────────────────────

const InsightsListContent = () => {
  const { data: records, isPending, error } = useListContext();

  if (isPending) return <Skeleton className="w-full h-9" />;
  if (error) return null;
  if (!records?.length) return (
    <div className="p-4 text-muted-foreground">No insights found.</div>
  );

  return (
    <div className="md:divide-y">
      {records.map((record) => (
        <RecordContextProvider key={record.id} value={record}>
          <InsightRow record={record} />
        </RecordContextProvider>
      ))}
    </div>
  );
};

// ── Single row ────────────────────────────────────────────────────────────────

const InsightRow = ({ record }: { record: any }) => {
  const [locale = 'en'] = useLocaleState();

  const updatedAt = record.updated_at
    ? new Date(record.updated_at).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <Link
      to={`/insights_place_company_links/${record.id}/show`}
      className="flex flex-row items-center pl-4 pr-4 py-2 hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl"
    >
      {/* Company name: live from companies table, fallback to snap_name */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {record.crm_company_id ? (
            <ReferenceField
              source="crm_company_id"
              reference="companies"
              link={false}
            >
              <TextField source="name" />
            </ReferenceField>
          ) : (
            record.snap_name
          )}
        </div>
        {record.assessment_status && (
          <div className="text-sm text-muted-foreground capitalize">
            {record.assessment_status.replace('_', ' ')}
          </div>
        )}
      </div>

      {/* Tier badge */}
      {record.tier && (
        <Badge variant={tierVariant(record.tier)} className="shrink-0 mr-4">
          Tier {record.tier}
        </Badge>
      )}

      {/* Updated at */}
      {updatedAt && (
        <div className="text-sm text-muted-foreground shrink-0 w-28 text-right">
          {updatedAt}
        </div>
      )}
    </Link>
  );
};