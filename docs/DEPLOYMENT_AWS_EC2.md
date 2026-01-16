# AWS EC2 Deployment Guide - DemoDC Portal

This guide will walk you through deploying the DemoDC Portal to an AWS EC2 instance so it's accessible on the web.

## Prerequisites

- AWS Account
- Domain name (optional, but recommended)
- SSH key pair for EC2 access

## Architecture Overview

```
Internet → AWS EC2 Instance → Next.js App (Port 3000)
           ↓
           Nginx (Port 80/443) → Reverse Proxy → Next.js
```

## Step 1: Launch EC2 Instance

### 1.1 Choose Instance Type
- **Recommended**: `t3.small` (2 vCPU, 2 GB RAM) - ~$15/month
- **Minimum**: `t3.micro` (2 vCPU, 1 GB RAM) - Free tier eligible
- **Region**: Choose closest to your users (e.g., `us-east-1`)

### 1.2 Select AMI
- **Ubuntu Server 22.04 LTS** (recommended)
- 64-bit (x86)

### 1.3 Configure Instance
- **Storage**: 20 GB SSD (gp3)
- **Security Group**: Create new with these rules:
  ```
  Inbound Rules:
  - SSH (22)        - Your IP only (for security)
  - HTTP (80)       - 0.0.0.0/0 (all)
  - HTTPS (443)     - 0.0.0.0/0 (all)
  - Custom (3000)   - 0.0.0.0/0 (for testing, remove later)
  ```

### 1.4 Create/Select Key Pair
- Download the `.pem` file
- Save it securely (you'll need this to SSH)

## Step 2: Connect to Your Instance

```bash
# Make key file secure
chmod 400 your-key.pem

# Connect via SSH (replace with your instance's public IP)
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## Step 3: Install Dependencies on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v20.x
npm --version   # Should be v10.x

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

## Step 4: Deploy Your Application

### 4.1 Clone Your Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository (replace with your repo URL)
git clone https://github.com/yourusername/demodc-portal-poc.git

# Or upload via SCP if not using Git:
# From your local machine:
# scp -i your-key.pem -r ./demodc-portal-poc ubuntu@your-ec2-ip:~/
```

### 4.2 Install and Build

```bash
cd demodc-portal-poc

# Install dependencies
npm install

# Build the application
npm run build
```

### 4.3 Configure Environment Variables

```bash
# Create production environment file
nano .env.production

# Add the following (adjust as needed):
```

```bash
# DemoDC Portal - Production Environment

# Application
NEXT_PUBLIC_APP_URL=http://your-domain.com  # or http://your-ec2-ip
NEXT_PUBLIC_API_URL=http://your-domain.com/api

# Authentication
USE_MOCK_AUTH=true

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-production-jwt-key-minimum-32-characters-long

# Session Secret (CHANGE THIS!)
SESSION_SECRET=your-super-secret-production-session-key-minimum-32-characters

# External APIs
NWS_API_BASE_URL=https://api.weather.gov

# Feature Flags
ENABLE_DEBUG_LOGS=false
ENABLE_MOCK_DATA=true

# Production
NODE_ENV=production
```

**Important**: Generate secure secrets using:
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Configure PM2 (Process Manager)

### 5.1 Create PM2 Configuration

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'demodc-portal',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/demodc-portal-poc',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### 5.2 Start Application with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd
# Run the command that PM2 outputs

# Check status
pm2 status
pm2 logs demodc-portal
```

### 5.3 Useful PM2 Commands

```bash
pm2 restart demodc-portal  # Restart app
pm2 stop demodc-portal     # Stop app
pm2 logs demodc-portal     # View logs
pm2 monit                  # Monitor resources
```

## Step 6: Configure Nginx (Reverse Proxy)

### 6.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/demodc-portal
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # or your EC2 IP

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Logs
    access_log /var/log/nginx/demodc-portal.access.log;
    error_log /var/log/nginx/demodc-portal.error.log;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (optional, for better performance)
    location /_next/static {
        proxy_pass http://localhost:3000/_next/static;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }
}
```

### 6.2 Enable Site and Restart Nginx

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/demodc-portal /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

## Step 7: Configure Domain (Optional but Recommended)

### 7.1 Point Domain to EC2

In your domain registrar (GoDaddy, Namecheap, etc.):
1. Create an **A Record**
   - Name: `@` (root domain)
   - Value: Your EC2 Public IP
   - TTL: 300

2. Create an **A Record** for www
   - Name: `www`
   - Value: Your EC2 Public IP
   - TTL: 300

Wait 5-15 minutes for DNS propagation.

### 7.2 Set Up HTTPS with Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS (recommended)

# Test auto-renewal
sudo certbot renew --dry-run
```

Certbot will automatically:
- Obtain SSL certificate
- Update Nginx config
- Set up auto-renewal (runs twice daily)

## Step 8: Update Application URLs

```bash
cd ~/demodc-portal-poc

# Update .env.production with your domain
nano .env.production
```

Update these values:
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

Rebuild and restart:
```bash
npm run build
pm2 restart demodc-portal
```

## Step 9: Verify Deployment

Visit your domain or EC2 IP:
- HTTP: `http://your-domain.com` (should redirect to HTTPS)
- HTTPS: `https://your-domain.com`

You should see the login page!

## Step 10: Monitoring and Maintenance

### 10.1 Check Application Health

```bash
# View PM2 logs
pm2 logs demodc-portal --lines 100

# View Nginx logs
sudo tail -f /var/log/nginx/demodc-portal.access.log
sudo tail -f /var/log/nginx/demodc-portal.error.log

# Check system resources
htop  # Install with: sudo apt install htop
```

### 10.2 Update Application

```bash
cd ~/demodc-portal-poc

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart demodc-portal
```

## Estimated Costs

### EC2 Costs (Monthly)
- **t3.micro** (Free Tier): $0 first year, then ~$7.50/month
- **t3.small** (Recommended): ~$15/month
- **Data Transfer**: ~$1-5/month (first 100GB free)

### Domain (Annual)
- **.com domain**: ~$12/year
- **SSL Certificate**: $0 (Let's Encrypt is free)

**Total**: ~$15-20/month after free tier

## Security Best Practices

1. **Change default secrets** in `.env.production`
2. **Restrict SSH access** to your IP only in Security Group
3. **Keep system updated**: `sudo apt update && sudo apt upgrade`
4. **Enable automatic security updates**:
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure --priority=low unattended-upgrades
   ```
5. **Set up CloudWatch** (optional) for monitoring
6. **Regular backups** of your EC2 instance (AMI snapshots)

## Troubleshooting

### Application won't start
```bash
# Check PM2 logs
pm2 logs demodc-portal --lines 50

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart PM2
pm2 restart demodc-portal
```

### Nginx errors
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Can't connect to server
- Verify Security Group allows HTTP/HTTPS
- Check Nginx is running: `sudo systemctl status nginx`
- Check EC2 instance is running in AWS Console

### SSL certificate issues
```bash
# Renew manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

## Alternative: Quick Deploy with Docker (Optional)

If you prefer Docker, here's a quick setup:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Build and run
docker build -t demodc-portal .
docker run -d -p 3000:3000 --name demodc demodc-portal
```

---

## Next Steps

- Set up AWS CloudWatch for monitoring
- Configure automated backups (AMI snapshots)
- Set up CI/CD with GitHub Actions
- Consider AWS Elastic Beanstalk or Amplify for easier deployments

Need help with any of these steps? Let me know!
