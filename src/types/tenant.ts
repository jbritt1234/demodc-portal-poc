/**
 * Tenant (Customer Company) Types
 */

export type TenantStatus = 'active' | 'suspended' | 'trial';
export type TenantTier = 'basic' | 'premium' | 'enterprise';

export interface TenantAssetAssignment {
  assetId: string;
  type: 'cage' | 'rack';
  location: string;
}

export interface Tenant {
  tenantId: string;
  companyName: string;
  status: TenantStatus;
  tier: TenantTier;
  assignedLocations: string[];
  assignedAssets: TenantAssetAssignment[];
  contactEmail: string;
  billingContact: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TenantSummary {
  tenantId: string;
  companyName: string;
  status: TenantStatus;
  tier: TenantTier;
  assetCount: number;
  locationCount: number;
}
