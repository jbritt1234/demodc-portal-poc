import { getAuthUser } from '@/lib/api/middleware/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { AnnouncementsFeed } from '@/components/dashboard/announcements-feed';
import { RecentAccessLogs } from '@/components/dashboard/recent-access-logs';

async function getDashboardData() {
  // Import init to trigger data store initialization
  await import('@/lib/data/init');
  // In a server component, we can't use cookies directly for fetch
  // So we'll use the data store directly for now
  // In production, this would be an internal API call
  const { dataStore } = await import('@/lib/data/store');

  const user = await getAuthUser();
  if (!user) {
    return null;
  }

  // Get recent access logs (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const accessLogsResult = dataStore.getAccessLogs({
    tenantId: user.tenantId,
    assetIds: user.assignedAssets,
    startDate: oneDayAgo,
    limit: 10,
    offset: 0,
  });

  // Get cameras
  const cameras = dataStore.getCameras(user.tenantId, user.assignedAssets);
  const cameraStats = {
    total: cameras.length,
    online: cameras.filter((c) => c.status === 'online').length,
    offline: cameras.filter((c) => c.status === 'offline').length,
    maintenance: cameras.filter((c) => c.status === 'maintenance').length,
  };

  // Get active announcements
  const now = new Date();
  const announcements = dataStore
    .getAnnouncements({
      tenantId: user.tenantId,
      limit: 50,
    })
    .filter((ann) => !ann.expiresAt || new Date(ann.expiresAt) > now);

  // Get environmental readings (last hour)
  const envReadings = dataStore.getEnvironmentalReadings({
    location: 'dc-denver-1',
    hours: 1,
  });

  // Calculate environmental status
  const criticalReadings = envReadings.filter((r) => r.status === 'critical').length;
  const warningReadings = envReadings.filter((r) => r.status === 'warning').length;
  const environmentalStatus = criticalReadings > 0
    ? 'critical'
    : warningReadings > 0
    ? 'warning'
    : 'normal';

  // Get latest temperature and humidity
  const latestTemp = envReadings
    .filter((r) => r.type === 'temperature')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  const latestHumidity = envReadings
    .filter((r) => r.type === 'humidity')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  return {
    user,
    accessLogs: {
      total24h: accessLogsResult.total,
      recent: accessLogsResult.logs,
      deniedCount: accessLogsResult.logs.filter((log) => log.action === 'denied').length,
    },
    cameras: cameraStats,
    announcements: {
      total: announcements.length,
      critical: announcements.filter((a) => a.severity === 'critical').length,
      items: announcements,
    },
    environmental: {
      status: environmentalStatus as 'normal' | 'warning' | 'critical',
      temperature: latestTemp,
      humidity: latestHumidity,
    },
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">
          Welcome back, {data.user.firstName}. Here&apos;s what&apos;s happening at your data center.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickStats
          data={{
            accessLogs: {
              total24h: data.accessLogs.total24h,
              deniedCount: data.accessLogs.deniedCount,
            },
            cameras: data.cameras,
            announcements: {
              total: data.announcements.total,
              critical: data.announcements.critical,
            },
            environmental: {
              status: data.environmental.status,
            },
          }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Environmental Summary */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Temperature */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Temperature</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        data.environmental.temperature?.status === 'normal'
                          ? 'bg-green-100 text-green-800'
                          : data.environmental.temperature?.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {data.environmental.temperature?.status || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-3xl font-semibold text-slate-900">
                    {data.environmental.temperature?.value.toFixed(1) || '--'}°F
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Zone: {data.environmental.temperature?.zone || 'Unknown'}
                  </p>
                </div>

                {/* Humidity */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Humidity</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        data.environmental.humidity?.status === 'normal'
                          ? 'bg-green-100 text-green-800'
                          : data.environmental.humidity?.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {data.environmental.humidity?.status || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-3xl font-semibold text-slate-900">
                    {data.environmental.humidity?.value.toFixed(0) || '--'}%
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Zone: {data.environmental.humidity?.zone || 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AnnouncementsFeed announcements={data.announcements.items} />
        </div>
      </div>

      {/* Recent Access Logs */}
      <RecentAccessLogs logs={data.accessLogs.recent} />
    </div>
  );
}
