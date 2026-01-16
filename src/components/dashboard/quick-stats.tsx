import { Card, CardContent } from '@/components/ui/card';

interface StatsData {
  accessLogs: {
    total24h: number;
    deniedCount: number;
  };
  cameras: {
    total: number;
    online: number;
    offline: number;
  };
  announcements: {
    total: number;
    critical: number;
  };
  environmental: {
    status: 'normal' | 'warning' | 'critical';
  };
}

interface QuickStatsProps {
  data: StatsData;
}

export function QuickStats({ data }: QuickStatsProps) {
  const stats = [
    {
      label: 'Access Events (24h)',
      value: data.accessLogs.total24h.toString(),
      change: data.accessLogs.deniedCount > 0
        ? `${data.accessLogs.deniedCount} denied`
        : 'All approved',
      trend: data.accessLogs.deniedCount === 0 ? 'success' : 'warning',
    },
    {
      label: 'Active Cameras',
      value: `${data.cameras.online}/${data.cameras.total}`,
      change: data.cameras.offline > 0
        ? `${data.cameras.offline} offline`
        : 'All operational',
      trend: data.cameras.offline === 0 ? 'success' : 'warning',
    },
    {
      label: 'Announcements',
      value: data.announcements.total.toString(),
      change: data.announcements.critical > 0
        ? `${data.announcements.critical} critical`
        : 'No critical',
      trend: data.announcements.critical === 0 ? 'success' : 'danger',
    },
    {
      label: 'Environmental',
      value: data.environmental.status.charAt(0).toUpperCase() + data.environmental.status.slice(1),
      change: data.environmental.status === 'normal'
        ? 'Within limits'
        : 'Attention needed',
      trend: data.environmental.status === 'normal' ? 'success' : data.environmental.status === 'warning' ? 'warning' : 'danger',
    },
  ];

  const trendColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  };

  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-3xl font-semibold text-slate-900 mt-1">
              {stat.value}
            </p>
            <p className={`text-sm mt-2 ${trendColors[stat.trend as keyof typeof trendColors]}`}>
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
