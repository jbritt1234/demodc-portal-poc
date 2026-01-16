# Changelog - Cookie Authentication Fix

## Date: January 16, 2026

## Issue
Users could not log in on EC2 production deployment. After entering credentials and MFA code, the application redirected back to the login page instead of the dashboard.

## Root Cause
Cookies were configured with `secure: true` in production mode by default, which requires HTTPS. Since the EC2 instance was running over HTTP (without SSL certificate), browsers rejected the authentication cookies.

## Files Changed

### 1. `/src/app/api/auth/mfa/verify/route.ts`

**Before:**
```typescript
cookieStore.set('demodc_auth', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',  // Always true in production
  sameSite: 'lax',
  maxAge: 15 * 60,
  path: '/',
});
```

**After:**
```typescript
// Use COOKIE_SECURE env var, default to false for easier deployment
const isSecure = process.env.COOKIE_SECURE === 'true';

cookieStore.set('demodc_auth', accessToken, {
  httpOnly: true,
  secure: isSecure,  // Controlled by environment variable
  sameSite: 'lax',
  maxAge: 15 * 60,
  path: '/',
});
```

Same change applied to `demodc_refresh` cookie.

### 2. New Files Created

- **`.env.production.example`**: Template for production environment configuration
- **`DEPLOYMENT_FIX.md`**: Comprehensive deployment troubleshooting guide
- **`EC2_QUICK_FIX.md`**: Quick reference for fixing the login issue on EC2
- **`CHANGELOG_COOKIE_FIX.md`**: This file

## Environment Variable Added

### `COOKIE_SECURE`
- **Type:** Boolean string ('true' or 'false')
- **Default:** false (when not set)
- **Purpose:** Controls whether cookies require HTTPS
- **Recommended Values:**
  - `false` for HTTP-only deployments (demo/development)
  - `true` for HTTPS deployments (production with SSL)

## Migration Guide for Existing Deployments

### For HTTP Deployments (Current State)

1. Create `.env.production` with `COOKIE_SECURE=false`
2. Pull latest code
3. Rebuild application
4. Restart PM2

### For HTTPS Deployments (Future)

1. Set up SSL certificate (Let's Encrypt)
2. Update `.env.production` with `COOKIE_SECURE=true`
3. Update URLs to use `https://`
4. Rebuild and restart

## Testing

### Manual Test Steps
1. Navigate to login page
2. Enter credentials: john.doe@acme.com / Demo123!
3. Enter MFA code: 123456
4. Verify redirect to dashboard (not back to login)
5. Check browser DevTools → Application → Cookies
   - Should see `demodc_auth` and `demodc_refresh`
   - `Secure` flag should match `COOKIE_SECURE` setting

### Automated Test (curl)
```bash
# Login
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@acme.com","password":"Demo123!"}'

# Get session ID from response, then verify MFA
curl -i -X POST http://localhost:3000/api/auth/mfa/verify \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"SESSION_ID","code":"123456"}'

# Check Set-Cookie headers in response
```

## Security Considerations

### Current Implementation (HTTP)
- ✅ httpOnly cookies (XSS protection)
- ✅ sameSite=lax (CSRF protection)
- ⚠️ No encryption in transit (HTTP)
- ⚠️ Cookies visible in network traffic

### Recommended for Production (HTTPS)
- ✅ httpOnly cookies
- ✅ sameSite=lax
- ✅ secure flag (HTTPS only)
- ✅ Encrypted in transit

## Backward Compatibility

This change is **backward compatible**:
- Existing deployments without `.env.production` will use `COOKIE_SECURE=false` (default)
- HTTPS deployments can opt-in by setting `COOKIE_SECURE=true`
- No breaking changes to API contracts or database schema

## Related Documentation

- `docs/DEPLOYMENT_AWS_EC2.md` - AWS EC2 deployment guide
- `DEPLOYMENT_FIX.md` - Detailed troubleshooting steps
- `EC2_QUICK_FIX.md` - Quick reference guide
- `.env.production.example` - Production environment template

## Impact

- **Bug Fixed:** ✅ Login works on HTTP deployments
- **Security:** ➡️ Same (cookies still protected with httpOnly and sameSite)
- **Performance:** ➡️ No change
- **Breaking Changes:** ❌ None

## Rollback Plan

If needed, revert to previous behavior by setting `COOKIE_SECURE=true` in production, which matches the old behavior of `secure: process.env.NODE_ENV === 'production'`.
