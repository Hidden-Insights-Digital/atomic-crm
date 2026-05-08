import type { DataProvider } from 'ra-core';

const INSIGHTS_RESOURCE = 'insights_place_company_links';

export const createWrappedDataProvider = (
  crmProvider: DataProvider,
  insightsProvider: DataProvider
): DataProvider => ({
  ...crmProvider,
  getList: (resource, params) =>
    resource === INSIGHTS_RESOURCE
      ? insightsProvider.getList(resource, params)
      : crmProvider.getList(resource, params),
  getOne: (resource, params) =>
    resource === INSIGHTS_RESOURCE
      ? insightsProvider.getOne(resource, params)
      : crmProvider.getOne(resource, params),
  getManyReference: (resource, params) =>
    resource === INSIGHTS_RESOURCE
      ? insightsProvider.getManyReference(resource, params)
      : crmProvider.getManyReference(resource, params),
});