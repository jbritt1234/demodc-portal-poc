/**
 * Seed data for tenants (customer companies)
 */

import type { Tenant } from '@/types';

export const seedTenants: Tenant[] = [
  {
    tenantId: 'tenant-acme',
    companyName: 'Acme Corporation',
    status: 'active',
    tier: 'enterprise',
    assignedLocations: ['dc-denver-1'],
    assignedAssets: [
      {
        assetId: 'cage-5a',
        type: 'cage',
        location: 'dc-denver-1',
      },
      {
        assetId: 'rack-101',
        type: 'rack',
        location: 'dc-denver-1',
      },
      {
        assetId: 'rack-102',
        type: 'rack',
        location: 'dc-denver-1',
      },
    ],
    contactEmail: 'operations@acmecorp.com',
    billingContact: 'billing@acmecorp.com',
    createdAt: '2025-08-15T10:00:00Z',
    updatedAt: '2026-01-10T14:30:00Z',
  },
  {
    tenantId: 'tenant-techstart',
    companyName: 'TechStart Industries',
    status: 'active',
    tier: 'premium',
    assignedLocations: ['dc-denver-1'],
    assignedAssets: [
      {
        assetId: 'cage-1a',
        type: 'cage',
        location: 'dc-denver-1',
      },
      {
        assetId: 'rack-201',
        type: 'rack',
        location: 'dc-denver-1',
      },
    ],
    contactEmail: 'datacenter@techstart.io',
    billingContact: 'finance@techstart.io',
    createdAt: '2025-09-20T09:15:00Z',
    updatedAt: '2025-12-05T11:20:00Z',
  },
  {
    tenantId: 'tenant-globalfin',
    companyName: 'Global Financial Services',
    status: 'active',
    tier: 'enterprise',
    assignedLocations: ['dc-denver-1'],
    assignedAssets: [
      {
        assetId: 'cage-2a',
        type: 'cage',
        location: 'dc-denver-1',
      },
      {
        assetId: 'cage-3b',
        type: 'cage',
        location: 'dc-denver-1',
      },
      {
        assetId: 'cage-4b',
        type: 'cage',
        location: 'dc-denver-1',
      },
      {
        assetId: 'rack-301',
        type: 'rack',
        location: 'dc-denver-1',
      },
    ],
    contactEmail: 'itops@globalfinancial.com',
    billingContact: 'procurement@globalfinancial.com',
    createdAt: '2025-07-01T08:00:00Z',
    updatedAt: '2026-01-12T16:45:00Z',
  },
];
