export interface Organization {
  _id?: string;
  id?: string;
  organizationId: string;
  name: string;
  description?: string;
  location?: string;
  photo?: string;
}

import { Api } from './endpoints';

export const organizationService = {
  async getOrganizations(): Promise<Organization[]> {
    try {
      const response = await fetch(`${Api}/organizations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // API returns { status, results, data: [ { organizationId, name, photo, ... } ] }
      if (Array.isArray(result?.data)) {
        return result.data as Organization[];
      }

      return [];
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }
  }
};
