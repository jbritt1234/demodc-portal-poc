import { NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyMfa, generateTokens } from '@/lib/auth/mock-auth';
import { cookies } from 'next/headers';

const mfaSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  code: z.string().length(6, 'MFA code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = mfaSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: validation.error.flatten().fieldErrors,
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        },
        { status: 400 }
      );
    }

    const { sessionId, code } = validation.data;

    // Verify MFA
    const user = await verifyMfa(sessionId, code);

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    // Set httpOnly cookies
    const cookieStore = await cookies();
    
    // Use COOKIE_SECURE env var, default to false for easier deployment
    // Set to 'true' when you have HTTPS configured
    const isSecure = process.env.COOKIE_SECURE === 'true';
    
    cookieStore.set('demodc_auth', accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    cookieStore.set('demodc_refresh', refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return Response.json({
      success: true,
      data: { user },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'MFA verification failed';
    
    return Response.json(
      {
        success: false,
        error: {
          code: 'MFA_VERIFICATION_FAILED',
          message,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
      },
      { status: 401 }
    );
  }
}
