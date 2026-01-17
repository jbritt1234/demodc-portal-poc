'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AccessLog } from '@/types';

interface AccessLogsTableProps {
  logs: AccessLog[];
  total: number;
}

type FilterType = 'all' | 'entry' | 'exit' | 'denied';
type SortField = 'timestamp' | 'userName' | 'action' | 'asset' | 'zone' | 'success';
type SortDirection = 'asc' | 'desc';

export function AccessLogsTable({ logs, total }: AccessLogsTableProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Calculate stats
  const entriesCount = logs.filter((log) => log.action === 'entry').length;
  const exitsCount = logs.filter((log) => log.action === 'exit').length;
  const deniedCount = logs.filter((log) => log.action === 'denied').length;

  // CSV Export function
  const exportToCSV = () => {
    // CSV headers
    const headers = ['Date & Time', 'User', 'Badge ID', 'Action', 'Asset', 'Zone', 'Status'];

    // Convert logs to CSV rows
    const rows = filteredAndSortedLogs.map((log) => [
      new Date(log.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      log.userName,
      log.badgeId,
      log.action,
      log.asset,
      log.zone,
      log.success ? 'Success' : 'Denied',
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `access-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort logs
  const filteredAndSortedLogs = useMemo(() => {
    // Apply filter
    let filtered = logs;
    if (filter === 'entry') {
      filtered = logs.filter((log) => log.action === 'entry');
    } else if (filter === 'exit') {
      filtered = logs.filter((log) => log.action === 'exit');
    } else if (filter === 'denied') {
      filtered = logs.filter((log) => log.action === 'denied');
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number | boolean;
      let bValue: string | number | boolean;

      switch (sortField) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'userName':
          aValue = a.userName;
          bValue = b.userName;
          break;
        case 'action':
          aValue = a.action;
          bValue = b.action;
          break;
        case 'asset':
          aValue = a.asset;
          bValue = b.asset;
          break;
        case 'zone':
          aValue = a.zone;
          bValue = b.zone;
          break;
        case 'success':
          aValue = a.success ? 1 : 0;
          bValue = b.success ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [logs, filter, sortField, sortDirection]);

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

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const actionBadgeVariant = (action: string) => {
    if (action === 'entry') return 'success';
    if (action === 'exit') return 'info';
    return 'danger';
  };

  const successBadgeVariant = (success: boolean) => {
    return success ? 'success' : 'danger';
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Access Logs</h1>
        <p className="text-slate-600">
          View access events for your assigned cages and racks.
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
            <p className="text-sm text-slate-500">Total Events (7d)</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{total}</p>
            {filter === 'all' && (
              <p className="text-xs text-blue-600 mt-1">Showing all</p>
            )}
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === 'entry' ? 'ring-2 ring-green-500' : ''
          }`}
          onClick={() => setFilter('entry')}
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Entries</p>
            <p className="text-2xl font-semibold text-green-600 mt-1">{entriesCount}</p>
            {filter === 'entry' && (
              <p className="text-xs text-green-600 mt-1">Filtered</p>
            )}
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === 'exit' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setFilter('exit')}
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Exits</p>
            <p className="text-2xl font-semibold text-blue-600 mt-1">{exitsCount}</p>
            {filter === 'exit' && (
              <p className="text-xs text-blue-600 mt-1">Filtered</p>
            )}
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === 'denied' ? 'ring-2 ring-red-500' : ''
          }`}
          onClick={() => setFilter('denied')}
        >
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Denied</p>
            <p className="text-2xl font-semibold text-red-600 mt-1">{deniedCount}</p>
            {filter === 'denied' && (
              <p className="text-xs text-red-600 mt-1">Filtered</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Access Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Recent Access Events
              {filter !== 'all' && (
                <span className="text-sm font-normal text-slate-500 ml-2">
                  ({filteredAndSortedLogs.length} of {logs.length} events)
                </span>
              )}
            </CardTitle>
            <Button
              onClick={exportToCSV}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <span>📥</span>
              Export CSV
            </Button>
          </div>
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
                      Date & Time
                      <span className="text-xs">{getSortIcon('timestamp')}</span>
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-slate-500 cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('userName')}
                  >
                    <div className="flex items-center gap-1">
                      User
                      <span className="text-xs">{getSortIcon('userName')}</span>
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    Badge ID
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-slate-500 cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('action')}
                  >
                    <div className="flex items-center gap-1">
                      Action
                      <span className="text-xs">{getSortIcon('action')}</span>
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-slate-500 cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('asset')}
                  >
                    <div className="flex items-center gap-1">
                      Asset
                      <span className="text-xs">{getSortIcon('asset')}</span>
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
                    onClick={() => handleSort('success')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <span className="text-xs">{getSortIcon('success')}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedLogs.map((log) => (
                  <tr
                    key={log.logId}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 font-mono text-xs">
                      {log.badgeId}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={actionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {log.asset}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {log.zone}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={successBadgeVariant(log.success)}>
                        {log.success ? 'Success' : 'Denied'}
                      </Badge>
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
