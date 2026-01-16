import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/api/middleware/auth';
import { dataStore } from '@/lib/data/store';
import { successResponse, errorResponse } from '@/lib/api/response';

/**
 * GET /api/announcements
 *
 * Retrieve announcements for the authenticated user's tenant
 *
 * Query Parameters:
 * - severity: Filter by severity: critical, warning, info (optional)
 * - activeOnly: Only return non-expired announcements (default: true)
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get('severity') as 'critical' | 'warning' | 'info' | undefined;
  const activeOnly = searchParams.get('activeOnly') !== 'false'; // Default true

  try {
    // Get announcements filtered by tenant and visibility
    let announcements = dataStore.getAnnouncements({
      tenantId: user.tenantId,
      limit: 100, // Get more initially, we'll filter after
    });

    // Filter by severity if provided
    if (severity) {
      announcements = announcements.filter((ann) => ann.severity === severity);
    }

    // Filter active only
    if (activeOnly) {
      const now = new Date();
      announcements = announcements.filter((ann) => {
        if (!ann.expiresAt) return true;
        return new Date(ann.expiresAt) > now;
      });
    }

    return successResponse(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch announcements',
      500
    );
  }
}
