import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import type { AuthUser, Permission } from '@/types';
import { getUserById } from '@/lib/auth/mock-auth';

/**
 * Get the authenticated user from the request
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('demodc_auth')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'dev-secret-key-min-32-characters-long'
    );
    const { payload } = await jwtVerify(token, secret);
    
    // Load full user from store
    const user = await getUserById(payload.userId as string);
    return user;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Require authentication for an API route
 */
export function requireAuth<T extends any[]>(
  handler: (request: Request, user: AuthUser, ...args: T) => Promise<Response>
) {
  return async (request: Request, ...args: T): Promise<Response> => {
    const user = await getAuthUser();
    
    if (!user) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        },
        { status: 401 }
      );
    }
    
    return handler(request, user, ...args);
  };
}

/**
 * Require specific permission for an API route
 */
export function requirePermission<T extends any[]>(
  permission: Permission,
  handler: (request: Request, user: AuthUser, ...args: T) => Promise<Response>
) {
  return requireAuth(async (request: Request, user: AuthUser, ...args: T) => {
    if (!user.permissions.includes(permission)) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          },
        },
        { status: 403 }
      );
    }
    
    return handler(request, user, ...args);
  });
}
