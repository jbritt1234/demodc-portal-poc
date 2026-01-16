import { getAuthUser } from '@/lib/api/middleware/auth';
import { dataStore } from '@/lib/data/store';
import { successResponse, errorResponse } from '@/lib/api/response';

/**
 * GET /api/dashboard/summary
 *
 * Retrieve dashboard summary metrics for the authenticated user
 *
 * Returns:
 * - Total access logs (last 24 hours)
 * - Recent access logs (last 10)
 * - Camera counts by status
 * - Active announcements
 * - Environmental status summary
 */
export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
  }

  try {
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
      location: 'dc-denver-1', // Hardcoded for POC
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

    // Build summary
    const summary = {
      user: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      },
      accessLogs: {
        total24h: accessLogsResult.total,
        recent: accessLogsResult.logs,
        deniedCount: accessLogsResult.logs.filter((log) => log.action === 'denied').length,
      },
      cameras: cameraStats,
      announcements: {
        total: announcements.length,
        critical: announcements.filter((a) => a.severity === 'critical').length,
        warning: announcements.filter((a) => a.severity === 'warning').length,
        items: announcements,
      },
      environmental: {
        status: environmentalStatus,
        totalReadings: envReadings.length,
        criticalCount: criticalReadings,
        warningCount: warningReadings,
      },
    };

    return successResponse(summary);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch dashboard summary',
      500
    );
  }
}
