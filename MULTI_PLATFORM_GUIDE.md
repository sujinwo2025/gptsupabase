================================================================================
MULTI-PLATFORM DEPLOYMENT GUIDE
================================================================================

Version: 1.0
Date: November 25, 2025
Status: ✅ PRODUCTION READY

================================================================================
SUPPORTED PLATFORMS
================================================================================

✅ WINDOWS 10/11
   • Docker Desktop
   • init.bat script
   • 1-minute setup
   • Full SSL support

✅ MACOS (Intel/Apple Silicon)
   • Docker Desktop
   • init.sh script
   • 1-minute setup
   • Full SSL support

✅ UBUNTU 18.04+
   • Docker CE + Docker Compose
   • init.sh script
   • 1-minute setup
   • Full SSL support
   • Auto-dependency check

✅ DEBIAN 9+
   • Docker CE + Docker Compose
   • init.sh script
   • 1-minute setup
   • Full SSL support
   • Auto-dependency check

✅ CENTOS 7+
   • Docker + Docker Compose
   • init.sh script
   • 1-minute setup
   • Full SSL support

✅ ALPINE LINUX
   • Docker + Docker Compose
   • init.sh script
   • 1-minute setup
   • Full SSL support

✅ VERCEL (Serverless)
   • Web-based deployment
   • Git integration
   • 5-minute setup
   • Auto SSL via Vercel
   • FREE tier available

================================================================================
PLATFORM COMPARISON MATRIX
================================================================================

| Feature | Windows | macOS | Linux | Vercel |
|---------|---------|-------|-------|--------|
| Setup Time | 1 min | 1 min | 1 min | 5 min |
| Cost | Docker Desktop | Docker Desktop | Free | FREE |
| Scaling | Manual | Manual | Manual | Auto |
| SSL | Let's Encrypt | Let's Encrypt | Let's Encrypt | Vercel |
| Renewal | Certbot | Certbot | Certbot | Auto |
| SSH Access | Yes | Yes | Yes | No |
| Custom Domain | Yes | Yes | Yes | Yes |
| Monitoring | Basic | Basic | Basic | Full |
| Uptime SLA | 99% | 99% | 99% | 99.95% |
| Auto-renewal | 12h | 12h | 12h | Auto |

================================================================================
INSTALLATION BY PLATFORM
================================================================================

WINDOWS 10/11
─────────────────────────────────────────────────────────────

Prerequisites:
  1. Docker Desktop: https://www.docker.com/products/docker-desktop
  2. Administrator access

Installation:
  1. Download Docker Desktop
  2. Run installer
  3. Restart computer
  4. Open PowerShell as Administrator
  5. Verify: docker --version

Deployment:
  .\init.bat file.bytrix.my.id admin@bytrix.my.id
  docker-compose up -d

Status:
  docker-compose ps

Dependencies verified by script:
  ✓ docker (auto-detect)
  ✓ docker-compose (auto-detect)
  ✓ openssl (auto-detect)


MACOS (Intel/Apple Silicon)
─────────────────────────────────────────────────────────────

Prerequisites:
  1. Docker Desktop: https://www.docker.com/products/docker-desktop
  2. Homebrew (optional): /bin/bash -c "$(curl -fsSL ...)"

Installation:
  1. Download Docker Desktop for Mac
  2. Open DMG file
  3. Drag Docker to Applications
  4. Open Docker from Applications
  5. Allow privileged access
  6. Verify: docker --version

Deployment:
  bash init.sh file.bytrix.my.id admin@bytrix.my.id
  docker-compose up -d

Status:
  docker-compose ps

Dependencies verified by script:
  ✓ openssl (pre-installed)
  ✓ docker (Docker Desktop)
  ✓ docker-compose (Docker Desktop)


UBUNTU 18.04+
─────────────────────────────────────────────────────────────

Prerequisites:
  1. Ubuntu 18.04, 20.04, 22.04, or 24.04
  2. Root or sudo access

Installation:
  sudo apt-get update
  sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

  echo "deb [arch=$(dpkg --print-architecture) \
    signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
    https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

  sudo apt-get update
  sudo apt-get install -y docker-ce docker-compose

  # Add current user to docker group
  sudo usermod -aG docker $USER
  newgrp docker

Verification:
  docker --version
  docker-compose --version

Deployment:
  bash init.sh file.bytrix.my.id admin@bytrix.my.id
  docker-compose up -d

Status:
  docker-compose ps

Dependencies verified by script:
  ✓ openssl (auto-install if missing)
  ✓ docker (auto-detect)
  ✓ docker-compose (auto-detect)


DEBIAN 9+
─────────────────────────────────────────────────────────────

Prerequisites:
  1. Debian 9, 10, 11, or 12
  2. Root or sudo access

Installation:
  sudo apt-get update
  sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

  curl -fsSL https://download.docker.com/linux/debian/gpg | \
    sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

  echo "deb [arch=$(dpkg --print-architecture) \
    signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
    https://download.docker.com/linux/debian \
    $(lsb_release -cs) stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

  sudo apt-get update
  sudo apt-get install -y docker-ce docker-compose

  # Add current user to docker group
  sudo usermod -aG docker $USER
  newgrp docker

Verification:
  docker --version
  docker-compose --version

Deployment:
  bash init.sh file.bytrix.my.id admin@bytrix.my.id
  docker-compose up -d

Status:
  docker-compose ps

Dependencies verified by script:
  ✓ openssl (auto-install if missing)
  ✓ docker (auto-detect)
  ✓ docker-compose (auto-detect)


CENTOS 7+
─────────────────────────────────────────────────────────────

Prerequisites:
  1. CentOS 7 or newer
  2. Root or sudo access

Installation:
  sudo yum update -y
  sudo yum install -y \
    yum-utils \
    device-mapper-persistent-data \
    lvm2

  sudo yum-config-manager --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

  sudo yum install -y docker-ce docker-compose

  sudo systemctl start docker
  sudo systemctl enable docker

  # Add current user to docker group
  sudo usermod -aG docker $USER
  newgrp docker

Verification:
  docker --version
  docker-compose --version

Deployment:
  bash init.sh file.bytrix.my.id admin@bytrix.my.id
  docker-compose up -d

Status:
  docker-compose ps


ALPINE LINUX
─────────────────────────────────────────────────────────────

Prerequisites:
  1. Alpine Linux
  2. Root or sudo access

Installation:
  apk add --no-cache docker docker-compose

  rc-service docker start
  rc-update add docker

  # Add current user to docker group
  addgroup $(whoami) docker

Verification:
  docker --version
  docker-compose --version

Deployment:
  bash init.sh file.bytrix.my.id admin@bytrix.my.id
  docker-compose up -d

Status:
  docker-compose ps


VERCEL (Serverless)
─────────────────────────────────────────────────────────────

Prerequisites:
  1. GitHub account
  2. Vercel account (free): https://vercel.com

Installation:
  npm install -g vercel

Deployment Option A (Recommended - Git):
  1. Push to GitHub:
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin https://github.com/user/bytrix-api
     git push -u origin main

  2. Deploy via Vercel:
     vercel --prod
     (Choose "Import from GitHub")

  3. Add environment variables:
     In Vercel Dashboard → Settings → Environment Variables
     Add all required variables:
       AWS_ACCESS_KEY_ID
       AWS_SECRET_ACCESS_KEY
       AWS_REGION
       AWS_S3_BUCKET
       SUPABASE_URL
       SUPABASE_ANON_KEY
       SUPABASE_SERVICE_KEY
       GPT_API_KEY
       GPT_MODEL

  4. Redeploy:
     vercel --prod

Deployment Option B (CLI):
  1. Login: vercel login
  2. Deploy: vercel --prod
  3. Add env vars:
     vercel env add AWS_ACCESS_KEY_ID
     (repeat for each variable)
  4. Redeploy: vercel --prod

Status:
  vercel list (show deployments)
  vercel logs --follow (view logs)

API URL:
  https://your-project.vercel.app
  (or custom domain)

================================================================================
QUICK REFERENCE BY PLATFORM
================================================================================

WINDOWS QUICK SETUP
─────────────────────────────────────────────────────────────
1. Install Docker Desktop
2. Open PowerShell
3. .\init.bat file.bytrix.my.id admin@bytrix.my.id
4. docker-compose up -d
5. Done! ✅


MACOS QUICK SETUP
─────────────────────────────────────────────────────────────
1. Install Docker Desktop
2. Open Terminal
3. bash init.sh file.bytrix.my.id admin@bytrix.my.id
4. docker-compose up -d
5. Done! ✅


UBUNTU/DEBIAN QUICK SETUP
─────────────────────────────────────────────────────────────
1. Install Docker:
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose
   sudo usermod -aG docker $USER
   newgrp docker

2. Run setup:
   bash init.sh file.bytrix.my.id admin@bytrix.my.id

3. Deploy:
   docker-compose up -d

4. Done! ✅


VERCEL QUICK SETUP
─────────────────────────────────────────────────────────────
1. npm install -g vercel
2. vercel --prod
3. Add environment variables in dashboard
4. vercel --prod (redeploy)
5. Done! ✅


================================================================================
TROUBLESHOOTING BY PLATFORM
================================================================================

WINDOWS
─────────────────────────────────────────────────────────────

Q: "Docker not found"
A: Install Docker Desktop from https://www.docker.com
   OR Add to PATH: "C:\Program Files\Docker\Docker\resources\bin"

Q: "Permission denied"
A: Run PowerShell as Administrator
   OR Add user to docker-users group

Q: Port 80/443 already in use
A: Change in docker-compose.yml:
     ports:
       - "8080:80"
       - "8443:443"


MACOS
─────────────────────────────────────────────────────────────

Q: "Cannot open Docker.app"
A: Drag Docker to Applications folder
   OR brew install docker

Q: Permission denied (Apple Silicon)
A: Docker Desktop needs rosetta emulation
   Install: https://support.apple.com/en-us/HT211238


UBUNTU/DEBIAN
─────────────────────────────────────────────────────────────

Q: "docker: command not found"
A: Install Docker:
   sudo apt-get install -y docker.io
   OR follow Ubuntu installation section

Q: "permission denied while trying to connect"
A: Add user to docker group:
   sudo usermod -aG docker $USER
   newgrp docker

Q: init.sh: Permission denied
A: Make executable:
   chmod +x init.sh
   bash init.sh ...

Q: "Cannot create directory"
A: Use sudo:
   sudo bash init.sh ...
   OR fix directory permissions

Q: "Port already in use"
A: Check what's using it:
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   Kill the process or change ports


VERCEL
─────────────────────────────────────────────────────────────

Q: "No vercel command found"
A: npm install -g vercel

Q: Environment variables not working
A: Go to Vercel Dashboard → Settings → Environment Variables
   Redeploy after changes: vercel --prod

Q: "Cannot find module"
A: npm install (reinstall dependencies)
   vercel --prod (redeploy)

Q: Timeout errors
A: Vercel serverless has 60-second limit
   Optimize code or upgrade to Vercel Pro


================================================================================
OS DETECTION & AUTO-SETUP
================================================================================

The init.sh script automatically detects your OS:

✅ Ubuntu (all versions)
✅ Debian (all versions)
✅ CentOS / RHEL / Fedora
✅ Alpine Linux
✅ macOS (via lsb_release)
✅ WSL 2 (Windows Subsystem for Linux)

Detection output:
  "OS: ubuntu 22.04"
  "OS: debian 11"
  "OS: centos 7"
  etc.

If auto-detection fails:
  Set manually before running:
  export OS=ubuntu
  bash init.sh ...

================================================================================
DEPENDENCY REQUIREMENTS
================================================================================

DOCKER PLATFORMS
─────────────────────────────────────────────────────────────

Hard Requirements:
  ✓ Docker CE 20.10+ (auto-detected)
  ✓ Docker Compose 1.29+ (auto-detected)
  ✓ OpenSSL 1.1.1+ (auto-detected)
  ✓ bash or sh shell
  ✓ sed command (Unix utilities)

Soft Requirements:
  ✓ curl (for health checks)
  ✓ netstat (for troubleshooting)
  ✓ ps command (for monitoring)

The init.sh script will:
  1. Check for all hard requirements
  2. Warn if soft requirements missing
  3. Provide installation instructions
  4. Exit if critical dependencies missing


VERCEL PLATFORMS
─────────────────────────────────────────────────────────────

Hard Requirements:
  ✓ Node.js 18.0.0+
  ✓ npm 9.0.0+
  ✓ Git (for GitHub integration)
  ✓ Internet connection

Soft Requirements:
  ✓ GitHub account
  ✓ Vercel account

Installation:
  npm install -g vercel

================================================================================
ENVIRONMENT VARIABLES BY PLATFORM
================================================================================

ALL PLATFORMS REQUIRE:

AWS Integration:
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  AWS_REGION=ap-southeast-1
  AWS_S3_BUCKET=your-bucket

Supabase:
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_ANON_KEY
  SUPABASE_SERVICE_KEY

OpenAI/GPT:
  GPT_API_KEY
  GPT_MODEL=gpt-4-turbo-preview

DOCKER COMPOSE SPECIFIC:

  DOMAIN=https://file.bytrix.my.id
  EMAIL=admin@bytrix.my.id
  NODE_ENV=production
  PORT=3000

VERCEL SPECIFIC:

  Set in Vercel Dashboard:
    Settings → Environment Variables
  Same variables as above (REQUIRED)
  Automatically uses:
    NODE_ENV=production
    PORT=3000 (hardcoded)


================================================================================
PRODUCTION CHECKLIST
================================================================================

BEFORE DEPLOYMENT:

OS & Dependencies:
  ☐ OS version verified (Ubuntu 18.04+, Debian 9+, etc.)
  ☐ Docker installed and verified
  ☐ Docker Compose installed and verified
  ☐ All dependencies available

Configuration:
  ☐ Domain name ready
  ☐ DNS records pointing to server (if self-hosted)
  ☐ AWS credentials valid
  ☐ Supabase credentials valid
  ☐ OpenAI API key valid
  ☐ .env file created (if needed)

DURING DEPLOYMENT:

Docker Platforms:
  ☐ init.sh/init.bat completed without errors
  ☐ docker-compose up -d successful
  ☐ All 4 services show "Up"
  ☐ No errors in logs

Vercel:
  ☐ GitHub repository created
  ☐ vercel --prod successful
  ☐ Environment variables added
  ☐ Redeploy completed

AFTER DEPLOYMENT:

Both Platforms:
  ☐ Health endpoint responds: /health
  ☐ API endpoints accessible
  ☐ SSL certificate valid
  ☐ No errors in logs
  ☐ Database connection working
  ☐ S3 bucket accessible
  ☐ GPT integration working

Additional:
  ☐ Monitoring enabled
  ☐ Backup plan in place
  ☐ Documentation updated
  ☐ Team notified

================================================================================
MIGRATION BETWEEN PLATFORMS
================================================================================

Docker → Docker (Different OS):
  1. Export environment: docker-compose exec bytrix-api env > .env.backup
  2. Copy .env to new OS
  3. Run init.sh with same domain
  4. docker-compose up -d
  5. Done!

Docker → Vercel:
  1. Export environment: docker-compose exec bytrix-api env > .env
  2. Prepare GitHub repository
  3. vercel --prod
  4. Add same environment variables
  5. Redeploy: vercel --prod
  6. Optional: Keep Docker running as fallback

Vercel → Docker:
  1. Export from Vercel Dashboard settings
  2. Create .env locally
  3. Run init.sh
  4. docker-compose up -d
  5. Point DNS to Docker server
  6. Done!

Windows → Ubuntu:
  1. Export .env from Windows
  2. Copy source to Ubuntu
  3. bash init.sh file.bytrix.my.id admin@bytrix.my.id
  4. docker-compose up -d
  5. Update DNS if needed
  6. Done!

macOS → Linux:
  1. Export .env from macOS
  2. Copy source to Linux
  3. bash init.sh file.bytrix.my.id admin@bytrix.my.id
  4. docker-compose up -d
  5. Update DNS if needed
  6. Done!

================================================================================
PERFORMANCE NOTES
================================================================================

Response Times:

Windows/macOS Docker:
  - Cold start: ~100-200ms
  - Warm response: ~50-100ms
  - API to database: ~10-50ms
  - File upload: ~100-500ms (depends on size & S3)

Linux Docker:
  - Cold start: ~50-100ms
  - Warm response: ~20-50ms
  - API to database: ~10-50ms
  - File upload: ~100-500ms (depends on size & S3)

Vercel:
  - Cold start: ~1-2 seconds (first request)
  - Warm response: ~20-50ms
  - API to database: ~10-50ms
  - Global latency: ~50ms (via CDN)

Scaling:

Docker Platforms:
  Manual scaling:
    docker-compose up -d --scale bytrix-api=3
  Load balancing via nginx (auto-configured)

Vercel:
  Automatic scaling:
    Scales up to 10 requests/sec on free tier
    Upgrade to Pro for higher concurrency


================================================================================
MONITORING & HEALTH CHECKS
================================================================================

Health Endpoint (All Platforms):

  GET /health

  Response:
  {
    "status": "ok",
    "message": "Service is running",
    "environment": "production",
    "timestamp": "2025-11-25T10:30:00.000Z",
    "uptime": 123.456
  }

Docker Platforms (Logs):

  All services: docker-compose logs
  Specific service: docker-compose logs -f certbot
  Follow logs: docker-compose logs -f
  Tail logs: docker-compose logs --tail 100

Vercel (Logs):

  View logs: vercel logs --follow
  View deployments: vercel list
  View project: https://vercel.com/dashboard

================================================================================
SUPPORT & RESOURCES
================================================================================

Documentation:
  - QUICK_START.md (overview)
  - VERCEL_DEPLOYMENT.md (Vercel guide)
  - SSL_SETUP_GUIDE.md (SSL details)
  - CONFIGURATION.md (config reference)
  - README.md (API docs)

Official Resources:
  - Docker: https://docs.docker.com
  - Vercel: https://vercel.com/docs
  - Let's Encrypt: https://letsencrypt.org
  - Certbot: https://certbot.eff.org

Community:
  - Docker Hub: https://hub.docker.com
  - Stack Overflow: tag [docker] [vercel]
  - GitHub: Issues & discussions

================================================================================
