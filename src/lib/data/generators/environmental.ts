/**
 * Environmental Data Generator
 * Generates realistic temperature and humidity readings with natural variation
 */

import { v4 as uuid } from 'uuid';
import { subHours } from 'date-fns';
import type { EnvironmentalReading, ReadingStatus } from '@/types';

// Temperature thresholds (Fahrenheit)
const TEMP_THRESHOLDS = {
  warningLow: 65,
  warningHigh: 75,
  criticalLow: 60,
  criticalHigh: 80
};

// Humidity thresholds (percentage)
const HUMIDITY_THRESHOLDS = {
  warningLow: 35,
  warningHigh: 55,
  criticalLow: 30,
  criticalHigh: 60
};

/**
 * Calculate status based on value and thresholds
 */
function calculateStatus(
  value: number,
  thresholds: {
    warningLow?: number;
    warningHigh?: number;
    criticalLow?: number;
    criticalHigh?: number;
  }
): ReadingStatus {
  const { warningLow, warningHigh, criticalLow, criticalHigh } = thresholds;

  if (
    (criticalLow !== undefined && value <= criticalLow) ||
    (criticalHigh !== undefined && value >= criticalHigh)
  ) {
    return 'critical';
  }

  if (
    (warningLow !== undefined && value <= warningLow) ||
    (warningHigh !== undefined && value >= warningHigh)
  ) {
    return 'warning';
  }

  return 'normal';
}

/**
 * Generate temperature value with sine wave and noise
 * Base temperature with natural daily variation
 */
function generateTemperature(hourIndex: number, baseTemp: number = 68): number {
  // Sine wave for daily cycle (±3°F)
  const sineWave = Math.sin((hourIndex * Math.PI) / 12) * 3;

  // Random noise (±0.5°F)
  const noise = (Math.random() - 0.5) * 1;

  return Number((baseTemp + sineWave + noise).toFixed(1));
}

/**
 * Generate humidity value with slower sine wave and noise
 * Base humidity with natural variation
 */
function generateHumidity(hourIndex: number, baseHumidity: number = 45): number {
  // Slower sine wave for humidity (±5%)
  const sineWave = Math.sin((hourIndex * Math.PI) / 18) * 5;

  // Random noise (±1%)
  const noise = (Math.random() - 0.5) * 2;

  // Clamp between 0 and 100
  const value = baseHumidity + sineWave + noise;
  return Number(Math.max(0, Math.min(100, value)).toFixed(1));
}

/**
 * Generate environmental readings for a location
 *
 * @param locationId - The location ID
 * @param zones - Array of zones to generate readings for
 * @param hours - Number of hours to generate readings for (default: 24)
 * @returns Array of environmental readings sorted by timestamp (newest first)
 */
export function generateEnvironmentalReadings(
  locationId: string,
  zones: Array<{
    zoneId: string;
    zoneName: string;
    tenantId?: string;
  }>,
  hours: number = 24
): EnvironmentalReading[] {
  const readings: EnvironmentalReading[] = [];
  const now = new Date();

  // Generate readings for each hour
  for (let hourIndex = 0; hourIndex < hours; hourIndex++) {
    const timestamp = subHours(now, hourIndex);

    // Generate readings for each zone
    for (const zone of zones) {
      // Vary base temperature slightly per zone
      const baseTemp = 68 + (Math.random() - 0.5) * 4;

      // Vary base humidity slightly per zone
      const baseHumidity = 45 + (Math.random() - 0.5) * 10;

      // Generate temperature reading
      const tempValue = generateTemperature(hourIndex, baseTemp);
      const tempStatus = calculateStatus(tempValue, TEMP_THRESHOLDS);

      readings.push({
        readingId: uuid(),
        timestamp: timestamp.toISOString(),
        location: locationId,
        zone: zone.zoneId,
        sensorId: `temp-sensor-${zone.zoneId}`,
        type: 'temperature',
        value: tempValue,
        unit: 'fahrenheit',
        status: tempStatus,
        visibility: zone.tenantId ? 'tenant-specific' : 'public',
        tenantId: zone.tenantId
      });

      // Generate humidity reading
      const humidityValue = generateHumidity(hourIndex, baseHumidity);
      const humidityStatus = calculateStatus(humidityValue, HUMIDITY_THRESHOLDS);

      readings.push({
        readingId: uuid(),
        timestamp: timestamp.toISOString(),
        location: locationId,
        zone: zone.zoneId,
        sensorId: `humidity-sensor-${zone.zoneId}`,
        type: 'humidity',
        value: humidityValue,
        unit: 'percentage',
        status: humidityStatus,
        visibility: zone.tenantId ? 'tenant-specific' : 'public',
        tenantId: zone.tenantId
      });
    }
  }

  // Sort by timestamp descending (newest first)
  return readings.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
