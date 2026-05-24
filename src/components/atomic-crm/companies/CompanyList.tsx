import { useGetIdentity, useListContext, useTranslate } from "ra-core";
import { CreateButton } from "@/components/admin/create-button";
import { ExportButton } from "@/components/admin/export-button";
import { List } from "@/components/admin/list";
import { ListPagination } from "@/components/admin/list-pagination";
import { SortButton } from "@/components/admin/sort-button";

import { TopToolbar } from "../layout/TopToolbar";
import { CompanyEmpty } from "./CompanyEmpty";
import { CompanyListFilter } from "./CompanyListFilter";
import { ImageList } from "./GridList";

// ── HID COMPANY APP: Add mobile list imports ──────────────
import { InfiniteListBase } from "ra-core";
import { InfinitePagination } from "../misc/InfinitePagination";
import MobileHeader from "../layout/MobileHeader";
import { MobileContent } from "../layout/MobileContent";
import { useCreatePath } from "ra-core";
import { Link } from "react-router";
import { CompanyAvatar } from "./CompanyAvatar";
import type { Company } from "../types";
// ── END HID COMPANY APP ───────────────────────────────────

export const CompanyList = () => {
  const { identity } = useGetIdentity();
  if (!identity) return null;
  return (
    <List
      title={false}
      perPage={25}
      sort={{ field: "name", order: "ASC" }}
      actions={<CompanyListActions />}
      pagination={<ListPagination rowsPerPageOptions={[10, 25, 50, 100]} />}
    >
      <CompanyListLayout />
    </List>
  );
};

const CompanyListLayout = () => {
  const { data, isPending, filterValues } = useListContext();
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;

  if (isPending) return null;
  if (!data?.length && !hasFilters) return <CompanyEmpty />;

  return (
    <div className="w-full flex flex-row gap-8">
      <CompanyListFilter />
      <div className="flex flex-col flex-1 gap-4">
        <ImageList />
      </div>
    </div>
  );
};

const CompanyListActions = () => {
  const translate = useTranslate();
  return (
    <TopToolbar>
      <SortButton fields={["name", "created_at", "nb_contacts"]} />
      <ExportButton />
      <CreateButton
        label={translate("resources.companies.action.new", {
          _: "New Company",
        })}
      />
    </TopToolbar>
  );
};

// ── HID COMPANY APP: Mobile-optimised company list ────────
export const CompanyListMobile = () => {
  const { identity } = useGetIdentity();
  if (!identity) return null;

  return (
    <InfiniteListBase
      perPage={25}
      sort={{ field: "name", order: "ASC" }}
    >
      <CompanyListLayoutMobile />
    </InfiniteListBase>
  );
};

const CompanyListLayoutMobile = () => {
  const { isPending, data, filterValues } = useListContext();
  const hasFilters = filterValues && Object.keys(filterValues).length > 0;

  if (!isPending && !data?.length && !hasFilters) return <CompanyEmpty />;

  return (
    <div>
      <MobileHeader>
        <CompanyListFilter />
      </MobileHeader>
      <MobileContent>
        {/* HID COMPANY APP: Use compact row list instead of large tiles */}
        <CompanyListContentMobile />
        {/* END HID COMPANY APP */}
        <div className="flex justify-center">
          <InfinitePagination />
        </div>
      </MobileContent>
    </div>
  );
};

// ── HID COMPANY APP: Compact mobile row layout for companies ──────────
const CompanyListContentMobile = () => {
  const { data, isPending } = useListContext<Company>();
  const createPath = useCreatePath();

  if (isPending) return null;

  return (
    <div className="flex flex-col divide-y">
      {data.map((record) => (
        <Link
          key={record.id}
          to={createPath({ resource: "companies", id: record.id, type: "show" })}
          className="flex items-center gap-3 py-3 px-2 hover:bg-muted no-underline"
        >
          <CompanyAvatar record={record} />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{record.name}</span>
            <span className="text-xs text-muted-foreground">{record.sector}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};
// ── END HID COMPANY APP ───────────────────────────────────────────────
