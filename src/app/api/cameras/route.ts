import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/api/middleware/auth';
import { dataStore } from '@/lib/data/store';
import { successResponse, errorResponse } from '@/lib/api/response';

/**
 * GET /api/cameras
 *
 * Retrieve cameras for the authenticated user's tenant
 *
 * Query Parameters:
 * - assetId: Filter by specific asset (optional)
 * - status: Filter by status: online, offline, maintenance (optional)
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
  }

  // Check permission
  if (!user.permissions.includes('cameras:view')) {
    return errorResponse('FORBIDDEN', 'You do not have permission to view cameras', 403);
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get('assetId') || undefined;
  const status = searchParams.get('status') as 'online' | 'offline' | 'maintenance' | undefined;

  try {
    // Get cameras filtered by tenant and user's assigned assets
    const assetIds = assetId ? [assetId] : user.assignedAssets;
    let cameras = dataStore.getCameras(user.tenantId, assetIds);

    // Apply status filter if provided
    if (status) {
      cameras = cameras.filter((camera) => camera.status === status);
    }

    return successResponse(cameras);
  } catch (error) {
    console.error('Error fetching cameras:', error);
    return errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch cameras',
      500
    );
  }
}
