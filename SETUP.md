# Installation & Setup Guide - Panduan Instalasi

## Langkah 1: Prerequisites

Pastikan Anda memiliki:
- **Node.js LTS v18+** atau lebih terbaru
  - Download: https://nodejs.org/
  - Verifikasi: `node --version` dan `npm --version`
- **Git** (optional, untuk version control)
- **Terminal/PowerShell** (sudah tersedia di Windows)

## Langkah 2: Navigate ke Project Directory

```powershell
cd c:\Users\Administrator\Documents\Groq
```

## Langkah 3: Install Dependencies

```powershell
npm install
```

Ini akan menginstall semua package yang dibutuhkan berdasarkan `package.json`:
- express
- @aws-sdk/client-s3
- @supabase/supabase-js
- multer
- pino
- joi
- axios
- dotenv
- dan lainnya

**Waktu instalasi:** ~2-3 menit (tergantung internet speed)

## Langkah 4: Setup Environment Variables

### Cara 1: Copy .env.example ke .env

```powershell
copy .env.example .env
```

### Cara 2: Manual create .env file

Buat file bernama `.env` di root directory (`c:\Users\Administrator\Documents\Groq\.env`) dengan content:

```env
S3_ENDPOINT=https://s3.example.com
S3_REGION=us-east-1
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET=files

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

GPT_API_KEY=your_gpt_api_key
GPT_API_URL=https://your-custom-gpt-endpoint

PORT=3000
NODE_ENV=production
LOG_LEVEL=info
DOMAIN=https://file.bytrix.my.id
```

## Langkah 5: Configure Environment Variables

Edit `.env` dengan nilai yang sesuai:

### S3 Configuration
Gunakan credentials dari S3-compatible storage provider Anda:
- **S3_ENDPOINT**: URL endpoint S3 (e.g., https://s3.wasabisys.com)
- **S3_REGION**: Region S3 (e.g., us-east-1)
- **S3_ACCESS_KEY**: Access key dari S3
- **S3_SECRET_KEY**: Secret key dari S3
- **S3_BUCKET**: Nama bucket (e.g., "files")

### Supabase Configuration
Setup di https://supabase.co:
1. Buat project baru
2. Dapatkan URL dari `Settings > API > Project URL`
3. Dapatkan Service Role Key dari `Settings > API > Service role key`

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### GPT API Configuration
Setup endpoint custom GPT Anda:
```env
GPT_API_URL=https://your-custom-gpt-endpoint
GPT_API_KEY=sk-...
```

### Server Configuration
```env
PORT=3000
NODE_ENV=production
DOMAIN=https://file.bytrix.my.id
```

## Langkah 6: Create Supabase Database Table

Login ke Supabase console dan jalankan SQL query berikut:

```sql
-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR NOT NULL,
  s3_key VARCHAR NOT NULL,
  mimetype VARCHAR NOT NULL,
  size BIGINT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can insert their own uploads" 
  ON uploads FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own uploads" 
  ON uploads FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads" 
  ON uploads FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads" 
  ON uploads FOR DELETE USING (auth.uid() = user_id);
```

## Langkah 7: Run Server

### Mode Development (dengan auto-reload)
```powershell
npm run dev
```

Output yang diharapkan:
```
{"level":30,"time":1700899200000,"pid":12345,"hostname":"DESKTOP","port":3000,"env":"development",...,"msg":"Server running on port 3000"}
```

### Mode Production
```powershell
npm start
```

### Mode Background (menggunakan PM2)
```powershell
npm install -g pm2
pm2 start src/index.js --name bytrix-api
pm2 logs bytrix-api
```

## Langkah 8: Verify Server Running

```powershell
# Test health endpoint
curl http://localhost:3000/health

# Response yang diharapkan:
# {"status":"ok","message":"Service is running","timestamp":"2024-11-25T10:30:00.000Z"}
```

## Troubleshooting

### Error: "Cannot find module"
**Solusi:**
```powershell
npm install
# atau clean install
rm node_modules
rm package-lock.json
npm install
```

### Error: "Port 3000 already in use"
**Solusi:**
```powershell
# Change PORT di .env
# atau kill process yang menggunakan port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: "Missing environment variable"
**Solusi:**
- Pastikan .env file ada di root directory
- Pastikan semua required variables sudah set
- Jangan lupa save file setelah edit

### Error: "S3 connection failed"
**Solusi:**
- Verifikasi S3 credentials
- Test connectivity ke S3 endpoint
- Check S3 bucket permissions

### Error: "Supabase connection failed"
**Solusi:**
- Verifikasi SUPABASE_URL dan SUPABASE_SERVICE_KEY
- Test connection dari Supabase console
- Check network connectivity

## Next Steps

Setelah server running:

1. **Test Endpoints**: Gunakan Postman atau curl
2. **Setup Frontend**: Integrate dengan client aplikasi
3. **Monitor Logs**: Check real-time logs
4. **Deploy**: Ke production environment

---

## Useful Commands

| Command | Deskripsi |
|---------|-----------|
| `npm install` | Install dependencies |
| `npm start` | Run production server |
| `npm run dev` | Run development server dengan hot reload |
| `npm test` | Run tests (jika ada) |

---

**Status:** ✅ Ready to Deploy  
**Node Version:** v18+  
**Last Updated:** November 2024
