# Cookie Authentication Fix for EC2 Deployment

## Problem
After MFA verification, the application redirects back to the login page because cookies are not being set properly in production.

## Root Cause
The application was setting `secure: true` on cookies in production mode, which requires HTTPS. When accessing via HTTP (without SSL), browsers reject these cookies.

## Solution Applied
Updated the cookie settings to use an environment variable `COOKIE_SECURE` instead of automatically using `secure: true` in production.

## Steps to Fix on Your EC2 Instance

### 1. Create Production Environment File

SSH into your EC2 instance and navigate to your application directory:

```bash
cd /path/to/radiusdc-portal-poc
```

Create a `.env.production` file:

```bash
cat > .env.production << 'ENVEOF'
# DemoDC Portal - Production Environment

# Application URLs (update with your EC2 public IP or domain)
NEXT_PUBLIC_APP_URL=http://your-ec2-ip:3000
NEXT_PUBLIC_API_URL=http://your-ec2-ip:3000/api

# Authentication
USE_MOCK_AUTH=true

# JWT Secret - CHANGE THIS!
JWT_SECRET=your-secure-random-jwt-secret-at-least-32-characters

# Session Secret - CHANGE THIS!
SESSION_SECRET=your-secure-random-session-secret

# Cookie Security - Set to false for HTTP, true for HTTPS
COOKIE_SECURE=false

# External APIs
NWS_API_BASE_URL=https://api.weather.gov

# Feature Flags
ENABLE_DEBUG_LOGS=false
ENABLE_MOCK_DATA=true

# Environment
NODE_ENV=production
ENVEOF
```

**Important:** Replace `your-ec2-ip` with your actual EC2 public IP address or domain name.

### 2. Update the Source Code

Pull the latest changes that include the cookie fix:

```bash
git pull origin main
```

Or manually update `src/app/api/auth/mfa/verify/route.ts` to use:

```typescript
const isSecure = process.env.COOKIE_SECURE === 'true';
```

instead of:

```typescript
secure: process.env.NODE_ENV === 'production',
```

### 3. Rebuild the Application

```bash
npm run build
```

### 4. Restart PM2

```bash
pm2 restart demodc-portal
```

Or if PM2 is not running:

```bash
pm2 start npm --name "demodc-portal" -- start
pm2 save
```

### 5. Test the Login Flow

1. Navigate to `http://your-ec2-ip:3000`
2. Login with: `john.doe@acme.com` / `Demo123!`
3. Enter MFA code: `123456`
4. You should now be redirected to the dashboard successfully

## When to Enable Secure Cookies

Once you have HTTPS configured (with Let's Encrypt or AWS Certificate Manager):

1. Update `.env.production`:
   ```bash
   COOKIE_SECURE=true
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   NEXT_PUBLIC_API_URL=https://your-domain.com/api
   ```

2. Rebuild and restart:
   ```bash
   npm run build
   pm2 restart demodc-portal
   ```

## Verification

Check that cookies are being set by opening browser DevTools:
1. Go to Application/Storage → Cookies
2. You should see:
   - `demodc_auth` (15 minute expiry)
   - `demodc_refresh` (30 day expiry)

## Troubleshooting

### Still redirecting to login?

1. **Check environment file is loaded:**
   ```bash
   pm2 logs demodc-portal --lines 50
   ```

2. **Verify NODE_ENV:**
   ```bash
   pm2 describe demodc-portal | grep NODE_ENV
   ```

3. **Check cookie settings in browser DevTools:**
   - Open Network tab
   - Login and complete MFA
   - Look at response headers for `Set-Cookie`
   - Verify `Secure` flag is NOT present (or present only if using HTTPS)

4. **Clear browser cookies and try again:**
   - Open DevTools → Application → Storage → Clear site data
   - Try logging in again

5. **Restart PM2 with explicit env file:**
   ```bash
   pm2 delete demodc-portal
   pm2 start npm --name "demodc-portal" -- start --node-args="--env-file=.env.production"
   pm2 save
   ```

### Check PM2 logs for errors:

```bash
pm2 logs demodc-portal --err --lines 100
```

### Test cookie endpoint directly:

```bash
curl -i http://localhost:3000/api/auth/me
```

Should return 401 if not authenticated, or user data if cookies are working.

## Security Note

**For production deployments**, you should:
1. Set up HTTPS (Let's Encrypt is free)
2. Enable `COOKIE_SECURE=true`
3. Change JWT_SECRET and SESSION_SECRET to secure random strings
4. Consider using real authentication (AWS Cognito, Auth0, etc.) instead of mock auth

## Need Help?

If you're still experiencing issues, check:
1. PM2 logs: `pm2 logs demodc-portal`
2. Browser console for errors
3. Network tab in DevTools for API responses
4. Ensure .env.production is in the root directory
