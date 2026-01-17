# Route 53 + Application Load Balancer + ACM SSL Setup Guide

This guide shows you how to set up your DemoDC Portal with:
- **Route 53** for DNS management
- **Application Load Balancer (ALB)** for traffic distribution
- **AWS Certificate Manager (ACM)** for free SSL certificates
- **Auto-scaling ready** architecture

## Why ALB + ACM vs Let's Encrypt?

### Advantages
- ✅ **Free SSL certificates** (AWS-managed, auto-renewal)
- ✅ **No certificate management** (AWS handles everything)
- ✅ **Better performance** (AWS edge locations)
- ✅ **Auto-scaling ready** (easily add more EC2 instances)
- ✅ **Health checks** (automatic failover)
- ✅ **AWS WAF integration** (optional security)

### Cost
- **ALB**: ~$16-20/month (base) + $0.008/LCU-hour
- **ACM Certificate**: **FREE**
- **Total**: ~$20-25/month (vs ~$15/month for basic setup)

---

## Architecture Overview

```
Internet → Route 53 (DNS)
           ↓
         Application Load Balancer (Port 80/443)
           ↓
         Target Group
           ↓
         EC2 Instance (Port 3000)
           ↓
         Next.js Application
```

---

## Prerequisites

- ✅ AWS Account
- ✅ Domain in Route 53 (or transferred to Route 53)
- ✅ EC2 instance running with DemoDC Portal
- ✅ Application running on port 3000

---

## Part 1: Prepare Your EC2 Instance

### Step 1: SSH into Your EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### Step 2: Verify Application is Running

```bash
# Check PM2 status
pm2 status

# Should show demodc-portal running on port 3000

# Test locally
curl http://localhost:3000
```

### Step 3: Update Security Group for EC2

**Important**: The ALB will communicate with EC2, so we need to update the security group.

1. Go to **EC2 Console** → **Security Groups**
2. Find your EC2 instance's security group
3. **Edit inbound rules**
4. Update to allow traffic from ALB:

**Current rules to REMOVE:**
- ❌ HTTP (80) from 0.0.0.0/0
- ❌ HTTPS (443) from 0.0.0.0/0

**New rules to ADD:**
```
Type          Protocol  Port Range  Source
SSH           TCP       22          Your IP only (e.g., 123.45.67.89/32)
Custom TCP    TCP       3000        sg-xxxxx (ALB security group - we'll create this)
```

**Note**: We'll update the port 3000 rule with the ALB security group ID after we create the ALB.

---

## Part 2: Request SSL Certificate from ACM

### Step 1: Open ACM Console

1. Go to **AWS Certificate Manager (ACM)**: https://console.aws.amazon.com/acm/
2. **IMPORTANT**: Make sure you're in the **same region** as your EC2 instance and where you'll create the ALB
3. Click **Request a certificate**

### Step 2: Request Public Certificate

1. Select **Request a public certificate**
2. Click **Next**

### Step 3: Add Domain Names

**Add both:**
- `yourdomain.com` (root domain)
- `*.yourdomain.com` (wildcard for all subdomains)

OR add specific domains:
- `yourdomain.com`
- `www.yourdomain.com`

**Example:**
```
Domain names:
yourdomain.com
*.yourdomain.com
```

Click **Next**

### Step 4: Select Validation Method

Choose **DNS validation** (recommended for Route 53)
- This is automatic if your domain is in Route 53
- Click **Next**

### Step 5: Add Tags (Optional)

```
Key: Name
Value: DemoDC-Portal-SSL
```

Click **Next**, then **Request**

### Step 6: Validate Certificate

Since your domain is in Route 53, this is automatic!

1. Click **View certificate**
2. You'll see status: **Pending validation**
3. Scroll down to **Domains** section
4. Click **Create records in Route 53** button
5. Confirm by clicking **Create records**

**Wait 2-5 minutes** for validation to complete.

Refresh the page - Status should change to **Issued** ✅

**Note**: Copy the **Certificate ARN** (looks like `arn:aws:acm:us-east-1:123456789:certificate/abc-123...`)
We'll need this for the ALB configuration.

---

## Part 3: Create Application Load Balancer

### Step 1: Open EC2 Load Balancers

1. Go to **EC2 Console**: https://console.aws.amazon.com/ec2/
2. In the left sidebar, scroll down to **Load Balancing**
3. Click **Load Balancers**
4. Click **Create load balancer**

### Step 2: Select Load Balancer Type

- Choose **Application Load Balancer**
- Click **Create**

### Step 3: Basic Configuration

**Load balancer name**: `demodc-portal-alb`

**Scheme**: 
- ✅ **Internet-facing** (public access)

**IP address type**: 
- ✅ **IPv4**

### Step 4: Network Mapping

**VPC**: Select your default VPC (or the VPC where your EC2 is)

**Mappings**: Select **at least 2 Availability Zones**
- ✅ Check 2-3 availability zones
- Each should have a public subnet selected

**Example:**
```
✅ us-east-1a - subnet-abc123
✅ us-east-1b - subnet-def456
```

### Step 5: Security Groups

Click **Create new security group**

**Security group name**: `demodc-portal-alb-sg`

**Description**: `Security group for DemoDC Portal ALB`

**VPC**: Same as selected above

**Inbound rules:**
```
Type     Protocol  Port Range  Source          Description
HTTP     TCP       80          0.0.0.0/0       Allow HTTP from internet
HTTPS    TCP       443         0.0.0.0/0       Allow HTTPS from internet
```

**Outbound rules:** (default - allow all)

Click **Create security group**

**Go back to ALB creation** and refresh the security groups dropdown, then select:
- ✅ `demodc-portal-alb-sg` (the one you just created)
- Remove the default security group

### Step 6: Listeners and Routing

You'll see two default listeners. We need to configure them:

#### Listener 1: HTTP (Port 80) - Redirect to HTTPS

**Protocol**: HTTP
**Port**: 80
**Default action**: 
- Click the dropdown and select **Redirect to...**
- **Protocol**: HTTPS
- **Port**: 443
- **Status code**: 301 - Permanently moved

#### Listener 2: HTTPS (Port 443) - Forward to Target Group

First, we need to create a target group:

Click **Create target group** (opens in new tab)

**Target group creation:**

1. **Choose target type**: 
   - ✅ Instances

2. **Target group name**: `demodc-portal-targets`

3. **Protocol**: HTTP
4. **Port**: 3000 (your Next.js app port)

5. **VPC**: Same as your EC2 instance

6. **Protocol version**: HTTP1

7. **Health checks**:
   ```
   Health check protocol: HTTP
   Health check path: /
   
   Advanced health check settings:
   - Port: Traffic port
   - Healthy threshold: 2
   - Unhealthy threshold: 2
   - Timeout: 5 seconds
   - Interval: 30 seconds
   - Success codes: 200,307
   ```

8. Click **Next**

9. **Register targets**:
   - Find your EC2 instance in the list
   - ✅ Check the box next to it
   - Click **Include as pending below**
   - Verify it appears in "Targets" section with port 3000
   - Click **Create target group**

**Go back to ALB creation tab**

For **Listener 2 (HTTPS:443)**:
- **Default action**: Forward to target group
- **Target group**: Select `demodc-portal-targets`
- **Secure listener settings**:
  - **Security policy**: ELBSecurityPolicy-2016-08 (default is fine)
  - **Default SSL/TLS certificate**:
    - ✅ From ACM
    - Select your certificate (the one you created earlier)

### Step 7: Review and Create

Review all settings:
- Load balancer name: `demodc-portal-alb`
- 2+ availability zones selected
- Security group: `demodc-portal-alb-sg`
- Listener 80: Redirects to 443
- Listener 443: Forwards to target group with ACM certificate
- Target group has your EC2 instance

Click **Create load balancer**

**Wait 3-5 minutes** for ALB to become active.

### Step 8: Get ALB DNS Name

1. Click on your load balancer name: `demodc-portal-alb`
2. Copy the **DNS name** (looks like: `demodc-portal-alb-123456789.us-east-1.elb.amazonaws.com`)
3. **Test it** in browser: `http://demodc-portal-alb-123456789.us-east-1.elb.amazonaws.com`
   - Should redirect to HTTPS and show your login page ✅

---

## Part 4: Update EC2 Security Group

Now that we have the ALB security group, update EC2 to only accept traffic from ALB:

1. Go to **EC2 Console** → **Security Groups**
2. Find your **EC2 instance security group**
3. **Edit inbound rules**
4. Update the port 3000 rule:

```
Type          Protocol  Port Range  Source                        Description
SSH           TCP       22          Your IP (123.45.67.89/32)     SSH access
Custom TCP    TCP       3000        sg-xxxxx (ALB security group) Allow from ALB only
```

**To find ALB security group ID:**
- Go to Load Balancers → Click your ALB → Security tab
- Copy the security group ID (sg-xxxxx)
- Use this in the EC2 security group rule

**Remove any old rules** for ports 80, 443, or 3000 from 0.0.0.0/0

Click **Save rules**

---

## Part 5: Point Route 53 to ALB

### Step 1: Open Route 53 Console

1. Go to **Route 53**: https://console.aws.amazon.com/route53/
2. Click **Hosted zones**
3. Click on your domain (e.g., `yourdomain.com`)

### Step 2: Create/Update A Record for Root Domain

**If you have an existing A record pointing to EC2 IP:**
- Click on the A record → **Edit record**

**If creating new:**
- Click **Create record**

**Configuration:**
```
Record name: (leave blank for root domain)
Record type: A - Routes traffic to an IPv4 address and some AWS resources

✅ Alias (toggle this ON)

Route traffic to:
- Alias to Application and Classic Load Balancer
- Region: (your ALB region, e.g., us-east-1)
- Load balancer: demodc-portal-alb-xxx... (select your ALB)

Routing policy: Simple routing

Evaluate target health: No (or Yes if you want)
```

Click **Create records** (or **Save** if editing)

### Step 3: Create/Update A Record for www Subdomain

Click **Create record** again:

```
Record name: www
Record type: A - Routes traffic to an IPv4 address and some AWS resources

✅ Alias (toggle this ON)

Route traffic to:
- Alias to Application and Classic Load Balancer
- Region: (your ALB region)
- Load balancer: demodc-portal-alb-xxx...

Routing policy: Simple routing
```

Click **Create records**

### Step 4: Verify DNS Records

```bash
# From your local machine or EC2
dig yourdomain.com

# Should show ALIAS record pointing to ALB DNS name
```

**Wait 2-5 minutes for DNS propagation**

---

## Part 6: Test Complete Setup

### Test HTTP → HTTPS Redirect

```bash
# Should redirect to HTTPS
curl -I http://yourdomain.com

# Look for:
HTTP/1.1 301 Moved Permanently
Location: https://yourdomain.com/
```

### Test HTTPS with SSL

```bash
# Should return 200 OK with secure connection
curl -I https://yourdomain.com

# Should show:
HTTP/2 200
```

### Browser Test

Visit in browser:
1. **http://yourdomain.com** → Should redirect to https://yourdomain.com
2. **https://yourdomain.com** → Should show 🔒 lock icon
3. **https://www.yourdomain.com** → Should also work
4. Click the lock icon → Certificate should be valid and issued by Amazon

### Check SSL Certificate

https://www.ssllabs.com/ssltest/
- Enter your domain
- Should get **A** rating

---

## Part 7: Update Application Configuration

### Update Environment Variables

SSH into EC2:

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
cd ~/demodc-portal-poc
```

Edit environment file:

```bash
nano .env.production
```

Update URLs to use your domain:

```bash
# Update these lines
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

Rebuild and restart:

```bash
npm run build
pm2 restart demodc-portal
```

---

## Part 8: Optional Enhancements

### 1. Enable Access Logs (Recommended)

Track all requests to your ALB:

1. Go to your ALB → **Attributes** tab
2. Click **Edit**
3. **Access logs**: Enable
4. **S3 bucket**: Create new or select existing
5. Click **Save**

### 2. Add WAF Protection (Optional - Extra Cost)

Protect against common web attacks:

1. Go to **AWS WAF Console**
2. Create Web ACL
3. Associate with your ALB
4. Add managed rule groups (AWS managed rules)

### 3. Enable Connection Draining

1. Go to Target Group → `demodc-portal-targets`
2. **Attributes** tab → **Edit**
3. **Deregistration delay**: 30 seconds (default is 300)
4. **Save changes**

### 4. CloudWatch Monitoring

Monitor ALB health:

1. Go to your ALB → **Monitoring** tab
2. View metrics:
   - Active connections
   - Target response time
   - HTTP 4xx/5xx errors
   - Healthy/unhealthy hosts

### 5. Set Up Auto Scaling (Future)

When you need to scale:

1. Create AMI from your EC2 instance
2. Create Launch Template
3. Create Auto Scaling Group
4. Attach to existing target group
5. Configure scaling policies

---

## Troubleshooting

### ALB Health Check Failing

**Symptoms**: Targets show "unhealthy" in target group

**Check:**

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Test app locally
curl http://localhost:3000

# Check PM2
pm2 status
pm2 logs demodc-portal
```

**Fix**:
1. Ensure app is running on port 3000
2. Check security group allows port 3000 from ALB
3. Verify health check path is correct (/)

### Certificate Not Working

**Symptoms**: Browser shows "Not Secure"

**Check:**
1. Certificate status in ACM (should be "Issued")
2. ALB listener 443 has certificate attached
3. Wait 5 minutes after attaching certificate

### Site Not Loading

**Check in this order:**

1. **ALB Status**: Should be "Active"
   ```
   EC2 Console → Load Balancers → Status column
   ```

2. **Target Health**: Should be "healthy"
   ```
   Target Groups → Targets tab → Health status
   ```

3. **DNS Resolution**:
   ```bash
   dig yourdomain.com
   # Should point to ALB DNS
   ```

4. **Security Groups**:
   - ALB SG: allows 80/443 from 0.0.0.0/0
   - EC2 SG: allows 3000 from ALB SG

5. **Application**:
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

### 502 Bad Gateway

**Means**: ALB can't reach your EC2 instance

**Fix:**
1. Check EC2 security group allows port 3000 from ALB SG
2. Verify app is running: `pm2 status`
3. Test locally: `curl http://localhost:3000`
4. Check target group health checks

### 504 Gateway Timeout

**Means**: App is responding too slowly

**Fix:**
1. Increase ALB timeout: Target Group → Attributes → Deregistration delay
2. Check app performance: `pm2 logs demodc-portal`
3. Consider upgrading EC2 instance size

---

## Cost Optimization

### Current Costs (Estimated Monthly)

```
EC2 t3.small:              $15.00
Application Load Balancer: $16.20 (base)
ALB LCU costs:            ~$2-5.00 (low traffic)
Route 53:                  $0.50 (hosted zone)
ACM Certificate:           $0.00 (FREE)
Data Transfer:             $1-5.00 (first 100GB free)
─────────────────────────────────
TOTAL:                     ~$35-42/month
```

### Ways to Reduce Costs

1. **Use t3.micro** instead of t3.small: Save ~$8/month
   - Fine for low-traffic demos
   
2. **Use Classic Load Balancer**: Save ~$8/month
   - Only if you don't need advanced features
   
3. **Skip ALB entirely**: Save ~$20/month
   - Use EC2 direct + Let's Encrypt (see original guide)
   - Good for: Demos, development, low traffic
   - Not good for: Production, auto-scaling needs

---

## Architecture Benefits

### Current Setup (ALB + ACM)

✅ **Auto-scaling ready** - Add more EC2 instances anytime
✅ **Zero-downtime deployments** - Blue/green deployments possible
✅ **Automatic SSL renewal** - AWS handles it
✅ **Better performance** - AWS edge caching
✅ **Health checks** - Automatic failover
✅ **Multiple domains** - Easy to add more
✅ **Enterprise-ready** - Professional architecture

### When to Use This Setup

- ✅ Production applications
- ✅ Client-facing projects
- ✅ Applications that might scale
- ✅ When you want AWS-managed infrastructure
- ✅ When budget allows (~$35-40/month)

### When to Use Simple Setup (EC2 + Let's Encrypt)

- ✅ Personal projects
- ✅ Proof of concepts
- ✅ Learning/development
- ✅ Very low traffic
- ✅ Budget-conscious (~$15/month)

---

## Quick Reference

### Important ARNs and IDs

Keep these handy:

```bash
# Certificate ARN (from ACM)
arn:aws:acm:us-east-1:123456789:certificate/abc-123...

# Load Balancer ARN
arn:aws:elasticloadbalancing:us-east-1:123456789:loadbalancer/app/demodc-portal-alb/...

# Target Group ARN
arn:aws:elasticloadbalancing:us-east-1:123456789:targetgroup/demodc-portal-targets/...

# ALB Security Group ID
sg-abc123def456

# ALB DNS Name
demodc-portal-alb-123456789.us-east-1.elb.amazonaws.com
```

### Common Commands

```bash
# Check target health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>

# View ALB attributes
aws elbv2 describe-load-balancers \
  --names demodc-portal-alb

# Test from EC2
curl http://localhost:3000
pm2 status
pm2 logs demodc-portal --lines 50

# DNS lookup
dig yourdomain.com
nslookup yourdomain.com

# Test SSL
curl -I https://yourdomain.com
openssl s_client -connect yourdomain.com:443
```

---

## Next Steps

1. ✅ Set up CloudWatch Alarms for ALB health
2. ✅ Configure ALB access logs
3. ✅ Create AMI backup of EC2 instance
4. ✅ Set up Auto Scaling Group (when needed)
5. ✅ Configure AWS WAF (if needed)
6. ✅ Set up CloudFront CDN (for global users)

Your site is now running with enterprise-grade AWS infrastructure! 🎉
