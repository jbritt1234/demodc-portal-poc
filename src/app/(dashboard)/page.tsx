'use client';

// Placeholder dashboard with mock data
// TODO: Replace with real API calls in Phase 4

const mockStats = [
  { label: 'Access Events Today', value: '47', change: '+12%', trend: 'up' },
  { label: 'Current Occupancy', value: '8', change: '3 exits pending', trend: 'neutral' },
  { label: 'Online Cameras', value: '6/6', change: 'All operational', trend: 'up' },
  { label: 'Active Alerts', value: '0', change: 'No issues', trend: 'up' },
];

const mockAnnouncements = [
  {
    id: '1',
    title: 'Scheduled Maintenance',
    message: 'HVAC maintenance scheduled for January 20th, 2AM-4AM MST.',
    severity: 'info',
    time: '2 hours ago',
  },
  {
    id: '2',
    title: 'Network Upgrade Complete',
    message: 'Core switch upgrade completed successfully. Throughput increased by 40%.',
    severity: 'success',
    time: '1 day ago',
  },
];

const mockAccessLogs = [
  { name: 'James Wilson', action: 'Entry', asset: 'Cage 5A', time: '10 min ago', status: 'success' },
  { name: 'Sarah Chen', action: 'Exit', asset: 'Rack 101', time: '25 min ago', status: 'success' },
  { name: 'Michael Brown', action: 'Entry', asset: 'Cage 5A', time: '1 hour ago', status: 'success' },
  { name: 'Unknown Badge', action: 'Denied', asset: 'Rack 102', time: '2 hours ago', status: 'denied' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-[var(--muted-foreground)]">
          Welcome back, John. Here&apos;s what&apos;s happening at your data center.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6"
          >
            <p className="text-sm text-[var(--muted-foreground)]">{stat.label}</p>
            <p className="text-3xl font-semibold text-[var(--foreground)] mt-1">{stat.value}</p>
            <p className={`text-sm mt-2 ${
              stat.trend === 'up' ? 'text-[var(--success)]' : 'text-[var(--muted-foreground)]'
            }`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Environmental Summary */}
        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Environmental Conditions
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {/* Temperature */}
            <div className="bg-[var(--muted)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--muted-foreground)]">Temperature</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--success-light)] text-[var(--success)]">
                  Normal
                </span>
              </div>
              <p className="text-3xl font-semibold text-[var(--foreground)]">68.5°F</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Range: 64°F - 75°F
              </p>
            </div>
            {/* Humidity */}
            <div className="bg-[var(--muted)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--muted-foreground)]">Humidity</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--success-light)] text-[var(--success)]">
                  Normal
                </span>
              </div>
              <p className="text-3xl font-semibold text-[var(--foreground)]">45%</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Range: 30% - 60%
              </p>
            </div>
          </div>
          {/* Chart Placeholder */}
          <div className="mt-6 h-48 bg-[var(--muted)] rounded-lg flex items-center justify-center">
            <p className="text-[var(--muted-foreground)]">
              Temperature/Humidity Chart (Coming in Phase 5)
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Local Weather
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-4xl">🌤️</div>
              <div>
                <p className="text-3xl font-semibold text-[var(--foreground)]">42°F</p>
                <p className="text-sm text-[var(--muted-foreground)]">Denver, CO</p>
                <p className="text-sm text-[var(--muted-foreground)]">Partly Cloudy</p>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Announcements
            </h2>
            <div className="space-y-4">
              {mockAnnouncements.map((announcement) => (
                <div key={announcement.id} className="border-l-4 border-[var(--primary)] pl-4">
                  <p className="font-medium text-[var(--foreground)]">{announcement.title}</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {announcement.message}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-2">
                    {announcement.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Access Logs */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Recent Access Activity
          </h2>
          <a href="/access-logs" className="text-sm text-[var(--primary)] hover:underline">
            View All →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-foreground)]">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-foreground)]">
                  Action
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-foreground)]">
                  Asset
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-foreground)]">
                  Time
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-foreground)]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {mockAccessLogs.map((log, index) => (
                <tr key={index} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-3 px-4 text-sm text-[var(--foreground)]">{log.name}</td>
                  <td className="py-3 px-4 text-sm text-[var(--foreground)]">{log.action}</td>
                  <td className="py-3 px-4 text-sm text-[var(--foreground)]">{log.asset}</td>
                  <td className="py-3 px-4 text-sm text-[var(--muted-foreground)]">{log.time}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.status === 'success'
                          ? 'bg-[var(--success-light)] text-[var(--success)]'
                          : 'bg-[var(--danger-light)] text-[var(--danger)]'
                      }`}
                    >
                      {log.status === 'success' ? 'Success' : 'Denied'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POC Notice */}
      <div className="bg-[var(--info-light)] border border-[var(--info)] rounded-xl p-4 text-center">
        <p className="text-sm text-[var(--info)]">
          <strong>POC Demo:</strong> This dashboard displays simulated data.
          Real API integration will be implemented in Phase 4.
        </p>
      </div>
    </div>
  );
}
