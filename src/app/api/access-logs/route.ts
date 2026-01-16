import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/api/middleware/auth';
import { dataStore } from '@/lib/data/store';
import { successResponse, errorResponse } from '@/lib/api/response';

/**
 * GET /api/access-logs
 *
 * Retrieve access logs for the authenticated user's tenant
 *
 * Query Parameters:
 * - limit: Number of logs to return (default: 50, max: 500)
 * - offset: Pagination offset (default: 0)
 * - assetId: Filter by specific asset (optional)
 * - startDate: ISO timestamp to filter from (optional)
 * - endDate: ISO timestamp to filter to (optional)
 * - action: Filter by action type: entry, exit, denied (optional)
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
  }

  // Check permission
  if (!user.permissions.includes('access_logs:read')) {
    return errorResponse('FORBIDDEN', 'You do not have permission to view access logs', 403);
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);

  const limit = Math.min(
    parseInt(searchParams.get('limit') || '50', 10),
    500
  );
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const assetId = searchParams.get('assetId') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const action = searchParams.get('action') as 'entry' | 'exit' | 'denied' | undefined;

  try {
    // Get logs filtered by tenant and user's assigned assets
    const result = dataStore.getAccessLogs({
      tenantId: user.tenantId,
      assetIds: assetId ? [assetId] : user.assignedAssets,
      limit,
      offset,
      startDate,
      endDate,
      action,
    });

    return successResponse(result.logs, {
      total: result.total,
      limit,
      offset,
      hasMore: offset + limit < result.total,
    });
  } catch (error) {
    console.error('Error fetching access logs:', error);
    return errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch access logs',
      500
    );
  }
}
