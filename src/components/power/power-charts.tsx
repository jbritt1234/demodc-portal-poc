'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PowerHistoryChart } from './power-history-chart';
import type { PowerReading } from '@/types';

interface PowerChartsProps {
  allReadings: PowerReading[];
  rackName: string;
}

type TimeRange = '7d' | '30d' | '6m' | '1y';

export function PowerCharts({ allReadings, rackName }: PowerChartsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const filteredReadings = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    return allReadings.filter(
      (reading) => new Date(reading.timestamp) >= startDate
    );
  }, [allReadings, timeRange]);

  // Calculate statistics for the selected period
  const stats = useMemo(() => {
    if (filteredReadings.length === 0) {
      return { average: 0, peak: 0, min: 0 };
    }

    const powers = filteredReadings.map((r) => r.totalPower);
    const average = powers.reduce((sum, p) => sum + p, 0) / powers.length;
    const peak = Math.max(...powers);
    const min = Math.min(...powers);

    return { average, peak, min };
  }, [filteredReadings]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Power History - {rackName}
          </h2>

          {/* Time range selector */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {(['7d', '30d', '6m', '1y'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  timeRange === range
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === '7d' && '7 Days'}
                {range === '30d' && '30 Days'}
                {range === '6m' && '6 Months'}
                {range === '1y' && '1 Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Average</p>
            <p className="text-lg font-semibold text-slate-900 mt-1">
              {stats.average.toFixed(2)} kW
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Peak</p>
            <p className="text-lg font-semibold text-red-600 mt-1">
              {stats.peak.toFixed(2)} kW
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Minimum</p>
            <p className="text-lg font-semibold text-green-600 mt-1">
              {stats.min.toFixed(2)} kW
            </p>
          </div>
        </div>

        {/* Chart */}
        <PowerHistoryChart readings={filteredReadings} height={350} />

        {/* Data info */}
        <div className="mt-4 text-xs text-slate-500 text-center">
          Showing {filteredReadings.length} data points over the last{' '}
          {timeRange === '7d' && '7 days'}
          {timeRange === '30d' && '30 days'}
          {timeRange === '6m' && '6 months'}
          {timeRange === '1y' && '1 year'}
        </div>
      </CardContent>
    </Card>
  );
}
