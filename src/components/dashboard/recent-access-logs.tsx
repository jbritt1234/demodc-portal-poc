import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AccessLog } from '@/types';

interface RecentAccessLogsProps {
  logs: AccessLog[];
}

export function RecentAccessLogs({ logs }: RecentAccessLogsProps) {
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const actionBadgeVariant = (action: string) => {
    if (action === 'entry') return 'info';
    if (action === 'exit') return 'default';
    return 'danger';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Access Activity</CardTitle>
        <Link
          href="/access-logs"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View All →
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  User
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  Action
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  Asset
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 5).map((log) => (
                <tr
                  key={log.logId}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-3 px-4 text-sm text-slate-900">
                    {log.userName}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={actionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-900">
                    {log.asset}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">
                    {formatTimeAgo(log.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
