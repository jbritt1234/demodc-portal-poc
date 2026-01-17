'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import type { PowerReading } from '@/types';

interface PowerHistoryChartProps {
  readings: PowerReading[];
  title?: string;
  height?: number;
}

export function PowerHistoryChart({ readings, title, height = 300 }: PowerHistoryChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  // Update width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  const chartData = useMemo(() => {
    if (readings.length === 0) return null;

    // Sort readings by timestamp
    const sorted = [...readings].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Find min and max power values for scaling
    const powerValues = sorted.map((r) => r.totalPower);
    const minPower = Math.min(...powerValues);
    const maxPower = Math.max(...powerValues);

    // Add some padding to the scale (10% on each side)
    const padding = (maxPower - minPower) * 0.1;
    const scaledMin = Math.max(0, minPower - padding);
    const scaledMax = maxPower + padding;

    return {
      readings: sorted,
      minPower: scaledMin,
      maxPower: scaledMax,
      range: scaledMax - scaledMin,
    };
  }, [readings]);

  if (!chartData || chartData.readings.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-slate-50 rounded-lg"
        style={{ height: `${height}px` }}
      >
        <p className="text-slate-500">No data available</p>
      </div>
    );
  }

  const { readings: sortedReadings, minPower, maxPower, range } = chartData;

  // Chart dimensions (width is now dynamic from state)
  const chartHeight = height - 60; // Leave space for labels
  const padding = { top: 20, right: 40, bottom: 30, left: 60 };
  const chartWidth = width - padding.left - padding.right;

  // Calculate points for the line
  const points = sortedReadings.map((reading, index) => {
    const x = padding.left + (index / (sortedReadings.length - 1)) * chartWidth;
    const y =
      padding.top + chartHeight - ((reading.totalPower - minPower) / range) * chartHeight;
    return { x, y, reading };
  });

  // Create path for main line
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Create area fill path
  const areaPath = `
    M ${padding.left} ${padding.top + chartHeight}
    ${points.map((p) => `L ${p.x} ${p.y}`).join(' ')}
    L ${padding.left + chartWidth} ${padding.top + chartHeight}
    Z
  `;

  // Y-axis labels (5 labels)
  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const value = maxPower - (i / 4) * range;
    const y = padding.top + (i / 4) * chartHeight;
    return { value, y };
  });

  // X-axis labels (show every nth point to avoid crowding)
  const labelInterval = Math.ceil(sortedReadings.length / 8);
  const xLabels = sortedReadings
    .filter((_, i) => i % labelInterval === 0 || i === sortedReadings.length - 1)
    .map((reading, i) => {
      const pointIndex = sortedReadings.indexOf(reading);
      const x = padding.left + (pointIndex / (sortedReadings.length - 1)) * chartWidth;
      const date = new Date(reading.timestamp);

      // Format label based on granularity
      let label = '';
      if (reading.granularity === 'hourly') {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (reading.granularity === 'weekly') {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        label = date.toLocaleDateString('en-US', { month: 'short' });
      }

      return { x, label, date };
    });

  return (
    <div className="w-full" ref={containerRef}>
      {title && <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>}
      <div className="w-full">
        <svg width={width} height={height} className="bg-white rounded-lg w-full">
          {/* Grid lines */}
          <g className="grid-lines">
            {yLabels.map((label, i) => (
              <line
                key={i}
                x1={padding.left}
                y1={label.y}
                x2={padding.left + chartWidth}
                y2={label.y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* Area fill */}
          <path d={areaPath} fill="url(#powerGradient)" opacity="0.3" />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="powerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Main line */}
          <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" />

          {/* Data points */}
          {points.map((point, i) => (
            <g key={i}>
              <circle cx={point.x} cy={point.y} r="3" fill="#3b82f6" />
              <title>
                {new Date(point.reading.timestamp).toLocaleString()}:{' '}
                {point.reading.totalPower.toFixed(2)} kW
              </title>
            </g>
          ))}

          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="#64748b"
            strokeWidth="1"
          />

          {/* Y-axis labels */}
          {yLabels.map((label, i) => (
            <text
              key={i}
              x={padding.left - 10}
              y={label.y}
              textAnchor="end"
              alignmentBaseline="middle"
              className="text-xs fill-slate-600"
            >
              {label.value.toFixed(1)}
            </text>
          ))}

          {/* Y-axis title */}
          <text
            x={padding.left - 45}
            y={padding.top + chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, ${padding.left - 45}, ${padding.top + chartHeight / 2})`}
            className="text-xs fill-slate-600 font-medium"
          >
            Power (kW)
          </text>

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke="#64748b"
            strokeWidth="1"
          />

          {/* X-axis labels */}
          {xLabels.map((label, i) => (
            <text
              key={i}
              x={label.x}
              y={padding.top + chartHeight + 20}
              textAnchor="middle"
              className="text-xs fill-slate-600"
            >
              {label.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
