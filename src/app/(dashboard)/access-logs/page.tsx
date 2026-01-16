import { getAuthUser } from '@/lib/api/middleware/auth';
import '@/lib/data/init'; // Initialize data store
import { dataStore } from '@/lib/data/store';
import { AccessLogsTable } from '@/components/access-logs/access-logs-table';

async function getAccessLogs() {
  const user = await getAuthUser();
  if (!user) return null;

  // Get access logs for the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const result = dataStore.getAccessLogs({
    tenantId: user.tenantId,
    assetIds: user.assignedAssets,
    startDate: sevenDaysAgo,
    limit: 100,
    offset: 0,
  });

  return { user, logs: result.logs, total: result.total };
}

export default async function AccessLogsPage() {
  const data = await getAccessLogs();

  if (!data) {
    return <div>Loading...</div>;
  }

  return <AccessLogsTable logs={data.logs} total={data.total} />;
}
