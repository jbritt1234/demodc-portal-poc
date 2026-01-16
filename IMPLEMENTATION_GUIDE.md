# DemoDC Portal - Implementation Guide

This document provides context for continuing development. Phase 1 (Foundation) is complete.

## What's Been Built

### Phase 1 Complete ✅

1. **Next.js 14+ Project** with TypeScript, Tailwind CSS 4, App Router
2. **Complete Type System** in `src/types/` - all data models defined
3. **Utility Functions** in `src/lib/utils/` - cn, date formatting, Zod validation
4. **Constants** in `src/lib/constants.ts` - config, thresholds, navigation
5. **Custom Theme** in `src/app/globals.css` - professional blue/gray data center theme
6. **Folder Structure** - all directories for API routes, components, hooks created
7. **Environment Setup** - `.env.local` and `.env.example` configured

### Dependencies Installed

```json
{
  "@tanstack/react-query": "^5.x",
  "amazon-cognito-identity-js": "^6.x",
  "date-fns": "^3.x",
  "recharts": "^2.x",
  "lucide-react": "^0.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x",
  "zod": "^3.x",
  "jose": "^5.x",
  "uuid": "^9.x"
}
```

---

## Next Steps: Phase 2 - Authentication

### 2.1 Create Mock Auth Provider

Create `src/lib/auth/mock-auth.ts`:

```typescript
// Mock users for development
const MOCK_USERS = [
  {
    userId: 'user-1',
    email: 'john.doe@acme.com',
    password: 'Demo123!',
    firstName: 'John',
    lastName: 'Doe',
    tenantId: 'tenant-acme',
    role: 'admin',
    permissions: ['access_logs:read', 'access_logs:export', 'cameras:view', ...],
    assignedAssets: ['cage-5a', 'rack-101', 'rack-102'],
    mfaEnabled: true,
  },
  // Add jane.smith@acme.com (user), bob.jones@techstart.io (viewer)
];

// Functions: authenticateUser, verifyMfa, generateTokens
```

### 2.2 Create Auth Context

Create `src/lib/auth/auth-context.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ mfaRequired: boolean; sessionId?: string }>;
  verifyMfa: (sessionId: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Implement context provider that checks /api/auth/me on mount
```

### 2.3 Create Auth API Routes

**`src/app/api/auth/login/route.ts`**:
- POST handler
- Validate credentials with Zod
- Return MFA challenge or tokens

**`src/app/api/auth/mfa/verify/route.ts`**:
- POST handler
- Verify TOTP code (mock: accept "123456")
- Return tokens, set httpOnly cookies

**`src/app/api/auth/me/route.ts`**:
- GET handler
- Extract token from cookie
- Return current user or 401

**`src/app/api/auth/logout/route.ts`**:
- POST handler
- Clear cookies

### 2.4 Create Login Page

Create `src/app/(auth)/login/page.tsx`:
- Email/password form
- Call login API
- Redirect to MFA or dashboard

Create `src/app/(auth)/mfa/page.tsx`:
- 6-digit code input
- Call verify API
- Redirect to dashboard

### 2.5 Create Auth Middleware

Create `src/lib/api/middleware/auth.ts`:

```typescript
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import type { AuthUser } from '@/types';

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('radiusdc_auth')?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    // Load full user from store
    return getUserById(payload.userId as string);
  } catch {
    return null;
  }
}

export function requireAuth(handler: Function) {
  return async (req: Request) => {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Please log in' } }, { status: 401 });
    }
    return handler(req, user);
  };
}
```

---

## Phase 3 - Data Layer

### 3.1 Create In-Memory Store

Create `src/lib/data/store.ts`:

```typescript
import type { Tenant, User, DataCenterLocation, Asset, Camera, AccessLog, EnvironmentalReading, Announcement } from '@/types';

class DataStore {
  tenants: Map<string, Tenant> = new Map();
  users: Map<string, User> = new Map();
  locations: Map<string, DataCenterLocation> = new Map();
  assets: Map<string, Asset> = new Map();
  cameras: Map<string, Camera> = new Map();
  accessLogs: AccessLog[] = [];
  environmentalReadings: EnvironmentalReading[] = [];
  announcements: Map<string, Announcement> = new Map();

  // Query methods with tenant filtering
  getAccessLogs(tenantId: string, filters: AccessLogQueryParams): AccessLog[] { ... }
  getCameras(tenantId: string, assetIds: string[]): Camera[] { ... }
  // etc.
}

export const dataStore = new DataStore();
```

### 3.2 Create Seed Data

Create files in `src/lib/data/seed/`:

**tenants.ts**:
```typescript
export const seedTenants: Tenant[] = [
  {
    tenantId: 'tenant-acme',
    companyName: 'Acme Corporation',
    status: 'active',
    tier: 'enterprise',
    assignedLocations: ['dc-denver-1'],
    assignedAssets: [
      { assetId: 'cage-5a', type: 'cage', location: 'dc-denver-1' },
      { assetId: 'rack-101', type: 'rack', location: 'dc-denver-1' },
      { assetId: 'rack-102', type: 'rack', location: 'dc-denver-1' },
    ],
    contactEmail: 'it@acme.com',
    billingContact: 'billing@acme.com',
    createdAt: '2024-01-15T00:00:00Z',
  },
  // TechStart Industries, Global Financial Services
];
```

**locations.ts**:
```typescript
export const seedLocations: DataCenterLocation[] = [
  {
    locationId: 'dc-denver-1',
    type: 'datacenter',
    name: 'Denver DC - Downtown',
    shortName: 'DEN1',
    address: { street: '123 Main St', city: 'Denver', state: 'CO', zip: '80202' },
    status: 'operational',
    zones: [
      {
        zoneId: 'zone-north',
        name: 'North Wing',
        cages: ['cage-1a', 'cage-2a', 'cage-5a'],
        environmentalSensors: ['temp-north-1', 'humidity-north-1'],
      },
      {
        zoneId: 'zone-south',
        name: 'South Wing',
        cages: ['cage-3b', 'cage-4b'],
        environmentalSensors: ['temp-south-1', 'humidity-south-1'],
      },
    ],
    coordinates: { latitude: 39.7392, longitude: -104.9903 },
    weatherGridpoint: { office: 'BOU', gridX: 62, gridY: 60 },
    createdAt: '2023-01-01T00:00:00Z',
  },
];
```

### 3.3 Create Data Generators

**`src/lib/data/generators/access-logs.ts`**:

```typescript
import { v4 as uuid } from 'uuid';
import { subDays, addMinutes, setHours, setMinutes } from 'date-fns';
import type { AccessLog } from '@/types';

const FIRST_NAMES = ['James', 'Mary', 'Robert', 'Patricia', 'Michael', 'Jennifer', ...];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', ...];

export function generateAccessLogs(
  tenantId: string,
  assets: string[],
  days: number = 30,
  logsPerDay: number = 15
): AccessLog[] {
  const logs: AccessLog[] = [];

  for (let d = 0; d < days; d++) {
    const date = subDays(new Date(), d);
    const dailyCount = logsPerDay + Math.floor(Math.random() * 10) - 5;

    for (let i = 0; i < dailyCount; i++) {
      // Weight towards business hours (8 AM - 6 PM)
      const hour = weightedRandomHour();
      const minute = Math.floor(Math.random() * 60);
      const timestamp = setMinutes(setHours(date, hour), minute);

      const asset = assets[Math.floor(Math.random() * assets.length)];
      const isEntry = Math.random() > 0.5;
      const success = Math.random() > 0.05; // 95% success rate

      logs.push({
        logId: uuid(),
        timestamp: timestamp.toISOString(),
        tenantId,
        userName: `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`,
        badgeId: `BADGE-${Math.floor(Math.random() * 9000) + 1000}`,
        accessPoint: `door-${asset}-main`,
        location: 'dc-denver-1',
        zone: 'zone-north',
        asset,
        action: success ? (isEntry ? 'entry' : 'exit') : 'denied',
        method: 'badge',
        success,
        metadata: isEntry ? undefined : { duration: Math.floor(Math.random() * 14400) },
      });
    }
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function weightedRandomHour(): number {
  // 70% chance of business hours
  if (Math.random() < 0.7) {
    return Math.floor(Math.random() * 10) + 8; // 8 AM - 6 PM
  }
  return Math.floor(Math.random() * 24);
}
```

**`src/lib/data/generators/environmental.ts`**:

```typescript
export function generateEnvironmentalReadings(
  locationId: string,
  zones: string[],
  hours: number = 24
): EnvironmentalReading[] {
  const readings: EnvironmentalReading[] = [];
  const now = new Date();

  for (const zone of zones) {
    for (let h = 0; h < hours; h++) {
      const timestamp = subHours(now, h);

      // Temperature: base 68°F with sine wave variation and noise
      const tempBase = 68;
      const tempVariation = 3 * Math.sin((h / 24) * 2 * Math.PI);
      const tempNoise = (Math.random() - 0.5) * 1;
      const temperature = tempBase + tempVariation + tempNoise;

      // Humidity: base 45% with slower variation
      const humidBase = 45;
      const humidVariation = 5 * Math.sin((h / 48) * 2 * Math.PI);
      const humidNoise = (Math.random() - 0.5) * 2;
      const humidity = humidBase + humidVariation + humidNoise;

      readings.push({
        readingId: uuid(),
        timestamp: timestamp.toISOString(),
        location: locationId,
        zone,
        sensorId: `temp-${zone}-1`,
        type: 'temperature',
        value: Math.round(temperature * 10) / 10,
        unit: 'fahrenheit',
        status: getStatus(temperature, 64, 75, 60, 80),
        visibility: 'public',
      });

      readings.push({
        readingId: uuid(),
        timestamp: timestamp.toISOString(),
        location: locationId,
        zone,
        sensorId: `humidity-${zone}-1`,
        type: 'humidity',
        value: Math.round(humidity * 10) / 10,
        unit: 'percentage',
        status: getStatus(humidity, 30, 60, 20, 70),
        visibility: 'public',
      });
    }
  }

  return readings;
}

function getStatus(value: number, warnLow: number, warnHigh: number, critLow: number, critHigh: number) {
  if (value < critLow || value > critHigh) return 'critical';
  if (value < warnLow || value > warnHigh) return 'warning';
  return 'normal';
}
```

---

## Phase 4 - API Routes

### Response Helper

Create `src/lib/api/response.ts`:

```typescript
import { v4 as uuid } from 'uuid';
import type { ApiResponse } from '@/types';

export function successResponse<T>(data: T, pagination?: PaginationInfo): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    pagination,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: uuid(),
    },
  };
  return Response.json(response);
}

export function errorResponse(code: string, message: string, status: number = 400): Response {
  const response: ApiResponse<never> = {
    success: false,
    error: { code, message },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: uuid(),
    },
  };
  return Response.json(response, { status });
}
```

### Example API Route

`src/app/api/access-logs/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/api/middleware/auth';
import { dataStore } from '@/lib/data/store';
import { successResponse, errorResponse } from '@/lib/api/response';
import { accessLogQuerySchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return errorResponse('UNAUTHORIZED', 'Please log in', 401);
  }

  if (!user.permissions.includes('access_logs:read')) {
    return errorResponse('FORBIDDEN', 'Permission denied', 403);
  }

  const { searchParams } = new URL(request.url);
  const params = accessLogQuerySchema.parse(Object.fromEntries(searchParams));

  // Filter logs by tenant and assigned assets
  const logs = dataStore.getAccessLogs(user.tenantId, {
    ...params,
    assetIds: params.assetId ? [params.assetId] : user.assignedAssets,
  });

  const total = logs.length;
  const paginated = logs.slice(params.offset, params.offset + params.limit);

  return successResponse(paginated, {
    total,
    limit: params.limit,
    offset: params.offset,
    hasMore: params.offset + params.limit < total,
  });
}
```

---

## Phase 5 - Frontend Components

### UI Components Needed

Create in `src/components/ui/`:

1. **button.tsx** - Primary, secondary, danger variants
2. **card.tsx** - Card container with header/body
3. **input.tsx** - Text input with label and error
4. **table.tsx** - Data table with sorting
5. **badge.tsx** - Status badges
6. **skeleton.tsx** - Loading skeletons
7. **alert.tsx** - Info/warning/error alerts

### Layout Components

Create in `src/components/layout/`:

1. **header.tsx** - Logo, location selector, user menu
2. **sidebar.tsx** - Navigation with icons
3. **user-menu.tsx** - Dropdown with logout

### Dashboard Layout

`src/app/(dashboard)/layout.tsx`:

```typescript
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/api/middleware/auth';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Dashboard Page

`src/app/(dashboard)/page.tsx`:

```typescript
import { WeatherWidget } from '@/components/dashboard/weather-widget';
import { AnnouncementsFeed } from '@/components/dashboard/announcements-feed';
import { EnvironmentalSummary } from '@/components/dashboard/environmental-summary';
import { QuickStats } from '@/components/dashboard/quick-stats';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickStats />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EnvironmentalSummary />
        </div>
        <div className="space-y-6">
          <WeatherWidget />
          <AnnouncementsFeed />
        </div>
      </div>
    </div>
  );
}
```

---

## Weather API Integration

Create `src/lib/external/weather.ts`:

```typescript
import type { WeatherConditions } from '@/types';

const NWS_BASE = 'https://api.weather.gov';
const USER_AGENT = '(DemoDC Portal, contact@radiusdc.com)';

// Denver gridpoint: BOU office, grid 62,60
export async function getWeatherForDenver(): Promise<WeatherConditions> {
  try {
    const response = await fetch(`${NWS_BASE}/gridpoints/BOU/62,60/forecast`, {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) throw new Error('Weather API error');

    const data = await response.json();
    const current = data.properties.periods[0];

    return {
      locationId: 'dc-denver-1',
      locationName: 'Denver, CO',
      timestamp: new Date().toISOString(),
      temperature: { value: current.temperature, unit: 'fahrenheit' },
      humidity: 45, // NWS doesn't always provide this
      windSpeed: { value: parseInt(current.windSpeed), unit: 'mph' },
      windDirection: current.windDirection,
      conditions: current.shortForecast,
      icon: mapNwsIcon(current.icon),
    };
  } catch (error) {
    // Return fallback data
    return getFallbackWeather();
  }
}
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All type exports |
| `src/lib/constants.ts` | App config, thresholds |
| `src/lib/utils/cn.ts` | Tailwind class merging |
| `src/lib/utils/date.ts` | Date formatting functions |
| `src/lib/utils/validation.ts` | Zod schemas |
| `src/app/globals.css` | Theme CSS variables |
| `.env.local` | Environment config |

---

## Demo Users

| Email | Password | Role | Tenant | Assets |
|-------|----------|------|--------|--------|
| john.doe@acme.com | Demo123! | admin | Acme Corp | cage-5a, rack-101, rack-102 |
| jane.smith@acme.com | Demo123! | user | Acme Corp | cage-5a |
| bob.jones@techstart.io | Demo123! | viewer | TechStart | rack-201 |

MFA Code: `123456` (for all users in mock mode)

---

## Running the Project

```bash
cd radiusdc-portal-poc
npm run dev
```

Open http://localhost:3000

---

## Architecture Diagram

See `docs/ARCHITECTURE.md` for full diagrams including:
- System architecture
- Authentication flow
- Multi-tenancy model
- Data flow
- Component hierarchy
