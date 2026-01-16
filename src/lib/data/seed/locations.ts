/**
 * Seed data for data center locations
 */

import type { DataCenterLocation } from '@/types';

export const seedLocations: DataCenterLocation[] = [
  {
    locationId: 'dc-denver-1',
    type: 'datacenter',
    name: 'Denver DC - Downtown',
    shortName: 'DEN1',
    address: {
      street: '1801 California Street',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
      country: 'USA',
    },
    status: 'operational',
    zones: [
      {
        zoneId: 'zone-north',
        name: 'North Wing',
        cages: ['cage-1a', 'cage-2a', 'cage-3a'],
        racks: ['rack-101', 'rack-102', 'rack-201'],
        environmentalSensors: [
          'sensor-north-temp-1',
          'sensor-north-temp-2',
          'sensor-north-humidity-1',
          'sensor-north-power-1',
          'sensor-north-airflow-1',
        ],
      },
      {
        zoneId: 'zone-south',
        name: 'South Wing',
        cages: ['cage-3b', 'cage-4b', 'cage-5a'],
        racks: ['rack-301'],
        environmentalSensors: [
          'sensor-south-temp-1',
          'sensor-south-temp-2',
          'sensor-south-humidity-1',
          'sensor-south-power-1',
          'sensor-south-airflow-1',
        ],
      },
    ],
    coordinates: {
      latitude: 39.7392,
      longitude: -104.9903,
    },
    weatherGridpoint: {
      office: 'BOU',
      gridX: 62,
      gridY: 60,
    },
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
];
