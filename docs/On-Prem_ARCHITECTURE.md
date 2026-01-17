# On-Premises Deployment Architecture

This document outlines the recommended architecture for deploying the PerimeterDC Portal in a secure, on-premises data center environment with SOC 2 compliance requirements.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Network Segmentation](#network-segmentation)
- [Security Layers](#security-layers)
- [SOC 2 Compliance Considerations](#soc-2-compliance-considerations)
- [Deployment Options](#deployment-options)
- [Monitoring and Logging](#monitoring-and-logging)

---

## Architecture Overview

### High-Level Architecture (3-Tier)

```
┌─────────────────────────────────────────────────────────────────┐
│                        EXTERNAL ACCESS                          │
│  Cloudflare (optional) → Reverse Proxy → Web Tier → App Tier   │
│                                              ↓                   │
│                                         Data Tier                │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended Three-Tier Architecture

```
Internet
   ↓
[Cloudflare - Optional CDN/DDoS Protection]
   ↓
Firewall (perimeter)
   ↓
┌─────────────────────────────────────────────────┐
│ DMZ / Edge Network (VLAN 10)                    │
│                                                  │
│  ┌──────────────────────────────────┐          │
│  │ Reverse Proxy Layer               │          │
│  │ - NGINX or HAProxy                │          │
│  │ - SSL/TLS Termination             │          │
│  │ - Rate Limiting                   │          │
│  │ - WAF (ModSecurity)               │          │
│  └──────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
   ↓
Internal Firewall
   ↓
┌─────────────────────────────────────────────────┐
│ Application Tier (VLAN 20)                      │
│                                                  │
│  ┌──────────────────────────────────┐          │
│  │ Next.js Application Servers       │          │
│  │ - PM2 or Docker containers        │          │
│  │ - No direct internet access       │          │
│  │ - Stateless (for scaling)         │          │
│  └──────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
   ↓
Internal Firewall
   ↓
┌─────────────────────────────────────────────────┐
│ Data Tier (VLAN 30)                             │
│                                                  │
│  ┌──────────────────────────────────┐          │
│  │ Database (if needed in future)    │          │
│  │ - PostgreSQL / MongoDB            │          │
│  │ - No external access              │          │
│  │ - Encrypted at rest               │          │
│  └──────────────────────────────────┘          │
│                                                  │
│  ┌──────────────────────────────────┐          │
│  │ File Storage / Backups            │          │
│  │ - NFS or Object Storage           │          │
│  └──────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
```

---

## Network Segmentation

### VLAN Configuration

**VLAN 10 - DMZ / Edge Network**
- Purpose: Internet-facing services only
- Components: Reverse proxy, load balancer, WAF
- Access: Internet → DMZ (443, 80), DMZ → App Tier (3000)
- Subnet: 10.10.10.0/24
- Security: Highly restricted, minimal services

**VLAN 20 - Application Tier**
- Purpose: Application servers and business logic
- Components: Next.js servers, application services
- Access: DMZ → App Tier, App Tier → Data Tier
- Subnet: 10.10.20.0/24
- Security: No direct internet access, strict firewall rules

**VLAN 30 - Data Tier**
- Purpose: Databases and persistent storage
- Components: Databases, file storage, backups
- Access: App Tier → Data Tier only
- Subnet: 10.10.30.0/24
- Security: Most restricted, encrypted storage, no outbound

**VLAN 40 - Management Network (Optional)**
- Purpose: Administrative access and monitoring
- Components: Jump boxes, monitoring tools, logging
- Access: VPN → Management only
- Subnet: 10.10.40.0/24
- Security: MFA required, session logging

### Firewall Rules

**DMZ to App Tier:**
```
Allow: TCP/3000 (Next.js) from DMZ reverse proxy IPs only
Deny: All other traffic
Log: All connection attempts
```

**App Tier to Data Tier:**
```
Allow: TCP/5432 (PostgreSQL) from App Tier IPs only
Allow: TCP/27017 (MongoDB) from App Tier IPs only
Deny: All other traffic
Log: All connection attempts
```

**App Tier Egress (if needed):**
```
# For updates/patches only - consider using proxy
Allow: TCP/443 to specific update servers
Deny: All other outbound
Log: All attempts
```

---

## Security Layers

### 1. External Layer (Optional but Recommended)

**Cloudflare (or Alternative CDN/Security Service)**

Pros:
- DDoS protection (crucial for customer portal)
- SSL/TLS management and automatic renewal
- WAF with managed rulesets
- Rate limiting and bot protection
- Analytics and threat intelligence
- Zero Trust Access options

Cons:
- External dependency
- Additional cost
- Data passes through third party

**Alternatives to Cloudflare:**
- Akamai
- Fastly
- AWS CloudFront (if willing to use some AWS services)
- Self-hosted: Skip this layer entirely

**Recommendation:** Use Cloudflare for internet-facing customer portal. Benefits outweigh concerns for this use case.

### 2. Perimeter Security (DMZ)

**Reverse Proxy: NGINX (Recommended)**

```nginx
# /etc/nginx/nginx.conf

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_conn_zone $binary_remote_addr zone=addr:10m;

# SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;

# Security Headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "default-src 'self'" always;

# ModSecurity WAF
modsecurity on;
modsecurity_rules_file /etc/nginx/modsec/main.conf;

server {
    listen 443 ssl http2;
    server_name portal.yourdatacenter.com;

    ssl_certificate /etc/ssl/certs/portal.crt;
    ssl_certificate_key /etc/ssl/private/portal.key;

    # Rate limiting
    limit_req zone=api burst=20 nodelay;
    limit_conn addr 10;

    location / {
        proxy_pass http://app-tier-lb:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Security
        proxy_hide_header X-Powered-By;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name portal.yourdatacenter.com;
    return 301 https://$server_name$request_uri;
}
```

**Web Application Firewall (WAF): ModSecurity**
- OWASP Core Rule Set (CRS)
- Custom rules for Next.js/React patterns
- SQL injection, XSS, CSRF protection
- Log all blocked requests

### 3. Application Layer Security

**Application Server Hardening:**

1. **Run as non-root user**
   ```bash
   # Create dedicated user
   useradd -r -s /bin/false perimeterdc

   # Application runs as this user
   pm2 start ecosystem.config.js --user perimeterdc
   ```

2. **Environment variable security**
   ```bash
   # Store secrets in secure vault
   # Use HashiCorp Vault or AWS Secrets Manager equivalent

   # Example: .env.production (encrypted at rest)
   SESSION_SECRET=<from-vault>
   DATABASE_URL=<from-vault>
   ```

3. **Process isolation**
   - Use Docker containers OR systemd isolation
   - Resource limits (CPU, memory)
   - Network namespace restrictions

4. **Application-level security**
   - Implement CSRF tokens (Next.js has built-in support)
   - Session management with secure cookies
   - Input validation and sanitization
   - Rate limiting at application level
   - API authentication (JWT tokens)

### 4. Data Layer Security

**Database Security:**

1. **Network isolation**
   - Database only accessible from App Tier
   - No direct internet access
   - Private IP addressing

2. **Authentication**
   - Strong passwords (min 20 characters, rotated every 90 days)
   - Separate read/write users
   - Application uses limited privilege account

3. **Encryption**
   - TLS for all database connections
   - Encryption at rest (LUKS, dm-crypt, or database-native)
   - Encrypted backups

4. **Auditing**
   - Log all database access
   - Monitor for unusual query patterns
   - Alert on schema changes

---

## SOC 2 Compliance Considerations

### Required Controls

**1. Access Controls (CC6.1, CC6.2, CC6.3)**

- Multi-factor authentication (MFA) for all administrative access
- Role-based access control (RBAC) in application
- Least privilege principle
- Regular access reviews (quarterly)
- Immediate revocation upon termination

**Implementation:**
```typescript
// RBAC implementation in Next.js
export const ROLES = {
  ADMIN: 'admin',
  FACILITY_MANAGER: 'facility_manager',
  CUSTOMER: 'customer',
  READONLY: 'readonly'
} as const;

export const PERMISSIONS = {
  VIEW_POWER: ['admin', 'facility_manager', 'customer'],
  MANAGE_USERS: ['admin'],
  VIEW_CAMERAS: ['admin', 'facility_manager', 'customer'],
  MANAGE_ACCESS: ['admin', 'facility_manager']
};
```

**2. Logging and Monitoring (CC7.2)**

- Centralized logging (syslog, ELK stack, or Splunk)
- Log retention: 1 year minimum
- Alert on security events
- Regular log review

**Implementation:**
```bash
# Centralized logging with rsyslog
# Ship logs to SIEM or log aggregator

# Critical events to log:
# - Authentication attempts (success/failure)
# - Authorization failures
# - Data access (who, what, when)
# - Configuration changes
# - Network connection attempts
# - File integrity changes
```

**3. Encryption (CC6.7)**

- TLS 1.2+ for all data in transit
- AES-256 for data at rest
- Key management and rotation
- Certificate lifecycle management

**Implementation:**
```bash
# Let's Encrypt for public certs (auto-renewal)
certbot certonly --nginx -d portal.yourdatacenter.com

# Internal PKI for internal communications
# Use tools like easy-rsa or OpenSSL

# Key rotation schedule
# - SSL/TLS certs: 90 days (automated)
# - API keys: 180 days
# - Database passwords: 90 days
# - Encryption keys: 1 year
```

**4. Change Management (CC8.1)**

- Version control (Git) - already in place
- Peer review for code changes
- Testing in staging environment
- Documented deployment procedures
- Rollback capability

**5. System Monitoring (CC7.1)**

- Uptime monitoring
- Performance monitoring
- Security monitoring (IDS/IPS)
- Capacity planning

**6. Backup and Recovery (CC9.1)**

- Daily automated backups
- Offsite backup storage (different VLAN or facility)
- Encrypted backups
- Tested restore procedures (quarterly)
- RTO: 4 hours, RPO: 24 hours

**7. Vulnerability Management (CC7.3)**

- Regular vulnerability scans (weekly)
- Patch management (critical patches within 30 days)
- Security updates testing
- Penetration testing (annual)

**8. Physical Security (CC6.4)**

- Server room access logs
- Video surveillance of server areas
- Environmental controls (temperature, humidity)
- Fire suppression

---

## Deployment Options

### Option 1: Docker-based (Recommended)

**Pros:**
- Isolation and security
- Easy scaling
- Consistent environments
- Simple rollbacks

**Implementation:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: perimeterdc-portal:latest
    container_name: perimeterdc-app
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
    ports:
      - "3000:3000"
    networks:
      - app-network
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/cache
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  app-network:
    driver: bridge
```

**Security hardening:**
```bash
# Use Docker rootless mode
dockerd-rootless-setuptool.sh install

# Scan images for vulnerabilities
trivy image perimeterdc-portal:latest

# Sign images
docker trust sign perimeterdc-portal:latest
```

### Option 2: Systemd Service (Traditional)

```ini
# /etc/systemd/system/perimeterdc.service
[Unit]
Description=PerimeterDC Portal
After=network.target

[Service]
Type=simple
User=perimeterdc
WorkingDirectory=/opt/perimeterdc-portal
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /opt/perimeterdc-portal/.next/standalone/server.js
Restart=always
RestartSec=10

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/perimeterdc-portal/logs

[Install]
WantedBy=multi-user.target
```

### Option 3: Kubernetes (For Multi-Site Deployments)

If you have multiple data centers and need centralized management:

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: perimeterdc-portal
spec:
  replicas: 3
  selector:
    matchLabels:
      app: perimeterdc-portal
  template:
    metadata:
      labels:
        app: perimeterdc-portal
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
      - name: app
        image: perimeterdc-portal:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
```

---

## Monitoring and Logging

### Monitoring Stack

**1. Application Monitoring**
- PM2 monitoring (built-in)
- Custom health check endpoint
- Performance metrics (response time, error rate)

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    // Add custom checks
    database: await checkDatabaseConnection(),
  };

  return Response.json(health);
}
```

**2. Infrastructure Monitoring**
- Prometheus + Grafana (open source)
- Nagios or Zabbix (traditional)
- DataDog or New Relic (commercial)

**Metrics to monitor:**
- CPU, memory, disk usage
- Network traffic
- Application response times
- Error rates
- Database query performance
- SSL certificate expiration

**3. Security Monitoring**

**SIEM/Log Aggregation:**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- Graylog (open source alternative)

**Intrusion Detection:**
- Suricata or Snort (network IDS)
- OSSEC or Wazuh (host-based IDS)
- Fail2ban for brute force prevention

**4. Alerting**

```yaml
# Example Prometheus alert rules
groups:
  - name: perimeterdc_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"

      - alert: DatabaseDown
        expr: up{job="postgresql"} == 0
        for: 1m
        annotations:
          summary: "Database is down"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
        for: 5m
        annotations:
          summary: "Disk space below 10%"
```

### Logging Requirements (SOC 2)

**What to log:**
- Authentication events (login, logout, failed attempts)
- Authorization failures
- Data access (reads, writes, deletes)
- Administrative actions
- Configuration changes
- System errors
- Security events

**Log format:**
```json
{
  "timestamp": "2026-01-17T16:23:45.123Z",
  "level": "info",
  "event": "user_login",
  "user_id": "user-123",
  "username": "john.doe",
  "ip_address": "10.10.20.15",
  "user_agent": "Mozilla/5.0...",
  "success": true,
  "mfa_used": true
}
```

**Log retention:**
- Active logs: 30 days online
- Archived logs: 1 year minimum (SOC 2 requirement)
- Encrypted storage
- Immutable (write-once)

---

## High Availability Configuration

### Load Balancing (No F5)

**Option 1: HAProxy (Open Source Load Balancer)**

```cfg
# /etc/haproxy/haproxy.cfg
global
    log /dev/log local0
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660
    user haproxy
    group haproxy
    daemon

defaults
    log     global
    mode    http
    option  httplog
    option  dontlognull
    timeout connect 5000
    timeout client  50000
    timeout server  50000

frontend http-in
    bind *:80
    redirect scheme https code 301 if !{ ssl_fc }

frontend https-in
    bind *:443 ssl crt /etc/ssl/certs/portal.pem

    # Security headers
    http-response set-header Strict-Transport-Security "max-age=31536000; includeSubDomains"
    http-response set-header X-Frame-Options "SAMEORIGIN"
    http-response set-header X-Content-Type-Options "nosniff"

    # Rate limiting
    stick-table type ip size 100k expire 30s store http_req_rate(10s)
    http-request track-sc0 src
    http-request deny if { sc_http_req_rate(0) gt 100 }

    default_backend app-servers

backend app-servers
    balance roundrobin
    option httpchk GET /api/health
    http-check expect status 200

    server app1 10.10.20.10:3000 check
    server app2 10.10.20.11:3000 check
    server app3 10.10.20.12:3000 check backup
```

**Option 2: NGINX Plus (Commercial, but cheaper than F5)**
- Active health checks
- Session persistence
- Dynamic reconfiguration
- Advanced load balancing algorithms

**Option 3: Keepalived + NGINX (HA pair)**
- Two NGINX servers with VRRP failover
- Virtual IP address
- Automatic failover in seconds

```conf
# /etc/keepalived/keepalived.conf
vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 101
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass secretpass
    }
    virtual_ipaddress {
        10.10.10.100/24
    }
}
```

---

## SSL/TLS Certificate Management

### Internal Certificates

**Option 1: Internal PKI with OpenSSL**

```bash
# Create Certificate Authority
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt

# Create server certificate
openssl genrsa -out server.key 4096
openssl req -new -key server.key -out server.csr
openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt
```

**Option 2: Let's Encrypt (for public-facing)**
- Free, automated certificates
- 90-day lifetime (auto-renewal)
- Trusted by all browsers

```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d portal.yourdatacenter.com

# Auto-renewal (cron job)
0 3 * * * certbot renew --quiet
```

---

## Disaster Recovery Plan

### Backup Strategy

```bash
#!/bin/bash
# /opt/scripts/backup.sh

# Backup application
tar -czf /backups/app-$(date +%Y%m%d).tar.gz /opt/perimeterdc-portal

# Backup database (if used)
pg_dump perimeterdc > /backups/db-$(date +%Y%m%d).sql

# Backup configurations
tar -czf /backups/config-$(date +%Y%m%d).tar.gz /etc/nginx /etc/systemd/system

# Encrypt backups
gpg --encrypt --recipient admin@datacenter.com /backups/*.{tar.gz,sql}

# Ship to offsite storage
rsync -avz /backups/ backup-server:/storage/perimeterdc/

# Cleanup old backups (keep 30 days)
find /backups -name "*.gpg" -mtime +30 -delete
```

### Recovery Procedures

Document and test:
1. Application recovery (from backup)
2. Database recovery (point-in-time)
3. Configuration recovery
4. Full system rebuild

**RTO (Recovery Time Objective):** 4 hours
**RPO (Recovery Point Objective):** 24 hours

---

## Security Checklist

Before going live:

- [ ] All services running as non-root
- [ ] Firewalls configured with deny-all default
- [ ] TLS 1.2+ enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] WAF rules active
- [ ] Logging to SIEM
- [ ] Monitoring and alerting configured
- [ ] Backups automated and tested
- [ ] Vulnerability scanning scheduled
- [ ] Access controls implemented
- [ ] MFA enabled for admins
- [ ] Incident response plan documented
- [ ] Security training completed
- [ ] Penetration test scheduled
- [ ] SOC 2 audit preparation complete

---

## Recommended Tools Summary

| Layer | Tool | Purpose | Cost |
|-------|------|---------|------|
| CDN/Security | Cloudflare | DDoS, WAF, SSL | $20-200/mo |
| Reverse Proxy | NGINX | Load balancing, SSL termination | Free |
| WAF | ModSecurity | Application firewall | Free |
| Container | Docker | Application isolation | Free |
| Monitoring | Prometheus + Grafana | Metrics and dashboards | Free |
| Logging | ELK Stack or Graylog | Log aggregation | Free |
| IDS/IPS | Suricata | Network intrusion detection | Free |
| Backup | Restic or Duplicity | Encrypted backups | Free |
| Secrets | HashiCorp Vault | Secret management | Free (OSS) |

**Total estimated cost:** $20-200/month (mostly Cloudflare, everything else can be FOSS)

---

## Next Steps

1. Review and approve architecture
2. Prepare hardware/VM specifications
3. Network design and VLAN configuration
4. Security policy documentation
5. Deploy staging environment
6. Security testing and hardening
7. SOC 2 audit preparation
8. Production deployment
9. Staff training
10. Go-live checklist
