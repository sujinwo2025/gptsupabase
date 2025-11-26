#!/bin/bash
# One-Click Setup Script for Bytrix API (Ubuntu 18.04+, Debian 9+)
# This script prepares everything for: docker-compose up -d
# Compatible with: Ubuntu 18.04+, Debian 9+, CentOS 7+, Alpine

set -e

# Detect OS
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    elif type lsb_release >/dev/null 2>&1; then
        OS=$(lsb_release -si | tr '[:upper:]' '[:lower:]')
        VER=$(lsb_release -sr)
    fi
}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

detect_os

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Bytrix API - One-Click Setup                    ║${NC}"
echo -e "${BLUE}║        Auto SSL Setup (docker-compose up -d ready)        ║${NC}"
if [ ! -z "$OS" ]; then
    echo -e "${BLUE}║  OS: $OS $VER                                           ║${NC}"
fi
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Get domain from user or use default
DOMAIN=${1:-file.bytrix.my.id}
EMAIL=${2:-admin@example.com}

# Check for required commands
echo -e "${YELLOW}Checking dependencies...${NC}"
missing_deps=()

if ! command -v openssl &> /dev/null; then
    missing_deps+=("openssl")
fi

if ! command -v docker &> /dev/null; then
    missing_deps+=("docker")
fi

if ! command -v docker-compose &> /dev/null; then
    missing_deps+=("docker-compose")
fi

if [ ${#missing_deps[@]} -gt 0 ]; then
    echo -e "${RED}✗ Missing dependencies: ${missing_deps[*]}${NC}\n"
    echo -e "${YELLOW}Installation instructions:${NC}"
    case "$OS" in
        ubuntu|debian)
            echo -e "  ${BLUE}sudo apt-get update${NC}"
            echo -e "  ${BLUE}sudo apt-get install -y openssl docker.io docker-compose${NC}\n"
            ;;
        centos|rhel|fedora)
            echo -e "  ${BLUE}sudo yum install -y openssl docker docker-compose${NC}\n"
            ;;
        *)
            echo -e "  Please install: ${missing_deps[*]}"
            ;;
    esac
    exit 1
fi

echo -e "${GREEN}✓ All dependencies found${NC}\n"

echo -e "${YELLOW}Configuration:${NC}"
echo -e "  Domain: ${GREEN}${DOMAIN}${NC}"
echo -e "  Email:  ${GREEN}${EMAIL}${NC}\n"

# Create directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p ssl/letsencrypt/live/$DOMAIN
mkdir -p ssl/certbot
mkdir -p caddy/data
mkdir -p caddy/config
mkdir -p logs/nginx
echo -e "${GREEN}✓ Directories created${NC}\n"

# Update .env
echo -e "${YELLOW}Updating .env...${NC}"
if [ -f .env ]; then
    if grep -q "^DOMAIN=" .env; then
        sed -i "s|^DOMAIN=.*|DOMAIN=https://${DOMAIN}|" .env
    else
        echo "DOMAIN=https://${DOMAIN}" >> .env
    fi
    if grep -q "^EMAIL=" .env; then
        sed -i "s|^EMAIL=.*|EMAIL=${EMAIL}|" .env
    else
        echo "EMAIL=${EMAIL}" >> .env
    fi
else
    cat > .env << EOF
DOMAIN=https://${DOMAIN}
EMAIL=${EMAIL}
EOF
fi
echo -e "${GREEN}✓ .env updated${NC}\n"

# Update nginx.conf
echo -e "${YELLOW}Updating nginx.conf...${NC}"
if [ -f nginx.conf ]; then
    sed -i "s|DOMAIN_PLACEHOLDER|${DOMAIN}|g" nginx.conf
    echo -e "${GREEN}✓ nginx.conf updated${NC}\n"
fi

# Create temporary self-signed certificate
echo -e "${YELLOW}Creating temporary self-signed certificate...${NC}"
if ! [ -f "ssl/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
        -keyout "ssl/letsencrypt/live/$DOMAIN/privkey.pem" \
        -out "ssl/letsencrypt/live/$DOMAIN/fullchain.pem" \
        -subj "/CN=$DOMAIN" 2>/dev/null || true
    echo -e "${GREEN}✓ Temporary certificate created${NC}\n"
fi

# Make scripts executable
echo -e "${YELLOW}Making scripts executable...${NC}"
chmod +x nginx-entrypoint.sh
chmod +x certbot-entrypoint.sh
echo -e "${GREEN}✓ Scripts ready${NC}\n"

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}\n"

echo -e "${YELLOW}Next Step:${NC}"
echo -e "  ${BLUE}docker-compose up -d${NC}\n"

echo -e "${YELLOW}Then monitor:${NC}"
echo -e "  ${BLUE}docker-compose logs -f certbot${NC}"
echo -e "  ${BLUE}docker-compose logs -f nginx${NC}"
echo -e "  ${BLUE}curl -k https://${DOMAIN}/health${NC}\n"

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"
