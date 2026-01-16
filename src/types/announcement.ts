/**
 * Announcement Types
 */

export type AnnouncementSeverity = 'info' | 'warning' | 'critical';
export type AnnouncementVisibility = 'public' | 'tenant-specific';

export interface Announcement {
  announcementId: string;
  title: string;
  message: string;
  severity: AnnouncementSeverity;
  visibility: AnnouncementVisibility;
  targetTenants: string[]; // Empty = all tenants (if public)
  targetLocations: string[]; // Empty = all locations
  createdBy: string; // userId
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  dismissible: boolean;
  pinned?: boolean;
}

export interface AnnouncementWithStatus extends Announcement {
  isRead: boolean;
  isDismissed: boolean;
  readAt?: string;
}

// Query parameters
export interface AnnouncementQueryParams {
  tenantId?: string;
  locationId?: string;
  severity?: AnnouncementSeverity;
  includeExpired?: boolean;
  limit?: number;
  offset?: number;
}

// For dashboard display
export interface AnnouncementSummary {
  announcementId: string;
  title: string;
  severity: AnnouncementSeverity;
  createdAt: string;
  expiresAt?: string;
  isExpired: boolean;
}

// Create/update
export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  severity: AnnouncementSeverity;
  visibility: AnnouncementVisibility;
  targetTenants?: string[];
  targetLocations?: string[];
  expiresAt?: string;
  dismissible?: boolean;
  pinned?: boolean;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  message?: string;
  severity?: AnnouncementSeverity;
  expiresAt?: string;
  pinned?: boolean;
}
