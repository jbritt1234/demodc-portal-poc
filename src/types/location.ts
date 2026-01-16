/**
 * Data Center Location Types
 */

export type LocationStatus = 'operational' | 'maintenance' | 'offline';

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface DataCenterZone {
  zoneId: string;
  name: string;
  cages: string[];
  racks?: string[];
  environmentalSensors: string[];
}

export interface DataCenterLocation {
  locationId: string;
  type: 'datacenter';
  name: string;
  shortName?: string;
  address: Address;
  status: LocationStatus;
  zones: DataCenterZone[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  // For NWS API weather lookup
  weatherGridpoint?: {
    office: string;
    gridX: number;
    gridY: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface LocationSummary {
  locationId: string;
  name: string;
  shortName?: string;
  city: string;
  state: string;
  status: LocationStatus;
  zoneCount: number;
  assetCount: number;
}

export interface LocationWithAssets extends DataCenterLocation {
  totalCages: number;
  totalRacks: number;
  onlineCameras: number;
  totalCameras: number;
}
