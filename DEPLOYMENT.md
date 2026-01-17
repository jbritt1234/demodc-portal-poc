# DemoDC Portal - Deployment & Operations Guide

This guide covers deploying, updating, and managing the DemoDC Portal application on AWS EC2.

## Table of Contents

- [Initial Deployment](#initial-deployment)
- [Updating the Application](#updating-the-application)
- [Process Management with PM2](#process-management-with-pm2)
- [Troubleshooting](#troubleshooting)
- [AWS Infrastructure](#aws-infrastructure)

---

## Initial Deployment

### Prerequisites

- AWS EC2 instance (Ubuntu 22.04 recommended)
- Node.js 18+ and npm installed
- Git installed
- PM2 installed globally: `npm install -g pm2`

### First-Time Setup

1. **Clone the repository**
   ```bash
   cd ~
   git clone <your-repo-url> radiusdc-portal-poc
   cd radiusdc-portal-poc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Start with PM2**
   ```bash
   pm2 start npm --name "dcdemo-portal" -- start
   pm2 save
   pm2 startup
   ```

   The `pm2 startup` command will output a command to run with sudo - copy and execute it to enable PM2 to start on system boot.

---

## Updating the Application

When you've made changes to the code and pushed to your Git repository, follow these steps on your EC2 instance:

### Step-by-Step Update Process

1. **Navigate to project directory**
   ```bash
   cd ~/radiusdc-portal-poc
   ```

2. **Pull latest code**
   ```bash
   git pull origin main
   ```

   If you're on a different branch:
   ```bash
   git pull origin <branch-name>
   ```

3. **Install any new dependencies**
   ```bash
   npm install
   ```

   This is safe to run every time - it will only install new packages if package.json changed.

4. **Rebuild the application**
   ```bash
   npm run build
   ```

   This creates an optimized production build in the `.next` directory.

5. **Restart the application**
   ```bash
   pm2 restart dcdemo-portal
   ```

### Quick Update Script

You can also run all steps at once:

```bash
cd ~/radiusdc-portal-poc && \
git pull && \
npm install && \
npm run build && \
pm2 restart dcdemo-portal
```

---

## Process Management with PM2

PM2 is a production process manager for Node.js applications. It keeps your app running and provides monitoring tools.

### Common PM2 Commands

#### Check Application Status
```bash
pm2 status
```
Shows all PM2-managed processes with their status, CPU, memory usage, and uptime.

#### View Application Logs
```bash
# View all logs (combined stdout and stderr)
pm2 logs dcdemo-portal

# View only error logs
pm2 logs dcdemo-portal --err

# View last 100 lines
pm2 logs dcdemo-portal --lines 100

# Follow logs in real-time
pm2 logs dcdemo-portal --lines 0
```

#### Restart Application
```bash
# Restart by name
pm2 restart dcdemo-portal

# Restart all apps
pm2 restart all

# Reload with zero-downtime (recommended for production)
pm2 reload dcdemo-portal
```

#### Stop Application
```bash
pm2 stop dcdemo-portal
```

#### Start Stopped Application
```bash
pm2 start dcdemo-portal
```

#### Remove Application from PM2
```bash
pm2 delete dcdemo-portal
```

#### Monitor Resources
```bash
# Real-time monitoring dashboard
pm2 monit

# Detailed info about the app
pm2 show dcdemo-portal
```

#### Save Current PM2 State
After making changes to PM2 processes, save the configuration:
```bash
pm2 save
```

### PM2 Startup Configuration

To ensure PM2 and your application start automatically after a server reboot:

```bash
# Generate startup script
pm2 startup

# After running the generated sudo command, save the current process list
pm2 save
```

### Viewing Build Output

If the build fails or you want to see what happened during the build:

```bash
# Check the build output
npm run build 2>&1 | tee build.log

# View the log file
cat build.log
```

---

## Troubleshooting

### Application Won't Start

1. **Check if port 3000 is already in use**
   ```bash
   sudo lsof -i :3000
   ```

   If something is using port 3000, you can kill it:
   ```bash
   sudo kill -9 <PID>
   ```

2. **Check PM2 logs for errors**
   ```bash
   pm2 logs dcdemo-portal --err --lines 50
   ```

3. **Verify Node.js version**
   ```bash
   node --version
   ```
   Should be 18.0.0 or higher.

4. **Check if build was successful**
   ```bash
   ls -la .next/
   ```
   Should contain `BUILD_ID`, `server`, and `static` directories.

### Build Failures

1. **Clear Next.js cache and rebuild**
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Clear node_modules and reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

3. **Check disk space**
   ```bash
   df -h
   ```

### Application Running but Not Accessible

1. **Check if the app is listening**
   ```bash
   curl http://localhost:3000
   ```

   If this works but the domain doesn't, it's likely an ALB or DNS issue.

2. **Check security group settings**
   - EC2 instance security group should allow inbound traffic from ALB on port 3000
   - ALB security group should allow inbound HTTP (80) and HTTPS (443) from 0.0.0.0/0

3. **Check ALB target group health**
   - In AWS Console → EC2 → Target Groups
   - Select your target group and check the "Targets" tab
   - Instance should show as "healthy"

### Memory Issues

If the application is using too much memory:

```bash
# Check current memory usage
free -h

# Set Node.js memory limit in PM2
pm2 delete dcdemo-portal
pm2 start npm --name "dcdemo-portal" --max-memory-restart 500M -- start
pm2 save
```

### High CPU Usage

Check what's consuming CPU:
```bash
# System-wide
top

# PM2 monitoring
pm2 monit
```

---

## AWS Infrastructure

### Current Setup

- **Domain**: www.dcdemo.click
- **DNS**: Route 53
- **Load Balancer**: Application Load Balancer (ALB)
- **SSL/TLS**: AWS Certificate Manager (ACM)
- **Compute**: EC2 instance running Next.js on port 3000

### Architecture Flow

```
Internet → Route 53 (DNS) → ALB (443/80) → EC2 Instance (3000) → Next.js App
```

### ALB Configuration

1. **Listeners**:
   - HTTP (80) → Redirect to HTTPS (443)
   - HTTPS (443) → Forward to Target Group

2. **Target Group**:
   - Protocol: HTTP
   - Port: 3000
   - Health check path: `/` or `/api/health`
   - Health check interval: 30 seconds

3. **SSL Certificate**:
   - Managed by ACM
   - Auto-renewal enabled

### Checking ALB Health

```bash
# From EC2 instance, check if app responds locally
curl http://localhost:3000

# Check if ALB can reach the instance (from another machine)
curl http://<ALB-DNS-name>
curl https://www.dcdemo.click
```

### Environment Variables

If you need to set environment variables:

1. **Create `.env.local` file**
   ```bash
   nano ~/radiusdc-portal-poc/.env.local
   ```

2. **Add your variables**
   ```
   NODE_ENV=production
   # Add other variables as needed
   ```

3. **Restart the app**
   ```bash
   pm2 restart dcdemo-portal
   ```

---

## Monitoring and Maintenance

### Regular Maintenance Tasks

1. **Monitor application logs**
   ```bash
   pm2 logs dcdemo-portal --lines 50
   ```

2. **Check application health**
   ```bash
   curl http://localhost:3000
   pm2 status
   ```

3. **Monitor server resources**
   ```bash
   # Disk usage
   df -h

   # Memory usage
   free -h

   # CPU and processes
   top
   ```

4. **Update system packages (monthly)**
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

5. **Rotate logs**
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

### Backup Recommendations

1. **Code**: Already backed up in Git repository
2. **PM2 configuration**: Saved with `pm2 save`
3. **Server snapshot**: Create AMI in AWS Console periodically

---

## Quick Reference

### Most Common Commands

| Task | Command |
|------|---------|
| Update app | `cd ~/radiusdc-portal-poc && git pull && npm install && npm run build && pm2 restart dcdemo-portal` |
| Check status | `pm2 status` |
| View logs | `pm2 logs dcdemo-portal` |
| Restart app | `pm2 restart dcdemo-portal` |
| Monitor resources | `pm2 monit` |
| Test locally | `curl http://localhost:3000` |

### Important Paths

| Description | Path |
|-------------|------|
| Application root | `~/radiusdc-portal-poc` |
| Build output | `~/radiusdc-portal-poc/.next` |
| PM2 logs | `~/.pm2/logs/` |
| Node modules | `~/radiusdc-portal-poc/node_modules` |

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check application logs: `pm2 logs dcdemo-portal --err`
2. Check system logs: `sudo journalctl -u pm2-<username> -n 50`
3. Verify all services are running: `pm2 status` and check ALB health in AWS Console
4. Test locally: `curl http://localhost:3000`

For emergency rollback to previous version:
```bash
cd ~/radiusdc-portal-poc
git log --oneline -n 5  # Find the commit hash to rollback to
git checkout <commit-hash>
npm install
npm run build
pm2 restart dcdemo-portal
```
