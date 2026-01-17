/**
 * Camera Types
 */

export type CameraType = 'interior' | 'entrance' | 'exterior' | 'hallway';
export type CameraVisibility = 'public' | 'tenant-specific' | 'restricted';
export type CameraStatus = 'online' | 'offline' | 'maintenance';

export interface CameraMetadata {
  resolution?: string;
  fps?: number;
  ptz?: boolean; // pan-tilt-zoom capability
  nightVision?: boolean;
  audioEnabled?: boolean;
  model?: string;
  installDate?: string;
  fieldOfView?: string;
  motionDetection?: boolean;
}

export interface Camera {
  cameraId: string;
  name: string;
  location: string; // locationId
  zone: string; // zoneId
  assetId: string; // The asset this camera is monitoring
  streamUrl: string;
  thumbnailUrl?: string;
  type: CameraType;
  visibility: CameraVisibility;
  assignedTenants: string[];
  assignedAssets?: string[]; // For asset-specific cameras
  status: CameraStatus;
  metadata?: CameraMetadata;
  createdAt: string;
  updatedAt?: string;
}

export interface CameraWithDetails extends Camera {
  locationName: string;
  zoneName: string;
  assetNames?: string[];
}

export interface CameraSummary {
  cameraId: string;
  name: string;
  location: string;
  locationName: string;
  type: CameraType;
  status: CameraStatus;
}

// Query parameters for camera API
export interface CameraQueryParams {
  tenantId?: string;
  locationId?: string;
  assetId?: string;
  zoneId?: string;
  type?: CameraType;
  status?: CameraStatus;
}

// For camera grid display
export interface CameraFeed {
  cameraId: string;
  name: string;
  streamUrl: string;
  status: CameraStatus;
  type: CameraType;
  locationName: string;
  zoneName: string;
}

// Camera snapshot (for static image preview)
export interface CameraSnapshot {
  cameraId: string;
  imageUrl: string;
  timestamp: string;
}
