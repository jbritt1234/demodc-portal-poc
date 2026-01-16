/**
 * Authentication Types
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface MfaVerifyRequest {
  sessionId: string;
  code: string;
}

export interface MfaSetupRequest {
  userId: string;
}

export interface MfaSetupResponse {
  secretKey: string;
  qrCodeUrl: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  tokens?: AuthTokens;
  user?: AuthUser;
  mfaRequired?: boolean;
  sessionId?: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  role: UserRole;
  permissions: Permission[];
  assignedAssets: string[];
  mfaEnabled: boolean;
}

export type UserRole = 'admin' | 'user' | 'viewer';

export type Permission =
  | 'access_logs:read'
  | 'access_logs:export'
  | 'cameras:view'
  | 'cameras:ptz_control'
  | 'environmental:read'
  | 'environmental:alerts'
  | 'announcements:read'
  | 'announcements:create'
  | 'users:read'
  | 'users:manage';

// Permission sets by role
export const RolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'access_logs:read',
    'access_logs:export',
    'cameras:view',
    'cameras:ptz_control',
    'environmental:read',
    'environmental:alerts',
    'announcements:read',
    'announcements:create',
    'users:read',
    'users:manage',
  ],
  user: [
    'access_logs:read',
    'access_logs:export',
    'cameras:view',
    'environmental:read',
    'environmental:alerts',
    'announcements:read',
  ],
  viewer: [
    'access_logs:read',
    'cameras:view',
    'environmental:read',
    'announcements:read',
  ],
};

export interface JwtPayload {
  userId: string;
  email: string;
  tenantId: string;
  role: UserRole;
  iat: number;
  exp: number;
}
