// src/components/atomic-crm/insights/InsightsList.tsx

import { startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { Calendar, LayoutGrid } from 'lucide-react';
import {
  FilterLiveForm,
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

import { FilterCategory } from '../filters/FilterCategory';
import { ActiveFilterButton } from '../misc/ActiveFilterButton';
import { ResponsiveFilters } from '../misc/ResponsiveFilters';
import { TopToolbar } from '../layout/TopToolbar';
import { SearchInput } from '@/components/admin/search-input';

// ── Constants ─────────────────────────────────────────────────────────────────

const TIERS = [
  { value: 'green',  label: 'Tier 1' },
  { value: 'yellow', label: 'Tier 2' },
  { value: 'orange', label: 'Tier 3' },
  { value: 'red',    label: 'Tier 4' },
];

const TIER_STYLES: Record<string, { dot: string; bg: string; text: string }> = {
  green:  { dot: 'bg-green-500',  bg: 'bg-green-100 dark:bg-green-900/40',   text: 'text-green-800 dark:text-green-300'  },
  yellow: { dot: 'bg-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300' },
  orange: { dot: 'bg-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-800 dark:text-orange-300' },
  red:    { dot: 'bg-red-500',    bg: 'bg-red-100 dark:bg-red-900/40',       text: 'text-red-800 dark:text-red-300'       },
};

const TierBadge = ({ tier }: { tier: string | null }) => {
  if (!tier) return null;
  const style = TIER_STYLES[tier];
  if (!style) return null;
  const label = TIERS.find(t => t.value === tier)?.label ?? tier;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 mr-4 ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
};

// ── List ──────────────────────────────────────────────────────────────────────

export const InsightsList = () => (
  <List
    title={false}
    actions={<InsightsListActions />}
    perPage={25}
    sort={{ field: 'snap_name', order: 'ASC' }}
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
    <SortButton fields={['snap_name', 'total_score', 'updated_at']} />
  </TopToolbar>
);

// ── Filter sidebar ────────────────────────────────────────────────────────────

const InsightsListFilter = () => (
  <ResponsiveFilters>

    <FilterCategory label="Tier" icon={<LayoutGrid size={16} />}>
      {TIERS.map((tier) => {
        const style = TIER_STYLES[tier.value];
        return (
          <ToggleFilterButton
            key={tier.value}
            className="w-auto md:w-full justify-between h-10 md:h-8"
            label={
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                {tier.label}
              </span>
            }
            value={{ tier: tier.value }}
          />
        );
      })}
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
      to={`/insights/${record.id}/show`}
      className="flex flex-row items-center pl-4 pr-4 py-2 hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl"
    >
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
      </div>

      {/* Coloured tier badge */}
      <TierBadge tier={record.tier} />

      {/* Score */}
      {record.total_score != null && (
        <div className="text-sm text-muted-foreground shrink-0 w-16 text-right mr-4">
          {record.total_score}
        </div>
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