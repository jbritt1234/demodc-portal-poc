/**
 * Access Log Data Generator
 * Generates realistic access log entries with proper distribution
 */

import { v4 as uuid } from 'uuid';
import { subDays, setHours, setMinutes, setSeconds } from 'date-fns';
import type { AccessLog, AccessAction, AccessMethod } from '@/types';

// Realistic name data
const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa',
  'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley',
  'Andrew', 'Kimberly', 'Paul', 'Emily', 'Joshua', 'Donna', 'Kenneth', 'Michelle'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const ACCESS_METHODS: AccessMethod[] = ['badge', 'pin', 'biometric', 'badge+pin'];

const DENIAL_REASONS = [
  'Invalid badge',
  'Access outside authorized hours',
  'Badge expired',
  'Zone access denied',
  'Escort required'
];

/**
 * Generate a random name
 */
function generateRandomName(): string {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
}

/**
 * Generate a badge ID
 */
function generateBadgeId(): string {
  const number = Math.floor(1000 + Math.random() * 9000);
  return `BADGE-${number}`;
}

/**
 * Generate a timestamp with business hours weighting
 * 70% of logs occur during business hours (8 AM - 6 PM)
 */
function generateWeightedTimestamp(baseDate: Date): Date {
  const isBusinessHours = Math.random() < 0.7;

  if (isBusinessHours) {
    // Business hours: 8 AM - 6 PM
    const hour = 8 + Math.floor(Math.random() * 10);
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    return setSeconds(setMinutes(setHours(baseDate, hour), minute), second);
  } else {
    // Off hours: 6 PM - 8 AM
    let hour = Math.floor(Math.random() * 24);
    // Avoid business hours
    if (hour >= 8 && hour < 18) {
      hour = (hour + 10) % 24;
    }
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    return setSeconds(setMinutes(setHours(baseDate, hour), minute), second);
  }
}

/**
 * Determine if access should be successful (95% success rate)
 */
function isAccessSuccessful(): boolean {
  return Math.random() < 0.95;
}

/**
 * Generate access logs for a tenant
 *
 * @param tenantId - The tenant ID
 * @param assets - Array of assets to generate logs for
 * @param days - Number of days to generate logs for (default: 30)
 * @param logsPerDay - Average number of logs per day (default: 15)
 * @returns Array of access logs sorted by timestamp (newest first)
 */
export function generateAccessLogs(
  tenantId: string,
  assets: Array<{
    assetId: string;
    name: string;
    location: string;
    locationName: string;
    zone: string;
    zoneName: string;
  }>,
  days: number = 30,
  logsPerDay: number = 15
): AccessLog[] {
  const logs: AccessLog[] = [];
  const now = new Date();

  // Generate logs for each day
  for (let day = 0; day < days; day++) {
    const baseDate = subDays(now, day);

    // Vary the number of logs per day slightly
    const logsForDay = Math.floor(logsPerDay * (0.8 + Math.random() * 0.4));

    for (let i = 0; i < logsForDay; i++) {
      // Pick a random asset
      const asset = assets[Math.floor(Math.random() * assets.length)];

      // Generate timestamp with business hours weighting
      const timestamp = generateWeightedTimestamp(baseDate);

      // Determine success and action
      const success = isAccessSuccessful();
      const action: AccessAction = success
        ? (Math.random() < 0.5 ? 'entry' : 'exit')
        : 'denied';

      // Generate user details
      const userName = generateRandomName();
      const badgeId = generateBadgeId();
      const method = ACCESS_METHODS[Math.floor(Math.random() * ACCESS_METHODS.length)];

      // Create access point name
      const accessPoint = `${asset.name}-Door-${Math.random() < 0.5 ? 'A' : 'B'}`;

      // Build metadata
      const metadata: any = {};

      if (action === 'exit') {
        // Add duration for exit events (30 minutes to 8 hours in seconds)
        metadata.duration = Math.floor(1800 + Math.random() * 27000);
      }

      if (action === 'denied') {
        metadata.denialReason = DENIAL_REASONS[Math.floor(Math.random() * DENIAL_REASONS.length)];
      }

      // Occasionally add escort requirement
      if (Math.random() < 0.1) {
        metadata.escortRequired = true;
        metadata.escortName = generateRandomName();
      }

      logs.push({
        logId: uuid(),
        timestamp: timestamp.toISOString(),
        tenantId,
        userId: Math.random() < 0.8 ? uuid() : undefined, // 80% have userId
        userName,
        badgeId,
        accessPoint,
        location: asset.location,
        zone: asset.zone,
        asset: asset.assetId,
        action,
        method,
        success,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined
      });
    }
  }

  // Sort by timestamp descending (newest first)
  return logs.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
