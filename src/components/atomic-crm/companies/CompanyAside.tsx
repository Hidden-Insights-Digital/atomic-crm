import { Globe, Linkedin, Phone } from "lucide-react";
import {
  useGetIdentity,
  useLocaleState,
  useRecordContext,
  useTranslate,
} from "ra-core";
import { EditButton } from "@/components/admin/edit-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { ShowButton } from "@/components/admin/show-button";
import { TextField } from "@/components/admin/text-field";
import { UrlField } from "@/components/admin/url-field";
//import { SelectField } from "@/components/admin/select-field";

import { formatLocalizedDate } from "../misc/RelativeDate";
import { AsideSection } from "../misc/AsideSection";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Company } from "../types";
// import { getTranslatedCompanySizeLabel } from "./getTranslatedCompanySizeLabel";
// import { sizes } from "./sizes";
import { useGetSalesName } from "../sales/useGetSalesName";

// ── HID COMPANY APP: Pipeline stage config (replaces Size) ───────────
const PIPELINE_STAGE_CHOICES = [
  { id: "prospect",  label: "Prospect",  color: "bg-gray-100 text-gray-700" },
  { id: "targeting", label: "Targeting", color: "bg-blue-100 text-blue-700" },
  { id: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-700" },
  { id: "active",    label: "Active",    color: "bg-green-100 text-green-700" },
  { id: "inactive",  label: "Inactive",  color: "bg-orange-100 text-orange-700" },
  { id: "excluded",  label: "Excluded",  color: "bg-red-100 text-red-700" },
];
// ── END HID COMPANY APP ───────────────────────────────────────────────

interface CompanyAsideProps {
  link?: string;
}

export const CompanyAside = ({ link = "edit" }: CompanyAsideProps) => {
  const record = useRecordContext<Company>();
  const translate = useTranslate();
  if (!record) return null;

  return (
    <div className="hidden sm:block w-92 min-w-92 space-y-4">
      <div className="flex flex-row space-x-1">
        {link === "edit" ? (
          <EditButton label={translate("resources.companies.action.edit")} />
        ) : (
          <ShowButton label={translate("resources.companies.action.show")} />
        )}
      </div>

      <CompanyInfo record={record} />

      <AddressInfo record={record} />

      <ContextInfo record={record} />

      <AdditionalInfo record={record} />

      {link !== "edit" && (
        <div className="mt-6 pt-6 border-t hidden sm:flex flex-col gap-2 items-start">
          <DeleteButton
            className="h-6 cursor-pointer hover:bg-destructive/10! text-destructive! border-destructive! focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
            size="sm"
          />
        </div>
      )}
    </div>
  );
};

export const CompanyInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();
  if (!record.website && !record.linkedin_url && !record.phone_number) {
    return null;
  }

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.contact")}
    >
      {record.website && (
        <div className="flex flex-row items-center gap-1 min-h-[24px]">
          <Globe className="w-4 h-4" />
          <UrlField
            source="website"
            target="_blank"
            rel="noopener"
            content={record.website
              .replace("http://", "")
              .replace("https://", "")}
          />
        </div>
      )}
      {record.linkedin_url && (
        <div className="flex flex-row items-center gap-1 min-h-[24px]">
          <Linkedin className="w-4 h-4" />
          <a
            className="underline hover:no-underline"
            href={record.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            title={record.linkedin_url}
          >
            LinkedIn
          </a>
        </div>
      )}
      {record.phone_number && (
        <div className="flex flex-row items-center gap-1 min-h-[24px]">
          <Phone className="w-4 h-4" />
          <TextField source="phone_number" />
        </div>
      )}
    </AsideSection>
  );
};

export const ContextInfo = ({ record }: { record: Company }) => {
  const { companySectors } = useConfigurationContext();
  const translate = useTranslate();
  if (!record.sector && !record.hid_pipeline_stage && !record.hid_tier && !record.hid_opportunity && !record.hid_recommended) {
    return null;
  }

  const sector = companySectors.find((s) => s.value === record.sector);
  const sectorLabel = sector?.label;

  const TIER_STYLES: Record<string, { bg: string; label: string }> = {
    green:  { bg: 'bg-green-100 text-green-700',   label: 'Green 75>100' },
    yellow: { bg: 'bg-yellow-100 text-yellow-700', label: 'Yellow: 50>75' },
    orange: { bg: 'bg-orange-100 text-orange-700', label: 'Orange 25>50' },
    red:    { bg: 'bg-red-100 text-red-700',       label: 'Red 0>25' },
  };

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.context")}
    >
      {sectorLabel && (
        <span>
          {translate("resources.companies.fields.sector")}: {sectorLabel}
        </span>
      )}

      {/* ── HID COMPANY APP: Pipeline stage badge ── */}
      {record.hid_pipeline_stage && (() => {
        const stage = PIPELINE_STAGE_CHOICES.find(s => s.id === record.hid_pipeline_stage);
        return stage ? (
          <span className="flex items-center gap-2">
            <span className="text-sm">Stage:</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stage.color}`}>
              {stage.label}
            </span>
          </span>
        ) : null;
      })()}

      {/* Tier badge */}
      {record.hid_tier && TIER_STYLES[record.hid_tier] && (
        <span className="flex items-center gap-2">
          <span className="text-sm">Tier:</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TIER_STYLES[record.hid_tier].bg}`}>
            {TIER_STYLES[record.hid_tier].label}
          </span>
        </span>
      )}

      {/* GBP Claimed */}
      {record.hid_verified !== null && record.hid_verified !== undefined && (
        <span className="flex items-center gap-2 text-sm">
          GBP:
          {record.hid_verified
            ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Claimed</span>
            : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Unclaimed</span>
          }
        </span>
      )}

      {/* Opportunity summary */}
      {record.hid_opportunity && (
        <p className="text-sm text-muted-foreground mt-1">{record.hid_opportunity}</p>
      )}

      {/* Recommended services */}
      {record.hid_recommended && record.hid_recommended.length > 0 && (
        <ul className="mt-1 space-y-1 list-disc list-outside pl-4 text-sm">
          {record.hid_recommended.map((service, i) => (
            <li key={i} className="text-muted-foreground">{service}</li>
          ))}
        </ul>
      )}
            {/* ── END HID COMPANY APP ── */}
          </AsideSection>
        );
      };

export const AddressInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();
  if (
    !record.address &&
    !record.city &&
    !record.zipcode &&
    !record.state_abbr
  ) {
    return null;
  }

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.address")}
      noGap
    >
      <TextField source="address" />
      <TextField source="city" />
      <TextField source="zipcode" />
      <TextField source="state_abbr" />
      <TextField source="country" />
    </AsideSection>
  );
};

export const AdditionalInfo = ({ record }: { record: Company }) => {
  const translate = useTranslate();
  const [locale = "en"] = useLocaleState();
  const { identity } = useGetIdentity();
  const isCurrentUser = record.sales_id === identity?.id;
  const salesName = useGetSalesName(record.sales_id, {
    enabled: !isCurrentUser,
  });
  if (
    !record.created_at &&
    !record.sales_id &&
    !record.description &&
    !record.context_links
  ) {
    return null;
  }
  const getBaseURL = (url: string) => {
    const urlObject = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObject.hostname;
  };

  return (
    <AsideSection
      title={translate("resources.companies.field_categories.additional_info")}
    >
      {record.description && (
        <p className="text-sm  mb-1">{record.description}</p>
      )}
      {record.context_links && (
        <div className="flex flex-col">
          {record.context_links.map((link, index) =>
            link ? (
              <a
                key={index}
                className="text-sm underline hover:no-underline mb-1"
                href={link.startsWith("http") ? link : `https://${link}`}
                target="_blank"
                rel="noopener noreferrer"
                title={link}
              >
                {getBaseURL(link)}
              </a>
            ) : null,
          )}
        </div>
      )}
      {record.sales_id !== null && (
        <div className="inline-flex text-sm text-muted-foreground mb-1">
          {translate(
            isCurrentUser
              ? "resources.companies.followed_by_you"
              : "resources.companies.followed_by",
            { name: salesName },
          )}
        </div>
      )}
      {record.created_at && (
        <p className="text-sm text-muted-foreground mb-1">
          {translate("resources.companies.added_on", {
            date: formatLocalizedDate(record.created_at, locale),
          })}{" "}
        </p>
      )}
    </AsideSection>
  );
};
