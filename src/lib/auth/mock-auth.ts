import { SignJWT } from 'jose';
import type { AuthUser, Permission, UserRole } from '@/types';

// Mock users for development
const MOCK_USERS = [
  {
    userId: 'user-1',
    email: 'john.doe@acme.com',
    password: 'Demo123!',
    firstName: 'John',
    lastName: 'Doe',
    tenantId: 'tenant-acme',
    role: 'admin' as UserRole,
    permissions: [
      'access_logs:read',
      'access_logs:export',
      'cameras:view',
      'cameras:ptz_control',
      'environmental:read',
      'environmental:alerts',
      'announcements:read',
      'announcements:create',
      'users:manage',
    ] as Permission[],
    assignedAssets: ['cage-5a', 'rack-101', 'rack-102'],
    mfaEnabled: true,
  },
  {
    userId: 'user-2',
    email: 'jane.smith@acme.com',
    password: 'Demo123!',
    firstName: 'Jane',
    lastName: 'Smith',
    tenantId: 'tenant-acme',
    role: 'user' as UserRole,
    permissions: [
      'access_logs:read',
      'cameras:view',
      'environmental:read',
      'announcements:read',
    ] as Permission[],
    assignedAssets: ['cage-5a'],
    mfaEnabled: true,
  },
  {
    userId: 'user-3',
    email: 'bob.jones@techstart.io',
    password: 'Demo123!',
    firstName: 'Bob',
    lastName: 'Jones',
    tenantId: 'tenant-techstart',
    role: 'viewer' as UserRole,
    permissions: [
      'access_logs:read',
      'cameras:view',
      'environmental:read',
      'announcements:read',
    ] as Permission[],
    assignedAssets: ['rack-201'],
    mfaEnabled: true,
  },
];

// Temporary session storage for MFA challenges
const mfaSessions = new Map<string, { userId: string; expiresAt: number }>();

export interface AuthenticateResult {
  mfaRequired: boolean;
  sessionId?: string;
  user?: AuthUser;
}

/**
 * Authenticate a user with email and password
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthenticateResult> {
  const user = MOCK_USERS.find((u) => u.email === email);

  if (!user || user.password !== password) {
    throw new Error('Invalid credentials');
  }

  if (user.mfaEnabled) {
    // Generate a session ID for MFA
    const sessionId = `mfa-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    mfaSessions.set(sessionId, { userId: user.userId, expiresAt });

    return {
      mfaRequired: true,
      sessionId,
    };
  }

  // If no MFA, return user
  const authUser = convertToAuthUser(user);
  return {
    mfaRequired: false,
    user: authUser,
  };
}

/**
 * Verify MFA code (accepts "123456" in mock mode)
 */
export async function verifyMfa(
  sessionId: string,
  code: string
): Promise<AuthUser> {
  const session = mfaSessions.get(sessionId);

  if (!session) {
    throw new Error('Invalid or expired MFA session');
  }

  if (Date.now() > session.expiresAt) {
    mfaSessions.delete(sessionId);
    throw new Error('MFA session expired');
  }

  // In mock mode, accept "123456"
  if (code !== '123456') {
    throw new Error('Invalid MFA code');
  }

  // Find the user
  const user = MOCK_USERS.find((u) => u.userId === session.userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Clean up session
  mfaSessions.delete(sessionId);

  return convertToAuthUser(user);
}

/**
 * Generate JWT tokens for a user
 */
export async function generateTokens(user: AuthUser): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'dev-secret-key-min-32-characters-long'
  );

  const accessToken = await new SignJWT({
    userId: user.userId,
    email: user.email,
    tenantId: user.tenantId,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);

  const refreshToken = await new SignJWT({
    userId: user.userId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);

  return { accessToken, refreshToken };
}

/**
 * Get user by ID (for token verification)
 */
export async function getUserById(userId: string): Promise<AuthUser | null> {
  const user = MOCK_USERS.find((u) => u.userId === userId);
  return user ? convertToAuthUser(user) : null;
}

/**
 * Convert mock user to AuthUser type
 */
function convertToAuthUser(user: typeof MOCK_USERS[0]): AuthUser {
  return {
    userId: user.userId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    tenantId: user.tenantId,
    role: user.role,
    permissions: user.permissions,
    assignedAssets: user.assignedAssets,
    mfaEnabled: user.mfaEnabled,
  };
}

// Cleanup expired MFA sessions every minute
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of mfaSessions.entries()) {
    if (now > session.expiresAt) {
      mfaSessions.delete(sessionId);
    }
  }
}, 60000);
