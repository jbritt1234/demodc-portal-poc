'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { EnvironmentalReading } from '@/types';

interface EnvironmentalMonitorProps {
  readings: EnvironmentalReading[];
  zoneData: Array<{
    zoneId: string;
    zoneName: string;
    temperature?: EnvironmentalReading;
    humidity?: EnvironmentalReading;
    tempReadings: EnvironmentalReading[];
    humidityReadings: EnvironmentalReading[];
  }>;
  criticalCount: number;
  warningCount: number;
  normalCount: number;
}

type FilterType = 'all' | 'normal' | 'warning' | 'critical';
type SortField = 'timestamp' | 'zone' | 'type' | 'value' | 'status';
type SortDirection = 'asc' | 'desc';

export function EnvironmentalMonitor({
  readings,
  zoneData,
  criticalCount,
  warningCount,
  normalCount,
}: EnvironmentalMonitorProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter and sort readings
  const filteredAndSortedReadings = useMemo(() => {
    // Apply filter
    let filtered = readings;
    if (filter === 'normal') {
      filtered = readings.filter((r) => r.status === 'normal');
    } else if (filter === 'warning') {
      filtered = readings.filter((r) => r.status === 'warning');
    } else if (filter === 'critical') {
      filtered = readings.filter((r) => r.status === 'critical');
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'zone':
          aValue = a.zone;
          bValue = b.zone;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        case 'status':
          // Order: critical > warning > normal
          const statusOrder = { critical: 3, warning: 2, normal: 1 };
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [readings, filter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const statusBadgeVariant = (status: string) => {
    if (status === 'normal') return 'success';
    if (status === 'warning') return 'warning';
    return 'danger';
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Environmental Monitoring</h1>
        <p className="text-slate-600">
          Track temperature, humidity, and other environmental conditions.
        </p>
      </div>

      {/* Stats Summary - Clickable Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === 'all' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setFilter('all')}
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Readings (24h)</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{readings.length}</p>
            {filter === 'all' && (
              <p className="text-xs text-blue-600 mt-1">Showing all</p>
            )}
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === 'normal' ? 'ring-2 ring-green-500' : ''
          }`}
          onClick={() => setFilter('normal')}
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Normal</p>
            <p className="text-2xl font-semibold text-green-600 mt-1">{normalCount}</p>
            {filter === 'normal' && (
              <p className="text-xs text-green-600 mt-1">Filtered</p>
            )}
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === 'warning' ? 'ring-2 ring-yellow-500' : ''
          }`}
          onClick={() => setFilter('warning')}
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Warning</p>
            <p className="text-2xl font-semibold text-yellow-600 mt-1">{warningCount}</p>
            {filter === 'warning' && (
              <p className="text-xs text-yellow-600 mt-1">Filtered</p>
            )}
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === 'critical' ? 'ring-2 ring-red-500' : ''
          }`}
          onClick={() => setFilter('critical')}
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Critical</p>
            <p className="text-2xl font-semibold text-red-600 mt-1">{criticalCount}</p>
            {filter === 'critical' && (
              <p className="text-xs text-red-600 mt-1">Filtered</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Zone Cards */}
      {zoneData.map((zone) => (
        <Card key={zone.zoneId}>
          <CardHeader>
            <CardTitle>{zone.zoneName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temperature */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Temperature</span>
                  {zone.temperature && (
                    <Badge variant={statusBadgeVariant(zone.temperature.status)}>
                      {zone.temperature.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-semibold text-slate-900">
                    {zone.temperature?.value.toFixed(1) || '--'}
                  </p>
                  <span className="text-xl text-slate-500">°F</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Last updated: {zone.temperature ? new Date(zone.temperature.timestamp).toLocaleTimeString() : 'N/A'}
                </p>

                {/* Mini chart placeholder */}
                <div className="mt-4 h-20 bg-slate-200 rounded flex items-center justify-center">
                  <p className="text-xs text-slate-400">
                    📊 Last 12 hours ({zone.tempReadings.length} readings)
                  </p>
                </div>
              </div>

              {/* Humidity */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Humidity</span>
                  {zone.humidity && (
                    <Badge variant={statusBadgeVariant(zone.humidity.status)}>
                      {zone.humidity.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-semibold text-slate-900">
                    {zone.humidity?.value.toFixed(0) || '--'}
                  </p>
                  <span className="text-xl text-slate-500">%</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Last updated: {zone.humidity ? new Date(zone.humidity.timestamp).toLocaleTimeString() : 'N/A'}
                </p>

                {/* Mini chart placeholder */}
                <div className="mt-4 h-20 bg-slate-200 rounded flex items-center justify-center">
                  <p className="text-xs text-slate-400">
                    📊 Last 12 hours ({zone.humidityReadings.length} readings)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Recent Readings Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Recent Readings
            {filter !== 'all' && (
              <span className="text-sm font-normal text-slate-500 ml-2">
                ({filteredAndSortedReadings.length} of {readings.length} readings)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-slate-500 cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center gap-1">
                      Time
                      <span className="text-xs">{getSortIcon('timestamp')}</span>
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-slate-500 cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('zone')}
                  >
                    <div className="flex items-center gap-1">
                      Zone
                      <span className="text-xs">{getSortIcon('zone')}</span>
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-slate-500 cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      <span className="text-xs">{getSortIcon('type')}</span>
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-slate-500 cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('value')}
                  >
                    <div className="flex items-center gap-1">
                      Value
                      <span className="text-xs">{getSortIcon('value')}</span>
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-slate-500 cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <span className="text-xs">{getSortIcon('status')}</span>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    Sensor ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedReadings.slice(0, 50).map((reading) => (
                  <tr
                    key={reading.readingId}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {new Date(reading.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {reading.zone === 'zone-north' ? 'North Wing' : 'South Wing'}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900 capitalize">
                      {reading.type}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">
                      {reading.value.toFixed(1)} {reading.unit === 'fahrenheit' ? '°F' : '%'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusBadgeVariant(reading.status)}>
                        {reading.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-mono">
                      {reading.sensorId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
