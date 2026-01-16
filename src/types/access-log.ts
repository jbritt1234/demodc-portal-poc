/**
 * Access Log Types
 */

export type AccessAction = 'entry' | 'exit' | 'denied';
export type AccessMethod = 'badge' | 'pin' | 'biometric' | 'badge+pin';

export interface AccessLogMetadata {
  duration?: number; // seconds (for exit events, time since entry)
  notes?: string;
  denialReason?: string;
  escortRequired?: boolean;
  escortName?: string;
}

export interface AccessLog {
  logId: string;
  timestamp: string;
  tenantId: string;
  userId?: string; // Can be null for badge-only access
  userName: string;
  badgeId: string;
  accessPoint: string;
  location: string;
  zone: string;
  asset: string;
  action: AccessAction;
  method: AccessMethod;
  success: boolean;
  metadata?: AccessLogMetadata;
}

export interface AccessLogWithDetails extends AccessLog {
  assetName: string;
  locationName: string;
  zoneName: string;
}

// Query parameters for access log API
export interface AccessLogQueryParams {
  tenantId?: string;
  assetId?: string;
  userId?: string;
  action?: AccessAction;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// Summary statistics
export interface AccessLogSummary {
  totalEntries: number;
  totalExits: number;
  totalDenied: number;
  uniqueUsers: number;
  averageDuration: number; // minutes
  byHour: { hour: number; count: number }[];
  byAsset: { assetId: string; assetName: string; count: number }[];
  recentActivity: AccessLogWithDetails[];
}

// For real-time dashboard
export interface AccessLogStats {
  today: {
    entries: number;
    exits: number;
    denied: number;
    currentOccupancy: number;
  };
  lastHour: {
    entries: number;
    exits: number;
  };
}
