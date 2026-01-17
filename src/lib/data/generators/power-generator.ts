/**
 * Power Reading Data Generator
 * Generates realistic power consumption data for racks
 */

import type { PowerReading, PowerCircuitReading, PowerCircuitSide } from '@/types';

interface PowerGeneratorConfig {
  assetId: string;
  tenantId: string;
  baseLoadKw: number; // Average power draw in kW
  variancePercent: number; // How much power varies (e.g., 10 = ±10%)
  circuitCapacityAmps: number; // Circuit breaker size (e.g., 30A)
  voltage: number; // Voltage (e.g., 208V)
}

/**
 * Generate a single circuit reading
 */
function generateCircuitReading(
  side: PowerCircuitSide,
  targetPowerKw: number,
  capacityAmps: number,
  voltage: number
): PowerCircuitReading {
  // Add slight variation between A and B sides (±5%)
  const sideVariation = (Math.random() - 0.5) * 0.1; // -5% to +5%
  const powerKw = targetPowerKw * (1 + sideVariation);

  // Calculate current from power (P = V × I)
  // power (W) = voltage (V) × current (A)
  // current (A) = power (W) / voltage (V)
  const powerWatts = powerKw * 1000;
  const current = powerWatts / voltage;

  // Calculate capacity (max power at rated amperage)
  const capacityKw = (voltage * capacityAmps) / 1000;

  // Calculate utilization percentage
  const utilizationPercent = (powerKw / capacityKw) * 100;

  return {
    side,
    voltage,
    current: parseFloat(current.toFixed(2)),
    power: parseFloat(powerKw.toFixed(3)),
    capacity: parseFloat(capacityKw.toFixed(2)),
    utilizationPercent: parseFloat(utilizationPercent.toFixed(1)),
  };
}

/**
 * Generate hourly power readings for the last 7 days
 */
export function generateHourlyPowerReadings(
  config: PowerGeneratorConfig
): PowerReading[] {
  const readings: PowerReading[] = [];
  const now = new Date();
  const hoursToGenerate = 7 * 24; // 7 days of hourly data

  for (let i = 0; i < hoursToGenerate; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // Go back i hours

    // Add daily pattern: lower at night (00:00-06:00), higher during day (09:00-17:00)
    const hour = timestamp.getHours();
    let timeOfDayMultiplier = 1.0;

    if (hour >= 0 && hour < 6) {
      timeOfDayMultiplier = 0.7; // Night - 70% of base load
    } else if (hour >= 6 && hour < 9) {
      timeOfDayMultiplier = 0.85; // Morning ramp-up
    } else if (hour >= 9 && hour < 17) {
      timeOfDayMultiplier = 1.0; // Business hours - full load
    } else if (hour >= 17 && hour < 22) {
      timeOfDayMultiplier = 0.9; // Evening
    } else {
      timeOfDayMultiplier = 0.75; // Late night
    }

    // Add random variance
    const randomVariance = (Math.random() - 0.5) * (config.variancePercent / 100) * 2;
    const powerMultiplier = timeOfDayMultiplier * (1 + randomVariance);

    // Calculate target power for this reading
    const targetPowerKw = config.baseLoadKw * powerMultiplier;

    // Generate A and B circuit readings
    const circuitA = generateCircuitReading(
      'A',
      targetPowerKw / 2, // Split power between A and B
      config.circuitCapacityAmps,
      config.voltage
    );

    const circuitB = generateCircuitReading(
      'B',
      targetPowerKw / 2,
      config.circuitCapacityAmps,
      config.voltage
    );

    // Calculate totals
    const totalPower = circuitA.power + circuitB.power;
    const totalUtilization = (circuitA.utilizationPercent + circuitB.utilizationPercent) / 2;

    readings.push({
      readingId: `pwr-${config.assetId}-${timestamp.getTime()}`,
      assetId: config.assetId,
      tenantId: config.tenantId,
      timestamp: timestamp.toISOString(),
      granularity: 'hourly',
      circuitA,
      circuitB,
      totalPower: parseFloat(totalPower.toFixed(3)),
      totalUtilizationPercent: parseFloat(totalUtilization.toFixed(1)),
    });
  }

  return readings.reverse(); // Return in chronological order (oldest first)
}

/**
 * Generate weekly average power readings for the previous 45 weeks
 * (to complete 1 year: 7 days hourly + 45 weeks = 52 weeks total)
 */
export function generateWeeklyPowerReadings(
  config: PowerGeneratorConfig
): PowerReading[] {
  const readings: PowerReading[] = [];
  const now = new Date();
  const weeksToGenerate = 45; // 45 weeks of weekly averages

  // Start from 7 days ago (where hourly data ends)
  const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < weeksToGenerate; i++) {
    // Each weekly reading represents the week ending on this date
    const weekEndDate = new Date(startDate.getTime() - i * 7 * 24 * 60 * 60 * 1000);

    // Add seasonal variation: slightly lower in summer, higher in winter
    const month = weekEndDate.getMonth();
    let seasonalMultiplier = 1.0;

    if (month >= 5 && month <= 8) {
      // Summer months (Jun-Sep): slightly lower due to less heating
      seasonalMultiplier = 0.95;
    } else if (month >= 11 || month <= 2) {
      // Winter months (Dec-Mar): slightly higher
      seasonalMultiplier = 1.05;
    }

    // Add gradual growth trend (power usage increases over time)
    const growthPerWeek = 0.001; // 0.1% per week ≈ 5% annual growth
    const weeksAgo = i;
    const growthMultiplier = 1 - weeksAgo * growthPerWeek;

    // Random variance for this week
    const randomVariance = (Math.random() - 0.5) * (config.variancePercent / 100) * 2;

    // Calculate average power for this week
    const powerMultiplier = seasonalMultiplier * growthMultiplier * (1 + randomVariance);
    const avgPowerKw = config.baseLoadKw * powerMultiplier;

    // Generate peak and min for the week (±15% from average)
    const peakPower = avgPowerKw * 1.15;
    const minPower = avgPowerKw * 0.85;

    // Generate A and B circuit readings (weekly average)
    const circuitA = generateCircuitReading(
      'A',
      avgPowerKw / 2,
      config.circuitCapacityAmps,
      config.voltage
    );

    const circuitB = generateCircuitReading(
      'B',
      avgPowerKw / 2,
      config.circuitCapacityAmps,
      config.voltage
    );

    // Calculate totals
    const totalPower = circuitA.power + circuitB.power;
    const totalUtilization = (circuitA.utilizationPercent + circuitB.utilizationPercent) / 2;

    readings.push({
      readingId: `pwr-${config.assetId}-week-${weekEndDate.getTime()}`,
      assetId: config.assetId,
      tenantId: config.tenantId,
      timestamp: weekEndDate.toISOString(),
      granularity: 'weekly',
      circuitA,
      circuitB,
      totalPower: parseFloat(totalPower.toFixed(3)),
      totalUtilizationPercent: parseFloat(totalUtilization.toFixed(1)),
      averagePower: parseFloat(avgPowerKw.toFixed(3)),
      peakPower: parseFloat(peakPower.toFixed(3)),
      minPower: parseFloat(minPower.toFixed(3)),
    });
  }

  return readings.reverse(); // Return in chronological order (oldest first)
}

/**
 * Generate complete power reading dataset for a rack
 * Returns 7 days of hourly + 45 weeks of weekly data (1 year total)
 */
export function generateRackPowerReadings(
  assetId: string,
  tenantId: string,
  rackType: 'standard' | 'high-density' | 'blade' = 'standard'
): PowerReading[] {
  // Configure based on rack type
  let config: PowerGeneratorConfig;

  switch (rackType) {
    case 'high-density':
      config = {
        assetId,
        tenantId,
        baseLoadKw: 7.5, // Higher power draw
        variancePercent: 12,
        circuitCapacityAmps: 30,
        voltage: 208,
      };
      break;

    case 'blade':
      config = {
        assetId,
        tenantId,
        baseLoadKw: 8.5, // Even higher for blade servers
        variancePercent: 15,
        circuitCapacityAmps: 30,
        voltage: 208,
      };
      break;

    case 'standard':
    default:
      config = {
        assetId,
        tenantId,
        baseLoadKw: 4.2, // Moderate power draw
        variancePercent: 10,
        circuitCapacityAmps: 30,
        voltage: 208,
      };
      break;
  }

  // Generate hourly readings for last 7 days
  const hourlyReadings = generateHourlyPowerReadings(config);

  // Generate weekly averages for previous 45 weeks
  const weeklyReadings = generateWeeklyPowerReadings(config);

  // Combine and return (weekly first, then hourly)
  return [...weeklyReadings, ...hourlyReadings];
}
