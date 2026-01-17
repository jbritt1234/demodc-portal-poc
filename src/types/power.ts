/**
 * Power Utilization Types
 */

// Power circuit side (dual redundant power)
export type PowerCircuitSide = 'A' | 'B';

// Granularity of power reading
export type PowerReadingGranularity = 'hourly' | 'daily' | 'weekly' | 'monthly';

// Power circuit reading (A-side or B-side)
export interface PowerCircuitReading {
  side: PowerCircuitSide;
  voltage: number; // Volts (typically 208V)
  current: number; // Amps
  power: number; // Kilowatts (calculated: voltage × current / 1000)
  capacity: number; // Maximum capacity in kW (e.g., 30A @ 208V = 6.24 kW)
  utilizationPercent: number; // Percentage of capacity being used
}

// Single power reading for a rack at a point in time
export interface PowerReading {
  readingId: string;
  assetId: string; // Rack ID
  tenantId: string;
  timestamp: string; // ISO 8601 timestamp
  granularity: PowerReadingGranularity;

  // A-side circuit
  circuitA: PowerCircuitReading;

  // B-side circuit
  circuitB: PowerCircuitReading;

  // Combined totals
  totalPower: number; // kW (A + B)
  totalUtilizationPercent: number; // Average of A and B

  // Metadata
  peakPower?: number; // For aggregated readings (daily/weekly/monthly)
  minPower?: number; // For aggregated readings
  averagePower?: number; // For aggregated readings
}

// Power summary for a rack
export interface RackPowerSummary {
  assetId: string;
  assetName: string;
  tenantId: string;

  // Current state (most recent reading)
  currentPower: number; // kW
  currentUtilization: number; // %
  circuitAStatus: PowerCircuitStatus;
  circuitBStatus: PowerCircuitStatus;

  // Circuit details
  circuitA: PowerCircuitReading;
  circuitB: PowerCircuitReading;

  // Capacity
  totalCapacity: number; // kW (A + B maximum)
  recommendedMax: number; // kW (80% of capacity for continuous use)

  // Statistics
  peak24h: number; // kW
  peak7d: number; // kW
  peak30d: number; // kW
  average24h: number; // kW
  average7d: number; // kW
  average30d: number; // kW

  // Cost estimation
  monthlyKwh: number; // Total kWh for current month
  estimatedMonthlyCost: number; // USD
}

// Circuit health status
export type PowerCircuitStatus = 'normal' | 'warning' | 'critical' | 'offline';

// Power alert/threshold configuration
export interface PowerThreshold {
  assetId: string;
  warningPercent: number; // e.g., 70%
  criticalPercent: number; // e.g., 85%
}

// Power cost rate
export interface PowerCostRate {
  locationId: string;
  costPerKwh: number; // USD per kWh
  currency: string; // 'USD'
  effectiveDate: string;
}

// Query parameters for power API
export interface PowerQueryParams {
  tenantId?: string;
  assetId?: string;
  startDate?: string;
  endDate?: string;
  granularity?: PowerReadingGranularity;
  limit?: number;
  offset?: number;
}

// Power statistics for dashboard
export interface PowerStatistics {
  totalCurrentPower: number; // kW across all racks
  totalCapacity: number; // kW maximum across all racks
  averageUtilization: number; // % average across all racks
  totalRacks: number;
  racksAtWarning: number; // Count of racks > warning threshold
  racksAtCritical: number; // Count of racks > critical threshold
  monthToDateKwh: number; // Total kWh this month
  estimatedMonthlyCost: number; // USD estimated for this month
  previousMonthKwh: number; // Total kWh last month
  previousMonthCost: number; // USD cost last month
  monthOverMonthChange: number; // % change from last month
}

// Historical power data point for charting
export interface PowerDataPoint {
  timestamp: string;
  date: string; // Human-readable date (e.g., "Jan 15" or "Week 3")
  power: number; // kW
  peak?: number; // kW (for aggregated data)
  average?: number; // kW (for aggregated data)
}

// Circuit balance health
export interface CircuitBalance {
  assetId: string;
  assetName: string;
  circuitAPower: number; // kW
  circuitBPower: number; // kW
  differencePercent: number; // % difference between A and B
  isBalanced: boolean; // True if difference < 20%
  status: 'balanced' | 'minor-imbalance' | 'major-imbalance';
}
