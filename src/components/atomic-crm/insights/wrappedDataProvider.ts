import type { DataProvider } from 'ra-core';
import type { CrmDataProvider } from '../providers/types';

const INSIGHTS_RESOURCE = 'insights';

export const createWrappedDataProvider = (
  crmProvider: CrmDataProvider,
  insightsProvider: DataProvider
): CrmDataProvider => ({
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