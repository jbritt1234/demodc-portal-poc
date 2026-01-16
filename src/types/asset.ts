/**
 * Asset (Cage/Rack) Types
 */

export type AssetType = 'cage' | 'rack';
export type AssetSize = '10U' | '20U' | '42U' | 'half-cage' | 'full-cage';
export type AssetStatus = 'active' | 'available' | 'maintenance';

export interface AssetMetadata {
  powerCircuits?: string[];
  networkPorts?: string[];
  maxPowerKw?: number;
  coolingCapacity?: string;
  notes?: string;
}

export interface Asset {
  assetId: string;
  type: AssetType;
  location: string; // locationId
  zone: string; // zoneId
  name: string;
  tenantId: string;
  size: AssetSize;
  status: AssetStatus;
  assignedCameras: string[];
  accessPoints: string[];
  metadata?: AssetMetadata;
  createdAt: string;
  updatedAt?: string;
}

export interface AssetSummary {
  assetId: string;
  type: AssetType;
  name: string;
  location: string;
  locationName: string;
  zone: string;
  zoneName: string;
  size: AssetSize;
  status: AssetStatus;
  cameraCount: number;
}

export interface AssetWithDetails extends Asset {
  locationName: string;
  zoneName: string;
  tenantName: string;
  recentAccessCount: number;
  lastAccess?: string;
}

// Access point for door/entry control
export interface AccessPoint {
  accessPointId: string;
  name: string;
  assetId: string;
  type: 'door' | 'gate' | 'turnstile';
  location: string;
  zone: string;
  status: 'online' | 'offline' | 'maintenance';
}
