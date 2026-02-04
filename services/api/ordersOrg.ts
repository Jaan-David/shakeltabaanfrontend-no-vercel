import apiClient from './client';

export interface OrgSummary {
  _id: string;
  name?: string;
  organizationName?: string;
  logo?: string;
}

export interface OrgItem {
  _id: string;
  productId: {
    _id: string;
    name?: string;
    price?: number;
    imageList?: string[];
    images?: string[];
    image?: string;
    organizationId?: string;
    category?: string;
    stockQty?: number;
  } | string;
  itemQty: number;
  totalPrice?: number;
}

export interface OrgItemsResponse {
  status: string;
  data?: {
    items?: OrgItem[];
    organization?: OrgSummary;
  };
  message?: string;
}

const BASE = 'https://shk2t-t3ban.fly.dev/app/v1';

export const ordersOrgService = {
  async listOrganizations() {
    const res = await apiClient.get(`${BASE}/orders/organizations/list`);
    const orgs: OrgSummary[] = Array.isArray(res.data?.data) ? res.data.data : res.data?.data?.organizations || [];
    return orgs;
  },

  async getOrganizationItems(orgId: string) {
    const res = await apiClient.get(`${BASE}/orders/organizations/${orgId}/items`);
    return res.data as OrgItemsResponse;
  },

  async createMultiOrgOrder(payload: Array<{ organizationId: string; items: Array<{ productId: string; itemQty: number }> }>) {
    const res = await apiClient.post(`${BASE}/orders/multi-org/create`, { orders: payload });
    return res.data;
  }
};

export default ordersOrgService;
