/**
 * Environmental Monitoring Types
 */

export type SensorType = 'temperature' | 'humidity' | 'power' | 'airflow';
export type SensorUnit = 'fahrenheit' | 'celsius' | 'percentage' | 'watts' | 'cfm';
export type ReadingStatus = 'normal' | 'warning' | 'critical';
export type SensorVisibility = 'public' | 'tenant-specific';

export interface EnvironmentalReading {
  readingId: string;
  timestamp: string;
  location: string; // locationId
  zone: string; // zoneId
  sensorId: string;
  type: SensorType;
  value: number;
  unit: SensorUnit;
  status: ReadingStatus;
  visibility: SensorVisibility;
  tenantId?: string; // If tenant-specific
}

export interface Sensor {
  sensorId: string;
  name: string;
  type: SensorType;
  unit: SensorUnit;
  location: string;
  zone: string;
  assetId?: string; // If mounted on specific asset
  visibility: SensorVisibility;
  tenantId?: string;
  thresholds: SensorThresholds;
  status: 'online' | 'offline' | 'calibrating';
  lastReading?: number;
  lastReadingTime?: string;
}

export interface SensorThresholds {
  warningLow?: number;
  warningHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
}

// Current readings for dashboard
export interface CurrentEnvironmentalData {
  temperature: {
    value: number;
    unit: SensorUnit;
    status: ReadingStatus;
    trend: 'rising' | 'falling' | 'stable';
  };
  humidity: {
    value: number;
    unit: SensorUnit;
    status: ReadingStatus;
    trend: 'rising' | 'falling' | 'stable';
  };
  power?: {
    value: number;
    unit: SensorUnit;
    status: ReadingStatus;
  };
}

// Historical data for charts
export interface EnvironmentalHistoryPoint {
  timestamp: string;
  value: number;
}

export interface EnvironmentalHistory {
  sensorId: string;
  sensorName: string;
  type: SensorType;
  unit: SensorUnit;
  readings: EnvironmentalHistoryPoint[];
  averageValue: number;
  minValue: number;
  maxValue: number;
}

// Alerts
export interface EnvironmentalAlert {
  alertId: string;
  timestamp: string;
  sensorId: string;
  sensorName: string;
  type: SensorType;
  location: string;
  zone: string;
  severity: 'warning' | 'critical';
  value: number;
  threshold: number;
  direction: 'above' | 'below';
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

// Query parameters
export interface EnvironmentalQueryParams {
  tenantId?: string;
  locationId?: string;
  zoneId?: string;
  sensorId?: string;
  type?: SensorType;
  startDate?: string;
  endDate?: string;
}

// Zone summary for environmental page
export interface ZoneEnvironmentalSummary {
  zoneId: string;
  zoneName: string;
  locationId: string;
  locationName: string;
  temperature: {
    current: number;
    min24h: number;
    max24h: number;
    status: ReadingStatus;
  };
  humidity: {
    current: number;
    min24h: number;
    max24h: number;
    status: ReadingStatus;
  };
  activeAlerts: number;
}
