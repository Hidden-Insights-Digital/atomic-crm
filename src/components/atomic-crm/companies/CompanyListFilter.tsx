import { Tag, Truck, Users } from "lucide-react";
import { useGetIdentity, useTranslate } from "ra-core";
import { ToggleFilterButton } from "@/components/admin/toggle-filter-button";
// ── HID COMPANY APP: Remove SearchInput/FilterLiveForm, add ResponsiveFilters ──
// Original: import { FilterLiveForm, useGetIdentity, useTranslate } from "ra-core";
// Original: import { SearchInput } from "@/components/admin/search-input";
import { ResponsiveFilters } from "../misc/ResponsiveFilters";
// ── END HID COMPANY APP ───────────────────────────────────────────────────────

import { FilterCategory } from "../filters/FilterCategory";
import { useConfigurationContext } from "../root/ConfigurationContext";
// import { getTranslatedCompanySizeLabel } from "./getTranslatedCompanySizeLabel";
// import { sizes } from "./sizes";

// ── HID COMPANY APP: Pipeline stage filter choices (replaces Size) ───
const PIPELINE_STAGE_CHOICES = [
  { id: "prospect",  name: "Prospect" },
  { id: "targeting", name: "Targeting" },
  { id: "contacted", name: "Contacted" },
  { id: "active",    name: "Active" },
  { id: "inactive",  name: "Inactive" },
  { id: "excluded",  name: "Excluded" },
];
// ── END HID COMPANY APP ───────────────────────────────────────────────

export const CompanyListFilter = () => {
  const { identity } = useGetIdentity();
  const { companySectors } = useConfigurationContext();
  const translate = useTranslate();

  return (

    <ResponsiveFilters
      searchInput={{
        placeholder: translate("resources.companies.filters.search", {
          _: "Search companies...",
        }),
      }}
    >

      {/* ── HID COMPANY APP: Stage filter replaces Size filter ── */}
      <FilterCategory
        icon={<Tag className="h-4 w-4" />}
        label="Stage"
      >
        {PIPELINE_STAGE_CHOICES.map((stage) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={stage.name}
            key={stage.id}
            value={{ hid_pipeline_stage: stage.id }}
          />
        ))}
      </FilterCategory>
      {/* ── END HID COMPANY APP ─────────────────────────────────── */}

      <FilterCategory
        icon={<Truck className="h-4 w-4" />}
        label="resources.companies.fields.sector"
      >
        {companySectors.map((sector) => (
          <ToggleFilterButton
            className="w-full justify-between"
            label={sector.label}
            key={sector.value}
            value={{ sector: sector.value }}
          />
        ))}
      </FilterCategory>

      <FilterCategory
        icon={<Users className="h-4 w-4" />}
        label="resources.companies.fields.sales_id"
      >
        <ToggleFilterButton
          className="w-full justify-between"
          label={translate("crm.common.me")}
          value={{ sales_id: identity?.id }}
        />
      </FilterCategory>
    </ResponsiveFilters>
  );
};
