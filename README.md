# PerimeterDC Portal - POC

A proof-of-concept secure client portal for a data center company. This demo showcases architectural thinking, security-first design, and modern web development practices.

## Features

- **Secure Authentication**: AWS Cognito integration with MFA support
- **Multi-Tenant Architecture**: Strict data isolation between customers
- **Access Logs**: View and filter access events for assigned cages/racks
- **Camera Feeds**: Monitor live video from assigned areas
- **Environmental Monitoring**: Temperature and humidity readings with charts
- **Weather Integration**: Real-time local weather via National Weather Service API
- **Announcements**: Facility-wide and tenant-specific notifications

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query (React Query)
- **Authentication**: AWS Cognito (with mock mode for development)
- **Validation**: Zod
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd perimeterdc-portal

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portal.

### Environment Variables

```bash
# Authentication mode (set to 'true' for mock auth)
USE_MOCK_AUTH=true

# For real Cognito (when USE_MOCK_AUTH=false)
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_CLIENT_ID=your-client-id
COGNITO_REGION=us-west-2

# JWT Secret (for mock auth)
JWT_SECRET=your-32-character-secret-key

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, MFA)
│   ├── (dashboard)/              # Protected dashboard pages
│   │   ├── access-logs/
│   │   ├── cameras/
│   │   ├── environmental/
│   │   └── settings/
│   └── api/                      # API Routes
│       ├── auth/
│       ├── access-logs/
│       ├── cameras/
│       ├── environmental/
│       └── weather/
├── components/
│   ├── ui/                       # Base UI components
│   ├── layout/                   # Header, sidebar, navigation
│   ├── auth/                     # Login, MFA forms
│   ├── dashboard/                # Dashboard widgets
│   ├── access-logs/              # Log table, filters
│   ├── cameras/                  # Camera grid, video player
│   └── environmental/            # Charts, sensor cards
├── lib/
│   ├── auth/                     # Auth providers, middleware
│   ├── api/                      # API client, response helpers
│   ├── data/                     # Data generators, seed data
│   ├── external/                 # External API clients (NWS)
│   └── utils/                    # Utilities (cn, date, validation)
├── hooks/                        # Custom React hooks
└── types/                        # TypeScript type definitions
```

## Architecture

### Authentication Flow

```
User → Login Form → API → Cognito/Mock Auth → MFA (if enabled) → JWT Tokens → Dashboard
```

### Multi-Tenancy Model

1. **Tenant Isolation**: All data queries include tenant ID filtering
2. **Asset-Level Access**: Users only see their assigned cages/racks
3. **Role-Based Permissions**: admin, user, viewer roles with granular permissions

### Data Flow

- **Server State**: Managed by TanStack Query with caching and background refresh
- **Client State**: React Context for auth, local state for UI
- **API Layer**: Next.js API routes with middleware chain (auth → tenant → permissions)

## Demo Accounts (Mock Auth Mode)

| Email | Password | Role | Company |
|-------|----------|------|---------|
| john.doe@acme.com | Demo123! | Admin | Acme Corporation |
| jane.smith@acme.com | Demo123! | User | Acme Corporation |
| bob.jones@techstart.io | Demo123! | Viewer | TechStart Industries |

MFA Code (for all users): `123456`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Initiate login
- `POST /api/auth/mfa/verify` - Verify MFA code
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard` - Dashboard summary data
- `GET /api/weather/:locationId` - Weather for location
- `GET /api/announcements` - Announcements feed

### Access Logs
- `GET /api/access-logs` - Paginated logs with filters
- `GET /api/access-logs/summary` - Statistics

### Cameras
- `GET /api/cameras` - Available cameras
- `GET /api/cameras/:id` - Camera details

### Environmental
- `GET /api/environmental/current` - Current readings
- `GET /api/environmental/history` - Historical data

## Implementation Phases

### Phase 1: Foundation ✅
- [x] Project initialization
- [x] TypeScript configuration
- [x] Tailwind CSS setup
- [x] Type definitions
- [x] Utility functions

### Phase 2: Authentication
- [ ] Mock auth provider
- [ ] Cognito integration
- [ ] Login page
- [ ] MFA verification
- [ ] Auth middleware

### Phase 3: Data Layer
- [ ] In-memory data store
- [ ] Seed data (tenants, users, assets)
- [ ] Access log generator
- [ ] Environmental data generator

### Phase 4: API Routes
- [ ] Auth endpoints
- [ ] Dashboard endpoint
- [ ] Access logs endpoints
- [ ] Camera endpoints
- [ ] Environmental endpoints
- [ ] Weather integration

### Phase 5: Frontend
- [ ] UI components
- [ ] Layout (header, sidebar)
- [ ] Dashboard page
- [ ] Access logs page
- [ ] Cameras page
- [ ] Environmental page

### Phase 6: Polish
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] Performance optimization

## Security Considerations

- **Token Storage**: httpOnly cookies for tokens
- **CSRF Protection**: Built into Next.js
- **Input Validation**: Zod schemas on all endpoints
- **Data Isolation**: Tenant ID checks on every query
- **Permission Checks**: Middleware validates permissions before handlers

## Deployment

### AWS Amplify (Recommended)
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize and deploy
amplify init
amplify add hosting
amplify publish
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## License

This is a proof-of-concept project for demonstration purposes.

---

Built with ❤️ for PerimeterDC
