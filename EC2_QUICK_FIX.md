# Quick Fix for EC2 Login Issue

## The Problem
Cookies not working in production → Login redirects back to login page

## The Solution
**Step 1:** SSH into your EC2 instance

**Step 2:** Create `.env.production` file in your app directory:

```bash
cd /path/to/radiusdc-portal-poc

cat > .env.production << 'ENVEOF'
NEXT_PUBLIC_APP_URL=http://YOUR_EC2_IP:3000
NEXT_PUBLIC_API_URL=http://YOUR_EC2_IP:3000/api
USE_MOCK_AUTH=true
JWT_SECRET=change-this-to-random-string-32chars
SESSION_SECRET=change-this-to-random-string
COOKIE_SECURE=false
NWS_API_BASE_URL=https://api.weather.gov
ENABLE_DEBUG_LOGS=false
ENABLE_MOCK_DATA=true
NODE_ENV=production
ENVEOF
```

Replace `YOUR_EC2_IP` with your actual EC2 public IP.

**Step 3:** Pull latest code (includes cookie fix):

```bash
git pull origin main
```

**Step 4:** Rebuild:

```bash
npm run build
```

**Step 5:** Restart PM2:

```bash
pm2 restart demodc-portal
```

**Step 6:** Test login at `http://YOUR_EC2_IP:3000`

## Demo Credentials

- **Email:** john.doe@acme.com
- **Password:** Demo123!
- **MFA Code:** 123456

## If Still Not Working

1. **Check PM2 logs:**
   ```bash
   pm2 logs demodc-portal --lines 50
   ```

2. **Verify environment:**
   ```bash
   cat .env.production
   ```

3. **Clear browser cookies** and try again

4. **Check browser DevTools:**
   - Network tab → Look for `Set-Cookie` headers after MFA
   - Console tab → Check for errors

5. **Restart with fresh PM2:**
   ```bash
   pm2 delete demodc-portal
   pm2 start npm --name "demodc-portal" -- start
   pm2 save
   ```

## What Changed

The fix changes cookie security from:
```typescript
secure: process.env.NODE_ENV === 'production'  // ❌ Always true in production
```

To:
```typescript
secure: process.env.COOKIE_SECURE === 'true'   // ✅ Controlled by env var
```

This allows cookies to work over HTTP while still supporting HTTPS when configured.

## Next Steps (Optional)

When you add HTTPS (Let's Encrypt):
1. Change `COOKIE_SECURE=false` to `COOKIE_SECURE=true`
2. Update URLs to use `https://`
3. Rebuild and restart

See `DEPLOYMENT_FIX.md` for detailed troubleshooting.
