import { getAuthUser } from '@/lib/api/middleware/auth';

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
      },
      { status: 401 }
    );
  }

  return Response.json({
    success: true,
    data: user,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  });
}
