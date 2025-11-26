#!/usr/bin/env bash
set -euo pipefail

# deploy-ubuntu.sh
# Minimal deployment script for Ubuntu 18.04+ / Debian 9+ servers.
# Usage (on target Ubuntu server):
#   sudo bash deploy-ubuntu.sh --repo /opt/groq --env /opt/groq/.env
# Or run locally to rsync/scp files then SSH-run this script remotely.

REPO_DIR="/opt/groq"
REPO_GIT=""
ENV_FILE="${REPO_DIR}/.env"
DOCKER_COMPOSE_FILE="${REPO_DIR}/docker-compose.yml"
SERVICE_NAME="groq-app"

print_usage() {
  cat <<EOF
Usage: sudo $0 [--repo /opt/groq] [--git <git_repo_url>] [--env /path/to/.env]

Options:
  --repo   Target path on remote server (default: /opt/groq)
  --git    Git URL to clone (if provided script will clone into --repo)
  --env    Path to .env to copy into repository (default: ${REPO_DIR}/.env)

This script installs Docker, Docker Compose plugin, deploys the repo, and
creates a systemd unit to manage the docker-compose stack.
EOF
}

# --- Parse args ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO_DIR="$2"; shift 2;;
    --git) REPO_GIT="$2"; shift 2;;
    --env) ENV_FILE="$2"; shift 2;;
    -h|--help) print_usage; exit 0;;
    *) echo "Unknown arg: $1"; print_usage; exit 1;;
  esac
done

if [[ "$EUID" -ne 0 ]]; then
  echo "This script must be run as root (sudo)." >&2
  exit 1
fi

install_prereqs() {
  apt-get update
  apt-get install -y ca-certificates curl gnupg lsb-release apt-transport-https
}

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    echo "Docker already installed"
    return
  fi

  mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable --now docker
}

deploy_repo() {
  # If git url provided, clone or update
  if [[ -n "$REPO_GIT" ]]; then
    if [[ -d "$REPO_DIR/.git" ]]; then
      echo "Updating repository in $REPO_DIR"
      git -C "$REPO_DIR" pull --rebase || true
    else
      echo "Cloning $REPO_GIT to $REPO_DIR"
      mkdir -p "$REPO_DIR"
      git clone --depth 1 "$REPO_GIT" "$REPO_DIR"
    fi
  else
    echo "Assuming repository already present at $REPO_DIR"
    mkdir -p "$REPO_DIR"
  fi

  # Copy .env if provided and exists (skip if it's already in repo)
  if [[ -f "$ENV_FILE" ]]; then
    echo "Using env file: $ENV_FILE"
    cp "$ENV_FILE" "$REPO_DIR/.env"
    chmod 600 "$REPO_DIR/.env"
  else
    echo "No .env file provided/found at $ENV_FILE - ensure variables are set on server!"
  fi

  chown -R root:root "$REPO_DIR"
}

start_compose() {
  echo "Bringing up docker compose stack..."
  # Use docker compose plugin
  docker compose -f "$DOCKER_COMPOSE_FILE" pull --ignore-pull-failures || true
  docker compose -f "$DOCKER_COMPOSE_FILE" up -d --remove-orphans
}

create_systemd_unit() {
  local unit_path="/etc/systemd/system/${SERVICE_NAME}.service"
  cat > "$unit_path" <<EOF
[Unit]
Description=Groq Docker Compose stack
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${REPO_DIR}
ExecStart=/usr/bin/docker compose -f ${DOCKER_COMPOSE_FILE} up -d --remove-orphans
ExecStop=/usr/bin/docker compose -f ${DOCKER_COMPOSE_FILE} down
TimeoutStartSec=300
TimeoutStopSec=300

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable --now ${SERVICE_NAME}
}

# --- main ---
install_prereqs
install_docker

# Optional: run project's init script if present
if [[ -f "${REPO_DIR}/init.sh" ]]; then
  bash "${REPO_DIR}/init.sh" || true
fi

deploy_repo
start_compose
create_systemd_unit

echo "Deployment complete. Check 'docker ps' and 'docker compose logs'."
exit 0
