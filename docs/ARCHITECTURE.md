# DemoDC Client Portal - Architecture Document

## Overview

This document outlines the architecture for a proof-of-concept secure client portal for a data center company. The portal allows clients to view access logs, monitor video feeds, check environmental conditions, receive announcements, and view local weather.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Authentication & Security](#authentication--security)
3. [Multi-Tenancy Model](#multi-tenancy-model)
4. [Data Layer](#data-layer)
5. [API Design](#api-design)
6. [Frontend Architecture](#frontend-architecture)
7. [Implementation Phases](#implementation-phases)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────────────┐
                        │    External Services     │
                        │  ┌────────────────────┐  │
                        │  │  NWS Weather API   │  │
                        │  └────────────────────┘  │
                        │  ┌────────────────────┐  │
                        │  │  AWS Cognito       │  │
                        │  └────────────────────┘  │
                        └───────────┬──────────────┘
                                    │
┌───────────────────────────────────┼───────────────────────────────────────┐
│                                   │              NEXT.JS APPLICATION      │
│  ┌────────────────────────────────┼────────────────────────────────────┐  │
│  │                                ▼                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │                     API LAYER                                │   │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │  │
│  │  │  │    Auth      │  │   Dashboard  │  │  Access Logs │      │   │  │
│  │  │  │   Routes     │  │    Routes    │  │    Routes    │      │   │  │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │  │
│  │  │  │   Cameras    │  │ Environmental│  │   Assets/    │      │   │  │
│  │  │  │    Routes    │  │    Routes    │  │  Locations   │      │   │  │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  │                                │                                    │  │
│  │  ┌─────────────────────────────▼─────────────────────────────────┐ │  │
│  │  │                    MIDDLEWARE CHAIN                           │ │  │
│  │  │  ┌────────┐  ┌────────┐  ┌──────────┐  ┌────────────────┐   │ │  │
│  │  │  │  Auth  │─▶│ Tenant │─▶│Permission│─▶│ Request Handler│   │ │  │
│  │  │  └────────┘  └────────┘  └──────────┘  └────────────────┘   │ │  │
│  │  └───────────────────────────────────────────────────────────────┘ │  │
│  │                                │                                    │  │
│  │  ┌─────────────────────────────▼─────────────────────────────────┐ │  │
│  │  │                      DATA LAYER                               │ │  │
│  │  │  ┌──────────────────────────────────────────────────────┐    │ │  │
│  │  │  │              In-Memory Data Store                     │    │ │  │
│  │  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │    │ │  │
│  │  │  │  │ Tenants │ │  Users  │ │ Assets  │ │ Cameras │    │    │ │  │
│  │  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │    │ │  │
│  │  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │    │ │  │
│  │  │  │  │ Logs    │ │ Environ │ │Announce │ │Locations│    │    │ │  │
│  │  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │    │ │  │
│  │  │  └──────────────────────────────────────────────────────┘    │ │  │
│  │  │  ┌──────────────────────────────────────────────────────┐    │ │  │
│  │  │  │              Data Generators                          │    │ │  │
│  │  │  │  • Access Log Generator (realistic patterns)          │    │ │  │
│  │  │  │  • Environmental Reading Generator (fluctuating)      │    │ │  │
│  │  │  │  • Name/Badge Generator                               │    │ │  │
│  │  │  └──────────────────────────────────────────────────────┘    │ │  │
│  │  └───────────────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                        FRONTEND LAYER                               │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │  React Query Provider │ Auth Context │ Theme Provider       │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │                       PAGES                                  │   │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐ │   │  │
│  │  │  │  Login  │ │Dashboard│ │  Logs   │ │ Cameras │ │ Envir │ │   │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────┘ │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │                     COMPONENTS                               │   │  │
│  │  │  UI │ Layout │ Auth │ Dashboard │ Logs │ Cameras │ Environ  │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication & Security

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

    User                    Frontend                 API                 Cognito
     │                         │                      │                     │
     │  1. Enter credentials   │                      │                     │
     │─────────────────────────▶                      │                     │
     │                         │  2. POST /auth/login │                     │
     │                         │──────────────────────▶                     │
     │                         │                      │  3. InitiateAuth    │
     │                         │                      │─────────────────────▶
     │                         │                      │                     │
     │                         │                      │  4. MFA Challenge   │
     │                         │                      │◀─────────────────────
     │                         │  5. Return challenge │                     │
     │                         │◀──────────────────────                     │
     │  6. Show MFA screen     │                      │                     │
     │◀─────────────────────────                      │                     │
     │                         │                      │                     │
     │  7. Enter TOTP code     │                      │                     │
     │─────────────────────────▶                      │                     │
     │                         │  8. POST /auth/mfa   │                     │
     │                         │──────────────────────▶                     │
     │                         │                      │  9. Verify MFA      │
     │                         │                      │─────────────────────▶
     │                         │                      │                     │
     │                         │                      │  10. Tokens         │
     │                         │                      │◀─────────────────────
     │                         │  11. Set cookies     │                     │
     │                         │◀──────────────────────                     │
     │  12. Redirect dashboard │                      │                     │
     │◀─────────────────────────                      │                     │
```

### Token Strategy

| Token Type     | Storage          | Expiry   | Purpose                    |
|----------------|------------------|----------|----------------------------|
| Access Token   | httpOnly cookie  | 15 min   | API authorization          |
| Refresh Token  | httpOnly cookie  | 30 days  | Token refresh              |
| ID Token       | JS accessible    | 1 hour   | User display info          |

### Security Headers

```typescript
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; ...",
};
```

---

## Multi-Tenancy Model

### Data Isolation Levels

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MULTI-TENANCY MODEL                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Level 1: TENANT ISOLATION
┌─────────────────────────────────────────────────────────────────────────────┐
│  Every database query includes: WHERE tenantId = user.tenantId              │
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │  Acme Corp  │    │  TechStart  │    │ Global Fin  │                     │
│  │  tenantId:1 │    │  tenantId:2 │    │  tenantId:3 │                     │
│  └─────────────┘    └─────────────┘    └─────────────┘                     │
│         │                 │                   │                             │
│         │   ISOLATED      │     ISOLATED      │                             │
│         ▼                 ▼                   ▼                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │  Acme Data  │    │TechStart    │    │ GFS Data    │                     │
│  │  Only       │    │  Data Only  │    │   Only      │                     │
│  └─────────────┘    └─────────────┘    └─────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────┘

Level 2: ASSET-LEVEL ACCESS
┌─────────────────────────────────────────────────────────────────────────────┐
│  Users see only their assigned assets within their tenant                   │
│                                                                              │
│  User: john.doe@acme.com                                                    │
│  assignedAssets: ["cage-5a", "rack-101"]                                   │
│                                                                              │
│  ✓ Can see: cage-5a access logs, cameras, environmental data               │
│  ✓ Can see: rack-101 access logs, cameras, environmental data              │
│  ✗ Cannot see: cage-3b (different tenant's asset)                          │
│  ✗ Cannot see: rack-102 (same tenant, not assigned)                        │
└─────────────────────────────────────────────────────────────────────────────┘

Level 3: ROLE-BASED PERMISSIONS
┌─────────────────────────────────────────────────────────────────────────────┐
│  Role      │ Permissions                                                    │
│  ──────────┼───────────────────────────────────────────────────────────────│
│  admin     │ All permissions + user management                             │
│  user      │ Read/write on assigned assets                                 │
│  viewer    │ Read-only on assigned assets                                  │
│                                                                              │
│  Granular Permissions:                                                      │
│  • access_logs:read     • cameras:view          • environmental:read       │
│  • access_logs:export   • cameras:ptz_control   • environmental:alerts     │
│  • announcements:read   • announcements:create  • users:manage (admin)     │
└─────────────────────────────────────────────────────────────────────────────┘

Level 4: VISIBILITY FLAGS
┌─────────────────────────────────────────────────────────────────────────────┐
│  Data can have visibility levels:                                           │
│                                                                              │
│  • public: All authenticated users (weather, public announcements)          │
│  • tenant-specific: Only users of specific tenant                          │
│  • restricted: Only users with specific asset assignments                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Authorization Middleware

```typescript
// Middleware chain for protected API routes
async function withAuth(handler: Handler) {
  return async (req: Request) => {
    // 1. Extract and validate JWT
    const token = extractToken(req);
    const payload = await validateToken(token);

    // 2. Load user with permissions
    const user = await loadUser(payload.userId);

    // 3. Attach to request context
    req.user = user;
    req.tenantId = user.tenantId;

    // 4. Check route-specific permissions
    if (!hasPermission(user, req.requiredPermission)) {
      return new Response('Forbidden', { status: 403 });
    }

    // 5. For asset routes, verify asset access
    if (req.assetId && !user.assignedAssets.includes(req.assetId)) {
      return new Response('Forbidden', { status: 403 });
    }

    return handler(req);
  };
}
```

---

## Data Layer

### In-Memory Store Structure

```typescript
interface DataStore {
  tenants: Map<string, Tenant>;
  users: Map<string, User>;
  locations: Map<string, DataCenter>;
  assets: Map<string, Asset>;
  cameras: Map<string, Camera>;
  accessLogs: AccessLog[];  // Array for time-series queries
  environmentalReadings: EnvironmentalReading[];
  announcements: Map<string, Announcement>;
}
```

### Data Generation Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA GENERATION PATTERNS                              │
└─────────────────────────────────────────────────────────────────────────────┘

ACCESS LOGS:
┌─────────────────────────────────────────────────────────────────────────────┐
│  • Higher frequency during business hours (8 AM - 6 PM)                     │
│  • Occasional night/weekend access (realistic for data centers)            │
│  • 95% successful entries, 5% denied (wrong badge, expired, etc.)          │
│  • Entry/exit pairs with realistic durations (15 min - 4 hours)            │
│  • Realistic names using name generator                                     │
│  • Generate 30 days of historical data                                      │
└─────────────────────────────────────────────────────────────────────────────┘

ENVIRONMENTAL DATA:
┌─────────────────────────────────────────────────────────────────────────────┐
│  Temperature:                                                               │
│  • Base: 68°F (optimal server room temp)                                   │
│  • Variation: ±3°F with sine wave pattern (daily cycle)                    │
│  • Occasional spikes to simulate cooling events                            │
│  • Random noise: ±0.5°F                                                    │
│                                                                              │
│  Humidity:                                                                  │
│  • Base: 45% (optimal range)                                               │
│  • Variation: ±5% with slower cycle                                        │
│  • Random noise: ±1%                                                       │
└─────────────────────────────────────────────────────────────────────────────┘

ANNOUNCEMENTS:
┌─────────────────────────────────────────────────────────────────────────────┐
│  • Scheduled maintenance windows                                            │
│  • Network upgrade notifications                                            │
│  • Security reminders                                                       │
│  • Holiday hours                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## API Design

### Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  metadata: {
    timestamp: string;
    requestId: string;
  };
}
```

### API Endpoints Summary

| Method | Endpoint                          | Auth | Description                    |
|--------|-----------------------------------|------|--------------------------------|
| POST   | /api/auth/login                   | No   | Initiate login                 |
| POST   | /api/auth/mfa/verify              | No   | Verify MFA code                |
| POST   | /api/auth/logout                  | Yes  | Logout user                    |
| POST   | /api/auth/refresh                 | No   | Refresh tokens                 |
| GET    | /api/auth/me                      | Yes  | Get current user               |
| GET    | /api/dashboard                    | Yes  | Dashboard summary              |
| GET    | /api/announcements                | Yes  | Get announcements              |
| GET    | /api/weather/:locationId          | Yes  | Weather for location           |
| GET    | /api/access-logs                  | Yes  | Paginated access logs          |
| GET    | /api/access-logs/:logId           | Yes  | Single log detail              |
| GET    | /api/access-logs/summary          | Yes  | Log statistics                 |
| GET    | /api/environmental/current        | Yes  | Current readings               |
| GET    | /api/environmental/history        | Yes  | Historical readings            |
| GET    | /api/environmental/alerts         | Yes  | Active alerts                  |
| GET    | /api/cameras                      | Yes  | Cameras user can access        |
| GET    | /api/cameras/:cameraId            | Yes  | Camera details + stream        |
| GET    | /api/locations                    | Yes  | User's locations               |
| GET    | /api/assets                       | Yes  | User's assets                  |

---

## Frontend Architecture

### Component Hierarchy

```
App
├── Providers
│   ├── QueryClientProvider (React Query)
│   ├── AuthProvider (Context)
│   └── ThemeProvider
│
├── [Auth Routes] - /login, /mfa
│   ├── LoginPage
│   │   └── LoginForm
│   └── MFAPage
│       └── MFAForm
│
└── [Protected Routes] - /dashboard, /access-logs, etc.
    └── DashboardLayout
        ├── Header
        │   ├── Logo
        │   ├── LocationSelector
        │   └── UserMenu
        ├── Sidebar
        │   └── NavItem[]
        └── [Content Area]
            ├── DashboardPage
            │   ├── WeatherWidget
            │   ├── AnnouncementsFeed
            │   ├── EnvironmentalSummary
            │   └── QuickStats
            ├── AccessLogsPage
            │   ├── LogsFilters
            │   ├── LogsTable
            │   └── Pagination
            ├── CamerasPage
            │   ├── CameraFilters
            │   └── CameraGrid
            │       └── CameraCard
            │           └── VideoPlayer
            └── EnvironmentalPage
                ├── AlertBanner
                ├── CurrentReadings
                └── HistoricalCharts
```

### State Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STATE MANAGEMENT                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Server State (React Query):
┌─────────────────────────────────────────────────────────────────────────────┐
│  • Access logs with caching                                                 │
│  • Environmental readings with polling (every 30s)                         │
│  • Camera list with status updates                                         │
│  • Weather data with 5-minute cache                                        │
│  • Announcements with background refresh                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Client State (Context/Local):
┌─────────────────────────────────────────────────────────────────────────────┐
│  • Auth state (user, isAuthenticated)                                      │
│  • Selected location filter                                                │
│  • UI preferences (sidebar collapsed, theme)                               │
│  • Form states (filters, date ranges)                                      │
└─────────────────────────────────────────────────────────────────────────────┘

No Redux - keeping it simple with React Query + Context
```

### Design System

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DESIGN TOKENS                                      │
└─────────────────────────────────────────────────────────────────────────────┘

Colors (Data Center Theme):
┌─────────────────────────────────────────────────────────────────────────────┐
│  Primary:     #0066CC (Professional blue)                                  │
│  Secondary:   #64748B (Slate gray)                                         │
│  Success:     #10B981 (Green - online/normal)                              │
│  Warning:     #F59E0B (Amber - attention)                                  │
│  Danger:      #EF4444 (Red - critical/denied)                              │
│  Background:  #F8FAFC (Light) / #0F172A (Dark)                            │
│  Surface:     #FFFFFF (Light) / #1E293B (Dark)                            │
└─────────────────────────────────────────────────────────────────────────────┘

Typography:
┌─────────────────────────────────────────────────────────────────────────────┐
│  Font Family: Inter (system fallback)                                      │
│  Headings: 600-700 weight                                                  │
│  Body: 400 weight                                                          │
│  Monospace: JetBrains Mono (for logs, IDs)                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Project Foundation (Est: 2-3 hours)

- [x] Architecture planning
- [ ] Initialize Next.js 14 with TypeScript
- [ ] Configure Tailwind CSS with custom theme
- [ ] Install all dependencies
- [ ] Create folder structure
- [ ] Define all TypeScript types
- [ ] Set up environment variables

### Phase 2: Authentication (Est: 3-4 hours)

- [ ] Auth types and interfaces
- [ ] Mock auth provider for development
- [ ] Cognito client (can be stubbed)
- [ ] Login page and form
- [ ] MFA verification page
- [ ] Auth middleware
- [ ] Protected route wrapper
- [ ] Auth context and useAuth hook

### Phase 3: Data Layer (Est: 2-3 hours)

- [ ] In-memory data store
- [ ] Seed data (tenants, users, locations, assets, cameras)
- [ ] Access log generator
- [ ] Environmental data generator
- [ ] Announcement seed data
- [ ] Data isolation logic

### Phase 4: API Routes (Est: 3-4 hours)

- [ ] Response helpers and error handling
- [ ] Auth endpoints
- [ ] Dashboard endpoint
- [ ] Access logs endpoints
- [ ] Cameras endpoints
- [ ] Environmental endpoints
- [ ] Weather integration (NWS API)
- [ ] Announcements endpoint

### Phase 5: Frontend (Est: 4-5 hours)

- [ ] Base UI components
- [ ] Layout (header, sidebar)
- [ ] Dashboard page + widgets
- [ ] Access logs page
- [ ] Cameras page
- [ ] Environmental page
- [ ] Loading states
- [ ] Error handling

### Phase 6: Polish (Est: 2-3 hours)

- [ ] Responsive design
- [ ] Animations/transitions
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Final testing

### Phase 7: Documentation (Est: 1-2 hours)

- [ ] README with setup instructions
- [ ] API documentation
- [ ] Deployment guide
- [ ] Environment variables documentation

---

## Deployment Considerations

### AWS Architecture (Production)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AWS DEPLOYMENT ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  CloudFront  │────▶│  S3 Bucket   │     │   Cognito    │
│    (CDN)     │     │   (Static)   │     │  User Pool   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                                         │
       │                                         │
       ▼                                         │
┌──────────────┐                                 │
│   Amplify    │◀────────────────────────────────┘
│   or Vercel  │
│  (Next.js)   │
└──────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│   DynamoDB   │     │ External APIs│
│  (Data)      │     │ (NWS, etc.)  │
└──────────────┘     └──────────────┘
```

### Environment Variables

```bash
# Authentication
COGNITO_USER_POOL_ID=us-west-2_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_REGION=us-west-2

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NWS_API_BASE_URL=https://api.weather.gov

# Feature Flags
USE_MOCK_AUTH=true  # Set to false for real Cognito
ENABLE_DEBUG_LOGS=false

# Session
SESSION_SECRET=your-secret-key-min-32-chars
```

---

## Security Checklist

- [ ] HTTPS only (enforced in production)
- [ ] httpOnly cookies for tokens
- [ ] CSRF protection
- [ ] Rate limiting on auth endpoints
- [ ] Input validation with Zod
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (React's default escaping)
- [ ] Secure headers configured
- [ ] No secrets in client code
- [ ] Audit logging for sensitive operations

---

*Document Version: 1.0*
*Last Updated: January 2026*
