import type {
  Tenant,
  User,
  DataCenterLocation,
  Asset,
  Camera,
  AccessLog,
  EnvironmentalReading,
  Announcement,
} from '@/types';

/**
 * In-memory data store for the POC
 * In production, this would be replaced with a real database
 */
class DataStore {
  // Core data collections
  tenants: Map<string, Tenant> = new Map();
  users: Map<string, User> = new Map();
  locations: Map<string, DataCenterLocation> = new Map();
  assets: Map<string, Asset> = new Map();
  cameras: Map<string, Camera> = new Map();
  announcements: Map<string, Announcement> = new Map();

  // Time-series data (arrays for easier filtering)
  accessLogs: AccessLog[] = [];
  environmentalReadings: EnvironmentalReading[] = [];

  /**
   * Get access logs with tenant filtering and pagination
   */
  getAccessLogs(params: {
    tenantId: string;
    assetIds?: string[];
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    action?: 'entry' | 'exit' | 'denied';
  }): { logs: AccessLog[]; total: number } {
    let filtered = this.accessLogs.filter((log) => log.tenantId === params.tenantId);

    // Filter by assigned assets
    if (params.assetIds && params.assetIds.length > 0) {
      filtered = filtered.filter((log) => params.assetIds!.includes(log.asset));
    }

    // Filter by date range
    if (params.startDate) {
      filtered = filtered.filter((log) => log.timestamp >= params.startDate!);
    }
    if (params.endDate) {
      filtered = filtered.filter((log) => log.timestamp <= params.endDate!);
    }

    // Filter by action
    if (params.action) {
      filtered = filtered.filter((log) => log.action === params.action);
    }

    const total = filtered.length;
    const offset = params.offset || 0;
    const limit = params.limit || 50;

    return {
      logs: filtered.slice(offset, offset + limit),
      total,
    };
  }

  /**
   * Get cameras for a tenant's assigned assets
   */
  getCameras(tenantId: string, assetIds: string[]): Camera[] {
    return Array.from(this.cameras.values()).filter((camera) => {
      // Check if camera is assigned to this tenant
      const isTenantAssigned = camera.assignedTenants.includes(tenantId);

      // Check if camera is for one of the tenant's assets
      const isAssetMatch =
        !camera.assignedAssets ||
        camera.assignedAssets.length === 0 ||
        camera.assignedAssets.some((assetId) => assetIds.includes(assetId));

      return isTenantAssigned && isAssetMatch;
    });
  }

  /**
   * Get environmental readings for a location/zone
   */
  getEnvironmentalReadings(params: {
    location: string;
    zone?: string;
    type?: 'temperature' | 'humidity';
    hours?: number;
  }): EnvironmentalReading[] {
    let filtered = this.environmentalReadings.filter(
      (reading) => reading.location === params.location
    );

    if (params.zone) {
      filtered = filtered.filter((reading) => reading.zone === params.zone);
    }

    if (params.type) {
      filtered = filtered.filter((reading) => reading.type === params.type);
    }

    if (params.hours) {
      const cutoff = new Date(Date.now() - params.hours * 60 * 60 * 1000).toISOString();
      filtered = filtered.filter((reading) => reading.timestamp >= cutoff);
    }

    return filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get announcements (filtered by visibility)
   */
  getAnnouncements(params: {
    tenantId?: string;
    limit?: number;
  }): Announcement[] {
    let announcements = Array.from(this.announcements.values());

    // Filter by visibility
    announcements = announcements.filter(
      (announcement) =>
        announcement.visibility === 'public' ||
        (announcement.visibility === 'tenant-specific' &&
          announcement.targetTenants?.includes(params.tenantId || ''))
    );

    // Sort by severity and date
    announcements.sort((a, b) => {
      const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
      const severityDiff =
        severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    const limit = params.limit || 10;
    return announcements.slice(0, limit);
  }

  /**
   * Get tenant by ID
   */
  getTenant(tenantId: string): Tenant | undefined {
    return this.tenants.get(tenantId);
  }

  /**
   * Get location by ID
   */
  getLocation(locationId: string): DataCenterLocation | undefined {
    return this.locations.get(locationId);
  }

  /**
   * Get asset by ID
   */
  getAsset(assetId: string): Asset | undefined {
    return this.assets.get(assetId);
  }

  /**
   * Clear all data (useful for testing)
   */
  clear(): void {
    this.tenants.clear();
    this.users.clear();
    this.locations.clear();
    this.assets.clear();
    this.cameras.clear();
    this.announcements.clear();
    this.accessLogs = [];
    this.environmentalReadings = [];
  }
}

// Export singleton instance
export const dataStore = new DataStore();
