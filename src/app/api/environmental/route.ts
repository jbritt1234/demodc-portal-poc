import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/api/middleware/auth';
import { dataStore } from '@/lib/data/store';
import { successResponse, errorResponse } from '@/lib/api/response';

/**
 * GET /api/environmental
 *
 * Retrieve environmental readings for the authenticated user's location
 *
 * Query Parameters:
 * - location: Location ID (required)
 * - zone: Filter by specific zone (optional)
 * - type: Filter by type: temperature, humidity (optional)
 * - hours: Number of hours of data to retrieve (default: 24, max: 168)
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser();

  if (!user) {
    return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
  }

  // Check permission
  if (!user.permissions.includes('environmental:read')) {
    return errorResponse('FORBIDDEN', 'You do not have permission to view environmental data', 403);
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const zone = searchParams.get('zone') || undefined;
  const type = searchParams.get('type') as 'temperature' | 'humidity' | undefined;
  const hours = Math.min(
    parseInt(searchParams.get('hours') || '24', 10),
    168 // Max 7 days
  );

  if (!location) {
    return errorResponse('BAD_REQUEST', 'Location parameter is required', 400);
  }

  try {
    // Get environmental readings
    const readings = dataStore.getEnvironmentalReadings({
      location,
      zone,
      type,
      hours,
    });

    return successResponse(readings);
  } catch (error) {
    console.error('Error fetching environmental readings:', error);
    return errorResponse(
      'INTERNAL_ERROR',
      'Failed to fetch environmental readings',
      500
    );
  }
}
