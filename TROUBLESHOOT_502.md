# Troubleshooting 502 Bad Gateway Error

A 502 Bad Gateway from nginx means nginx is running but can't reach your Next.js application. Let's diagnose the issue step by step.

## Step 1: Check if Next.js App is Running

```bash
# Check PM2 status
pm2 status

# Expected output should show 'demodc-portal' as 'online'
# If it shows 'stopped' or 'errored', that's your problem
```

**If app is NOT running or shows errors:**
```bash
# View PM2 logs to see what went wrong
pm2 logs demodc-portal --lines 50

# Common issues:
# - Build errors
# - Missing dependencies
# - Port conflicts
# - Missing environment variables
```

## Step 2: Check if App is Listening on Port 3000

```bash
# Check what's running on port 3000
sudo lsof -i :3000

# Or use netstat
sudo netstat -tlnp | grep 3000

# You should see node process listening on port 3000
# Example output: node    12345 ubuntu   23u  IPv4  ...  LISTEN
```

**If nothing is on port 3000:**
- Your app isn't running (go back to Step 1)
- App might be running on different port (check PM2 logs)

## Step 3: Test Direct Connection to Next.js

```bash
# Try to connect directly to the Next.js app
curl http://localhost:3000

# This should return HTML content
# If you get "Connection refused" - app isn't running
# If you get HTML - app is running but nginx can't reach it
```

## Step 4: Check Nginx Configuration

```bash
# Test nginx configuration syntax
sudo nginx -t

# Should show "syntax is ok" and "test is successful"
```

```bash
# Check if your site is enabled
ls -la /etc/nginx/sites-enabled/

# Should show 'demodc-portal' symlink
```

```bash
# View your nginx config
cat /etc/nginx/sites-available/demodc-portal

# Verify proxy_pass points to http://localhost:3000
```

## Step 5: Check Nginx Error Logs

```bash
# View nginx error log
sudo tail -f /var/log/nginx/demodc-portal.error.log

# Look for errors like:
# - "connect() failed (111: Connection refused)"  → App not running
# - "upstream timed out" → App running but not responding
# - Permission errors → SELinux or file permission issues
```

## Step 6: Verify Build Completed Successfully

```bash
cd ~/demodc-portal-poc

# Check if .next directory exists
ls -la .next/

# Should show build output
# If missing or empty, build failed
```

**If build is missing:**
```bash
# Rebuild the application
npm run build

# Watch for errors during build
```

## Step 7: Check Environment Variables

```bash
cd ~/demodc-portal-poc

# Check if .env.production exists
cat .env.production

# Verify required variables:
# - NODE_ENV=production
# - JWT_SECRET (should be 32+ characters)
# - SESSION_SECRET (should be 32+ characters)
```

## Common Solutions

### Solution 1: Restart Everything

```bash
# Restart the app
pm2 restart demodc-portal

# Restart nginx
sudo systemctl restart nginx

# Check status
pm2 status
sudo systemctl status nginx
```

### Solution 2: Fresh Start of PM2 App

```bash
cd ~/demodc-portal-poc

# Stop and delete PM2 process
pm2 stop demodc-portal
pm2 delete demodc-portal

# Start fresh
pm2 start ecosystem.config.js

# Save process list
pm2 save

# Check logs
pm2 logs demodc-portal
```

### Solution 3: Rebuild Application

```bash
cd ~/demodc-portal-poc

# Clean build artifacts
rm -rf .next

# Reinstall dependencies (in case something is missing)
npm install

# Build
npm run build

# Restart PM2
pm2 restart demodc-portal
```

### Solution 4: Check Firewall/Security Groups

```bash
# Check if local firewall is blocking
sudo ufw status

# If active, ensure port 3000 isn't being blocked locally
# (nginx should still work even if UFW is active)
```

Also verify AWS Security Group allows:
- Port 80 (HTTP) from 0.0.0.0/0
- Port 443 (HTTPS) from 0.0.0.0/0

### Solution 5: SELinux Issues (if applicable)

```bash
# Check if SELinux is causing issues (rare on Ubuntu)
sestatus

# If SELinux is enforcing, you may need to allow nginx to connect
sudo setsebool -P httpd_can_network_connect 1
```

## Quick Diagnostic Script

Run this all-in-one diagnostic:

```bash
echo "=== PM2 Status ==="
pm2 status

echo -e "\n=== PM2 Logs (last 20 lines) ==="
pm2 logs demodc-portal --lines 20 --nostream

echo -e "\n=== Port 3000 Check ==="
sudo lsof -i :3000

echo -e "\n=== Nginx Status ==="
sudo systemctl status nginx

echo -e "\n=== Nginx Config Test ==="
sudo nginx -t

echo -e "\n=== Nginx Error Log (last 10 lines) ==="
sudo tail -10 /var/log/nginx/demodc-portal.error.log

echo -e "\n=== Test Direct Connection ==="
curl -I http://localhost:3000

echo -e "\n=== Build Directory ==="
ls -la ~/demodc-portal-poc/.next/ 2>/dev/null || echo "Build directory not found!"
```

## What to Share for Help

If you're still stuck, share these outputs:

1. `pm2 status`
2. `pm2 logs demodc-portal --lines 50`
3. `sudo tail -20 /var/log/nginx/demodc-portal.error.log`
4. `curl -I http://localhost:3000`
5. `sudo nginx -t`

This will help identify exactly where the failure is occurring.
