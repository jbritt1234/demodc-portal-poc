/**
 * User Types
 */

import { Permission, UserRole } from './auth';

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  role: UserRole;
  permissions: Permission[];
  assignedAssets: string[];
  mfaEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
  passwordHash?: string; // Only used server-side
}

export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  mfaEnabled: boolean;
  lastLogin?: string;
}

export interface UserWithTenant extends User {
  tenantName: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  assignedAssets: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  assignedAssets?: string[];
  mfaEnabled?: boolean;
}
