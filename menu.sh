#!/usr/bin/env bash
# Simple interactive menu for managing Bytrix stack on Ubuntu
# Usage: bash scripts/menu.sh

set -euo pipefail

COMPOSE="docker-compose"
API_SERVICE="bytrix-api"
NGINX_SERVICE="bytrix-nginx"
CADDY_SERVICE="bytrix-caddy"
CERTBOT_SERVICE="bytrix-certbot"

BASE_URL="http://127.0.0.1:3000"
API_BASE="${API_BASE_PATH:-/api/v1}"

print_header() {
  clear
  echo "=================================================="
  echo " Bytrix API Management Menu"
  echo "=================================================="
  echo "Domain      : ${DOMAIN:-(unset)}"
  echo "API Base    : ${API_BASE}"
  echo "Compose File: docker-compose.yml"
  echo "Node Env    : ${NODE_ENV:-unknown}"
  echo "=================================================="
  echo
}

pause() {
  echo
  read -rp "Tekan Enter untuk kembali ke menu..." _
}

check_health() {
  echo "[+] Cek health endpoint"
  curl -sS "${BASE_URL}/health" || echo "Gagal mengakses health endpoint"
  pause
}

info_root() {
  echo "[+] Info root API"
  curl -sS "${BASE_URL}${API_BASE}" || echo "Gagal akses root API"
  pause
}

generate_dev_token() {
  echo "[+] Generate dev token"
  local user_id role
  read -rp "Masukkan user_id (default: dev-user): " user_id || true
  user_id=${user_id:-dev-user}
  read -rp "Masukkan role (default: authenticated): " role || true
  role=${role:-authenticated}
  RESP=$(curl -sS -X POST "${BASE_URL}${API_BASE}/auth/dev-token" -H 'Content-Type: application/json' -d "{\"user_id\":\"${user_id}\",\"role\":\"${role}\"}") || true
  echo "$RESP" | jq . 2>/dev/null || echo "$RESP"
  TOKEN=$(echo "$RESP" | jq -r .token 2>/dev/null || true)
  if [[ -n "${TOKEN}" && "${TOKEN}" != "null" ]]; then
    echo "[+] Simpan token sementara ke .dev-token"
    echo "$TOKEN" > .dev-token
  else
    echo "[!] Token tidak didapat. Cek log/API."
  fi
  pause
}

show_token() {
  if [[ -f .dev-token ]]; then
    echo "Dev Token:"; cat .dev-token
  else
    echo "[!] Tidak ada .dev-token. Generate dulu."
  fi
  pause
}

upload_test_file() {
  if [[ ! -f .dev-token ]]; then
    echo "[!] Tidak ada token. Generate dulu."
    pause; return
  fi
  echo "Test file content" > test.txt
  echo "[+] Upload test.txt"
  RESP=$(curl -sS -X POST "${BASE_URL}${API_BASE}/files/upload" \
    -H "Authorization: Bearer $(cat .dev-token)" \
    -F "file=@test.txt") || true
  echo "$RESP" | jq . 2>/dev/null || echo "$RESP"
  FILE_ID=$(echo "$RESP" | jq -r .data.id 2>/dev/null || true)
  if [[ -n "$FILE_ID" && "$FILE_ID" != "null" ]]; then
    echo "[+] File ID: $FILE_ID" > last_file_id
  fi
  pause
}

get_last_file() {
  if [[ ! -f last_file_id ]]; then
    echo "[!] Belum ada file yang diupload."
    pause; return
  fi
  if [[ ! -f .dev-token ]]; then
    echo "[!] Tidak ada token. Generate dulu."
    pause; return
  fi
  FILE_ID=$(cat last_file_id)
  echo "[+] Ambil metadata file $FILE_ID"
  RESP=$(curl -sS "${BASE_URL}${API_BASE}/files/${FILE_ID}" -H "Authorization: Bearer $(cat .dev-token)") || true
  echo "$RESP" | jq . 2>/dev/null || echo "$RESP"
  pause
}

gpt_generate() {
  if [[ ! -f .dev-token ]]; then
    echo "[!] Tidak ada token. Generate dulu."
    pause; return
  fi
  read -rp "Prompt GPT: " prompt || true
  prompt=${prompt:-Hello, how are you?}
  # Bangun payload JSON secara aman menggunakan jq untuk menghindari error kutip
  local payload
  payload=$(jq -Rn --arg p "$prompt" '{prompt:$p, max_tokens:128}')
  RESP=$(curl -sS -X POST "${BASE_URL}${API_BASE}/gpt/generate" \
    -H "Authorization: Bearer $(cat .dev-token)" \
    -H 'Content-Type: application/json' \
    -d "$payload") || true
  echo "$RESP" | jq . 2>/dev/null || echo "$RESP"
  pause
}

compose_ps() {
  echo "[+] Status container"
  $COMPOSE ps
  pause
}

logs_menu() {
  echo "[+] Pilih log service:"; echo "1) API"; echo "2) Nginx"; echo "3) Caddy"; echo "4) Certbot"
  read -rp "Pilih (1-4): " choice || true
  case $choice in
    1) docker logs --tail=100 -f "$API_SERVICE";;
    2) docker logs --tail=100 -f "$NGINX_SERVICE";;
    3) docker logs --tail=100 -f "$CADDY_SERVICE";;
    4) docker logs --tail=100 -f "$CERTBOT_SERVICE";;
    *) echo "Pilihan tidak dikenal";;
  esac
  pause
}

restart_services() {
  echo "[+] Restart semua service"
  $COMPOSE restart
  pause
}

rebuild_api() {
  echo "[+] Rebuild API (no cache)"
  $COMPOSE build --no-cache "$API_SERVICE"
  $COMPOSE up -d "$API_SERVICE"
  docker logs --tail=60 "$API_SERVICE"
  pause
}

self_signed_cert() {
  local live_dir="ssl/letsencrypt/live/${DOMAIN}";
  if [[ -z "${DOMAIN}" || "${DOMAIN}" == "" ]]; then
    echo "[!] DOMAIN belum diset di .env"; pause; return
  fi
  mkdir -p "$live_dir"
  openssl req -x509 -nodes -days 30 -newkey rsa:2048 \
    -keyout "$live_dir/privkey.pem" \
    -out "$live_dir/fullchain.pem" \
    -subj "/CN=${DOMAIN}" || true
  echo "[+] Self-signed certificate dibuat (30 hari). Restart nginx untuk pakai:"
  echo "    docker-compose restart bytrix-nginx"
  pause
}

menu_loop() {
  while true; do
    print_header
    echo "1) Cek health"
    echo "2) Info root API"
    echo "3) Generate dev token"
    echo "4) Lihat dev token"
    echo "5) Upload test file"
    echo "6) Get metadata last file"
    echo "7) GPT generate (simple)"
    echo "8) docker-compose ps"
    echo "9) Lihat logs"
    echo "10) Restart semua service"
    echo "11) Rebuild API (no-cache)"
    echo "12) Buat self-signed cert"
    echo "0) Keluar"
    echo
    read -rp "Pilih menu: " opt || true
    case "$opt" in
      1) check_health;;
      2) info_root;;
      3) generate_dev_token;;
      4) show_token;;
      5) upload_test_file;;
      6) get_last_file;;
      7) gpt_generate;;
      8) compose_ps;;
      9) logs_menu;;
      10) restart_services;;
      11) rebuild_api;;
      12) self_signed_cert;;
      0) echo "Bye"; exit 0;;
      *) echo "Pilihan tidak valid"; sleep 1;;
    esac
  done
}

menu_loop