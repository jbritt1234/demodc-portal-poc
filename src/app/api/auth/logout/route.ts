import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // Clear auth cookies
  cookieStore.delete('demodc_auth');
  cookieStore.delete('demodc_refresh');

  return Response.json({
    success: true,
    data: { message: 'Logged out successfully' },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  });
}
