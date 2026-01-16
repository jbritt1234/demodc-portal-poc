/**
 * Seed data for announcements
 */

import type { Announcement } from '@/types';

export const seedAnnouncements: Announcement[] = [
  {
    announcementId: 'ann-001',
    title: 'Scheduled Maintenance - North Wing UPS Testing',
    message:
      'The North Wing will undergo routine UPS testing on January 20th, 2026 from 2:00 AM to 4:00 AM MST. All systems will remain operational during this time, but redundancy will be temporarily reduced. Critical operations will be prioritized.',
    severity: 'warning',
    visibility: 'public',
    targetTenants: [],
    targetLocations: ['dc-denver-1'],
    createdBy: 'user-admin-001',
    createdByName: 'Operations Team',
    createdAt: '2026-01-14T10:00:00Z',
    expiresAt: '2026-01-21T00:00:00Z',
    dismissible: true,
    pinned: true,
  },
  {
    announcementId: 'ann-002',
    title: 'CRITICAL: Network Upgrade Completion',
    message:
      'The core network upgrade has been successfully completed. All tenants should now experience improved throughput and reduced latency. Please contact support if you experience any connectivity issues.',
    severity: 'critical',
    visibility: 'public',
    targetTenants: [],
    targetLocations: ['dc-denver-1'],
    createdBy: 'user-admin-002',
    createdByName: 'Network Engineering',
    createdAt: '2026-01-15T08:30:00Z',
    expiresAt: '2026-01-18T00:00:00Z',
    dismissible: true,
    pinned: true,
  },
  {
    announcementId: 'ann-003',
    title: 'New Camera System Features Available',
    message:
      'We have deployed new camera features including improved night vision, motion detection alerts, and 4K streaming for select cameras. Access the camera dashboard to explore these enhancements.',
    severity: 'info',
    visibility: 'public',
    targetTenants: [],
    targetLocations: ['dc-denver-1'],
    createdBy: 'user-admin-001',
    createdByName: 'Facilities Management',
    createdAt: '2026-01-12T14:00:00Z',
    expiresAt: '2026-01-26T00:00:00Z',
    dismissible: true,
    pinned: false,
  },
  {
    announcementId: 'ann-004',
    title: 'Holiday Access Hours - MLK Day',
    message:
      'On Martin Luther King Jr. Day (January 20th), on-site support will be limited to emergency calls only. Remote hands services remain available 24/7. Please plan accordingly for any non-urgent physical access needs.',
    severity: 'info',
    visibility: 'public',
    targetTenants: [],
    targetLocations: ['dc-denver-1'],
    createdBy: 'user-admin-003',
    createdByName: 'Customer Success',
    createdAt: '2026-01-10T09:00:00Z',
    expiresAt: '2026-01-21T00:00:00Z',
    dismissible: true,
    pinned: false,
  },
  {
    announcementId: 'ann-005',
    title: 'Power Optimization Advisory - South Wing',
    message:
      'Our monitoring systems have detected opportunities for power optimization in the South Wing. Tenants with assets in this zone may benefit from our complimentary power efficiency audit. Contact your account manager to schedule.',
    severity: 'info',
    visibility: 'public',
    targetTenants: ['tenant-acme', 'tenant-globalfin'],
    targetLocations: ['dc-denver-1'],
    createdBy: 'user-admin-002',
    createdByName: 'Energy Management',
    createdAt: '2026-01-08T11:00:00Z',
    expiresAt: '2026-02-01T00:00:00Z',
    dismissible: true,
    pinned: false,
  },
];
