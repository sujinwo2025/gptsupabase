# Bytrix — README (Bahasa Indonesia)

Ringkasan
- Bytrix adalah backend layanan manajemen file dengan integrasi GPT.
- Dijalankan menggunakan Docker + docker-compose dan dilindungi oleh reverse proxy (Nginx/Caddy) serta otomatisasi SSL (Certbot/Caddy).

Isi penting
- Lokasi proyek: `c:\Users\Administrator\Documents\Groq`
- Entrypoint aplikasi: `src/index.js`
- Konfigurasi lingkungan: file `.env` di root proyek
- Compose file: `docker-compose.yml`

Persiapan sebelum menjalankan
1. Salin dan isi `.env`
   - Pastikan `DOMAIN` hanya FQDN (mis. `file.bytrix.my.id`) — jangan sertakan `http(s)://`.
   - Isi `EMAIL` (untuk registrasi Let's Encrypt).
   - Isi S3: `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`.
   - Isi Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.
   - Isi GPT: `GPT_API_KEY` atau `GPT_API_URL`.
   - Pastikan `.env` tidak dikomit dan izinkan akses terbatas (set permissions).

2. DNS (opsional untuk SSL nyata)
- Untuk sertifikat Let's Encrypt, tambahkan A/AAAA record untuk `DOMAIN` ke IP server.
- Jika DNS belum diatur, stack akan menggunakan sertifikat self-signed (akan muncul peringatan di browser).

3. Cek port & direktori
- Pastikan port host `80`, `443`, dan `3000` bebas, atau sesuaikan port di `docker-compose.yml`.
- Pastikan folder `./ssl`, `./caddy/data`, `./caddy/config`, dan `./ssl/letsencrypt` ada dan dapat ditulis oleh Docker.

Memulai layanan (lokal / server)
1. Jalankan (PowerShell):
```powershell
cd 'c:\Users\Administrator\Documents\Groq'; docker compose pull; docker compose build; docker compose up -d
```

2. Cek status dan log
```powershell
docker compose ps; docker compose logs -f
# Untuk mengikuti log service tertentu jalankan terpisah jika ingin stream kontinu:
docker logs -f bytrix-api --tail 200
```

3. Cek health endpoint (di host)
```powershell
Invoke-RestMethod -Uri http://127.0.0.1:3000/health
```

Penggunaan dasar API
- Upload file: `POST /api/v1/files/upload` (multipart/form-data, butuh Bearer JWT)
- Get metadata: `GET /api/v1/files/{id}`
- Public redirect: `GET /file/{id}` (redirect ke signed URL)
- Generate text (GPT): `POST /api/v1/gpt/generate` (requires Bearer JWT)

Integrasi GPT (otomasi)
- Ada file `scripts/gpt_prompt_templates.md` yang berisi template prompt untuk meminta GPT mengenerate struktur HTTP request.
- Ada executor `scripts/gpt_api_executor.js` yang menerima JSON terstruktur (dari GPT) lalu mengeksekusi request termasuk multipart upload.

Keamanan & best practices
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
- Caddy/Certbot gagal ACME: cek DNS A record dan `docker logs bytrix-caddy` / `docker logs bytrix-certbot`.
- API `unhealthy`: pastikan health endpoint `GET /health` mengembalikan 200 dari dalam container dan gunakan `127.0.0.1`.

Kontak & dokumentasi lanjutan
- Dokumentasi tambahan ada di folder proyek (`MIGRATE_TO_UBUNTU.md`, `VERCEL_DEPLOYMENT.md`, dsb.).
- Jika butuh bantuan lanjutan, beri tahu saya fitur mana yang ingin diuji atau di-deploy ke server.

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
