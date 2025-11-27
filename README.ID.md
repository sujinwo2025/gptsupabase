# Bytrix — README (Bahasa Indonesia)

 Ringkasan
- Bytrix adalah backend layanan manajemen file dengan integrasi GPT.
- Dijalankan menggunakan Docker + docker-compose dan dilindungi oleh reverse proxy (Nginx/Caddy) serta otomatisasi SSL (Certbot/Caddy).

- ```git clone https://github.com/sujinwo2025/gptsupabase.git gpt```

   ```cd gpt```

 Isi penting
- Lokasi proyek: `c:\Users\Administrator\Documents\Groq`
- Entrypoint aplikasi: `src/index.js`
- Konfigurasi lingkungan: file `.env` di root proyek
- Compose file: `docker-compose.yml`

Persiapan sebelum menjalankan
1. Salin dan isi `.env`
   - `DOMAIN` wajib FQDN (contoh: `file.bytrix.my.id`) — jangan pakai skema `http(s)://`.
   - `EMAIL` untuk pendaftaran Let's Encrypt.
   - S3: `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_URL_EXPIRY` (opsional).
   - Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_TABLE_UPLOADS` (default `uploads`).
   - GPT (opsional): `GPT_API_KEY` dan/atau `GPT_API_URL`, `GPT_MODEL`, `GPT_TEMPERATURE`, `GPT_MAX_TOKENS`.
   - Keamanan: `JWT_SECRET` (untuk token lokal/dev), `JWT_EXPIRY`, `SIGNED_URL_EXPIRY`, `MAX_FILE_SIZE`.
   - Pastikan `.env` tidak dikomit; gunakan permission yang ketat.

2. DNS (agar SSL otomatis berhasil)
- Tambahkan A/AAAA record untuk `DOMAIN` ke IP server publik.
- Subdomain `www` bersifat opsional. Jika tidak dibuat, Caddy akan menulis error NXDOMAIN untuk `www.DOMAIN` di log — aman diabaikan atau nonaktifkan blok `www` (lihat bagian Caddy).
- Jika DNS belum siap, Nginx dapat jalan dengan sertifikat sementara; browser akan memberi peringatan sampai sertifikat valid tersedia.

3. Cek port & direktori
- Port host: `80` dan `443` dipakai Nginx; `8080`/`8443` dipakai Caddy (opsional); `3000` dipakai API.
- Pastikan folder `ssl/letsencrypt`, `ssl/certbot`, `caddy/data`, `caddy/config`, dan `logs/nginx` ada dan dapat ditulis Docker.

Memulai layanan (lokal / server)
1. Jalankan (PowerShell):
```powershell
cd 'c:\Users\Administrator\Documents\Groq'; docker-compose pull; docker-compose build; docker-compose up -d
```

2. Cek status dan log
```powershell
docker-compose ps; docker-compose logs -f
# Untuk mengikuti log service tertentu jalankan terpisah jika ingin stream kontinu:
docker logs -f bytrix-api --tail 200
```

3. Cek health endpoint (di host)
```powershell
Invoke-RestMethod -Uri http://127.0.0.1:3000/health
```

Variasi Bash (Linux/Ubuntu)
```bash
cd /home/ubuntu/gptsupabase
docker-compose pull
docker-compose build
docker-compose up -d
docker-compose ps
curl -sS http://127.0.0.1:3000/health | jq .
```

Penggunaan dasar API
- Upload file: `POST /api/v1/files/upload` (multipart/form-data, butuh Bearer JWT)
- Get metadata: `GET /api/v1/files/{id}`
- Public redirect: `GET /file/{id}` (redirect ke signed URL)
- Generate text (GPT): `POST /api/v1/gpt/generate` (butuh Bearer token)
- Dev token (opsional, untuk pengujian lokal): `POST /auth/dev-token` menghasilkan JWT bertanda tangan lokal menggunakan `JWT_SECRET`.

Integrasi GPT (otomasi)
- Ada file `scripts/gpt_prompt_templates.md` yang berisi template prompt untuk meminta GPT mengenerate struktur HTTP request.
- Ada executor `scripts/gpt_api_executor.js` yang menerima JSON terstruktur (dari GPT) lalu mengeksekusi request termasuk multipart upload.

Autentikasi & Keamanan
- Skema Bearer didukung:
   - Supabase JWT (end-user token)
   - Supabase Service Role Key (sebagai Bearer; dianggap service user berhak penuh — lindungi baik-baik)
   - JWT lokal (dev) via `JWT_SECRET` — dapat dibuat melalui `POST /auth/dev-token` jika tidak dinonaktifkan.
- Nonaktifkan endpoint dev token di produksi dengan set `DISABLE_DEV_TOKEN=true` atau pastikan `NODE_ENV=production` dan hanya izinkan sementara untuk uji.
- Jangan simpan kredensial di repo. Gunakan environment variables atau secret manager.
- Batasi akses ke `.env` dan rahasia lain.
- Jangan simpan kredensial di repo. Gunakan environment variables atau secret manager.
- Batasi akses ke `.env` (chmod atau set ACL di Windows).
- Uji di lingkungan development (`http://localhost:3000/api/v1`) sebelum menuju production.

Membersihkan / Shutdown
```powershell
# hentikan dan hapus container; hapus image jika perlu
docker compose down; docker image rm <image-name>
```

Troubleshooting singkat
- Nginx gagal start: jalankan `docker logs bytrix-nginx` dan `nginx -t` dalam container.
- Caddy ACME error (NXDOMAIN/connection refused):
   - Abaikan jika Anda tidak memakai `www.DOMAIN` (hapus blok `www` di `caddy/Caddyfile` bila ingin bersih), atau buat DNS A untuk `www` ke IP server.
   - Jika Nginx menangani 80/443 publik, Caddy tidak bisa menyelesaikan ACME — biarkan Caddy hanya sebagai reverse proxy lokal (lihat bagian Caddy Mode Lokal).
- API restart loop `ERR_MODULE_NOT_FOUND` (contoh: `jsonwebtoken`): rebuild image API setelah menambah dependensi.
   ```bash
   docker-compose build bytrix-api
   docker-compose up -d bytrix-api
   docker logs bytrix-api --tail=100
   ```
- `host not found in upstream "bytrix-api:3000"` di Nginx: terjadi jika API belum sehat. Perbaiki API, lalu `docker-compose restart nginx`.

 Kontak & Dokumentasi
 - Semua panduan digabung di satu dokumen ini (`README.ID.md`) untuk memudahkan penggunaan pribadi.
 - File dokumentasi lain dianggap opsional dan tidak diperlukan; cukup ikuti langkah di sini.

---
File ini dibuat otomatis sebagai README berbahasa Indonesia. Jika mau saya commit file ini ke git atau modifikasi gaya/isi, katakan saja apa yang diinginkan.
 
 Instalasi di Linux (Ubuntu / Debian)
 
 1) Persyaratan awal
 - Server Ubuntu 18.04+ atau Debian 9+ dengan akses sudo.
 - DNS A/AAAA record untuk `DOMAIN` jika ingin Let's Encrypt bekerja.
 - Pastikan port `80` dan `443` dapat diakses (firewall atau cloud provider).
 
 2) Langkah singkat pemasangan Docker & Compose (Ubuntu/Debian)
 ```bash
 # Update paket, tambahkan repo Docker, dan instal paket (gabungkan agar mudah dijalankan)
 sudo apt update && sudo apt install -y ca-certificates curl gnupg lsb-release; sudo mkdir -p /etc/apt/keyrings; \
 curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg; \
 echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null; \
 sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin; sudo systemctl enable --now docker; \
 sudo usermod -aG docker $USER
 # Logout/login atau jalankan `newgrp docker` untuk menerapkan group membership
 ```

 3) Siapkan direktori proyek dan file `.env`
 ```bash
 # Siapkan direktori proyek, clone repo, dan edit .env (gabungkan langkah)
 sudo mkdir -p /opt/groq; sudo chown $USER:$USER /opt/groq; cd /opt/groq; git clone <repo-url> .; cp .env.example .env; nano .env
 ```

 4) Pastikan direktori SSL & Caddy ada dan permissions benar
 ```bash
 mkdir -p ssl/letsencrypt ssl/certbot caddy/data caddy/config logs/nginx; sudo chown -R $USER:$USER ssl caddy logs
 ```

 5) Jalankan stack dengan Docker Compose
 ```bash
 # di direktori proyek: tarik, build, dan jalankan stack
 docker compose pull; docker compose build; docker compose up -d
 ```

   5.1) Rebuild API setelah menambah dependensi
   - Jika ada error seperti `ERR_MODULE_NOT_FOUND` (mis. `jsonwebtoken`), lakukan rebuild API:
   ```bash
   docker-compose build bytrix-api
   docker-compose up -d bytrix-api
   docker logs bytrix-api --tail=100
   docker-compose restart nginx
   docker logs bytrix-nginx --tail=100
   ```

 6) Pengaturan firewall (opsional UFW)
 ```bash
 sudo ufw allow OpenSSH; sudo ufw allow 80/tcp; sudo ufw allow 443/tcp; sudo ufw enable
 ```

 7) Verifikasi
 ```bash
 docker compose ps; docker compose logs -f; curl -I http://127.0.0.1:3000/health
 ```

 Catatan
 - Jika DNS sudah diarahkan, Caddy/Certbot akan mencoba mengeluarkan sertifikat otomatis. Jika gagal, cek `docker logs bytrix-caddy` dan `docker logs bytrix-certbot`.
 - Untuk production, pertimbangkan memasang monitoring, backup, dan sistem log terpusat.

FAQ Ringkas
- Bagaimana jika Nginx error "host not found in upstream bytrix-api:3000"?
   - Perbaiki dulu API (rebuild seperti di 5.1), lalu `docker-compose restart nginx`.
- Caddy banyak error ACME (NXDOMAIN/connection refused)?
   - Mode Caddy sudah disetel ke lokal (`import local`) agar tidak mencoba ACME saat Nginx memegang 80/443. Jika ingin pakai Caddy untuk SSL, pindahkan 80/443 ke Caddy dan pastikan DNS `DOMAIN` (dan opsional `www`) sudah benar.
- Di mana health check?
   - `GET http://127.0.0.1:3000/health`. Gunakan dari dalam host untuk memastikan API sehat.

Mode Caddy
- Default: `caddy` diekspose di `8080/8443` dan mencoba ACME untuk `{$DOMAIN}` serta redirect `www` → non-www.
- Jika tidak ingin Caddy mencoba ACME saat Nginx pegang 80/443, ubah baris terakhir `caddy/Caddyfile` dari `import production` menjadi `import local` lalu restart:
   ```bash
   docker-compose restart caddy
   docker logs bytrix-caddy --tail=100
   ```

Perubahan dependency (build ulang API)
- Setiap ada perubahan dependency Node.js, lakukan rebuild image API:
   ```bash
   docker-compose build bytrix-api
   docker-compose up -d bytrix-api
   ```

Ringkasan service & port (default compose)
- `bytrix-api`: port host `3000` → container `3000`
- `bytrix-nginx`: port host `80, 443` → container `80, 443`
- `bytrix-caddy`: port host `8080, 8443` → container `80, 443`
- `bytrix-certbot`: tanpa port; berbagi volume `/etc/letsencrypt` & webroot ACME dengan Nginx
