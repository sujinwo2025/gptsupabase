# Bytrix API - Backend Service

Production-ready Node.js + Express backend service untuk menghubungkan Custom GPT API, S3-compatible storage, dan Supabase.

## 🚀 Quick Start

### Prerequisites

- Node.js LTS (v18+)
- npm atau yarn
- Environment variables yang dikonfigurasi

### Installation

1. **Clone atau masuk ke project directory**
   ```bash
   cd c:\Users\Administrator\Documents\Groq
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   copy .env.example .env
   ```

4. **Configure .env file dengan kredensial Anda**
   ```
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
   DOMAIN=https://file.bytrix.my.id
   ```

5. **Jalankan server**
   ```bash
   npm start
   ```

   Atau untuk development dengan watch mode:
   ```bash
   npm run dev
   ```

## ⚙️ Configuration System

### Overview
Semua konfigurasi endpoint dan settings disentralisasi dalam file `src/config/endpoints.js` dan dikontrol melalui environment variables (.env). Tidak perlu mengubah kode untuk mengkustomisasi endpoint path.

### Centralized Configuration (`src/config/endpoints.js`)

File ini mengekspor dua object utama:

#### 1. **endpoints** - Endpoint paths yang dapat dikonfigurasi
```javascript
{
  BASE: '/api/v1',                              // Base API path
  FILES: {
    BASE: '/api/v1/files',                      // Files base
    UPLOAD: '/api/v1/files/upload',             // File upload
    GET: '/api/v1/files/:id',                   // Get file details
    LIST: '/api/v1/files/list',                 // List all files
    DELETE: '/api/v1/files/:id',                // Delete file
    DOWNLOAD: '/file/:id'                       // Public download (vanity URL)
  },
  GPT: {
    BASE: '/api/v1/gpt',                        // GPT base
    GENERATE: '/api/v1/gpt/generate'            // Generate text
  },
  GPT_ACTIONS: {
    BASE: '/api/v1/gpt/actions',                // GPT Actions base
    FILES: {
      LIST: '/api/v1/gpt/actions/files/list',   // List files for GPT
      GET: '/api/v1/gpt/actions/files/:id',     // Get file details
      INFO: '/api/v1/gpt/actions/files/info',   // Get file info
      DELETE: '/api/v1/gpt/actions/files/:id'   // Delete file
    },
    QUERY: '/api/v1/gpt/actions/query'          // Query files
  },
  HEALTH: '/health',                            // Health check
  INFO: '/api/v1'                               // API info
}
```

#### 2. **config** - Server dan service configurations
```javascript
{
  port: 3000,
  env: 'production',
  logLevel: 'info',
  domain: 'https://file.bytrix.my.id',
  s3: {
    endpoint: 'https://s3.example.com',
    region: 'us-east-1',
    accessKey: 'xxx',
    secretKey: 'xxx',
    bucket: 'files',
    urlExpiry: 3600
  },
  supabase: {
    url: 'https://xxx.supabase.co',
    key: 'xxx',
    tableUploads: 'uploads'
  },
  gpt: {
    apiKey: 'xxx',
    apiUrl: 'https://xxx',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000
  },
  jwt: { expiry: 3600 },
  signedUrl: { expiry: 3600 },
  uploads: { maxFileSize: 104857600 }
}
```

### Environment Variables (.env)

Tambahkan variables berikut ke `.env` file Anda. Semua values sudah memiliki default, jadi yang dikonfigurasi hanya yang diperlukan:

#### Server Configuration
```bash
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
DOMAIN=https://file.bytrix.my.id
```

#### S3 / File Storage
```bash
S3_ENDPOINT=https://s3.amazonaws.com
S3_REGION=us-east-1
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET=your_bucket_name
S3_URL_EXPIRY=3600
```

#### Supabase / Database
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_TABLE_UPLOADS=uploads
```

#### Custom GPT API
```bash
GPT_API_KEY=your_gpt_api_key
GPT_API_URL=https://your-custom-gpt-endpoint
GPT_MODEL=gpt-3.5-turbo
GPT_TEMPERATURE=0.7
GPT_MAX_TOKENS=2000
```

#### API Endpoint Paths (Optional - customize if needed)
```bash
API_BASE_PATH=/api/v1
FILE_ENDPOINT_BASE=/api/v1/files
GPT_ENDPOINT_BASE=/api/v1/gpt
GPT_ACTIONS_BASE=/api/v1/gpt/actions
```

#### Security & Expiry Settings
```bash
JWT_EXPIRY=3600
SIGNED_URL_EXPIRY=3600
MAX_FILE_SIZE=104857600
```

### Customization Examples

#### Change API Base Path
```bash
# Default: /api/v1
# Custom:
API_BASE_PATH=/api/v2
```
Sekarang semua endpoint akan menggunakan `/api/v2` sebagai base.

#### Change File Upload Endpoint
```bash
# Default: /api/v1/files/upload
# Custom:
FILE_ENDPOINT_BASE=/api/v2/storage
```
Upload endpoint menjadi: `POST /api/v2/storage/upload`

#### Change Public Download URL
```bash
# Edit src/config/endpoints.js line 14:
# FILES: { DOWNLOAD: '/file/:id' } → { DOWNLOAD: '/download/:id' }
```
Akses file publik: `GET /download/:id` (bukan `/file/:id`)

#### Change GPT Endpoint
```bash
# Default: /api/v1/gpt
# Custom:
GPT_ENDPOINT_BASE=/api/v2/ai
```
GPT generate endpoint: `POST /api/v2/ai/generate`

### How It Works

1. **Application starts** → `src/index.js` imports `config` dan `endpoints` dari `src/config/endpoints.js`

2. **Config loads environment variables**:
   ```javascript
   const port = parseInt(process.env.PORT) || 3000;
   const apiBasePath = process.env.API_BASE_PATH || '/api/v1';
   ```

3. **Endpoints reference config values**:
   ```javascript
   app.use(endpoints.BASE, indexRoutes)        // Uses API_BASE_PATH from .env
   app.use(endpoints.FILES.BASE, fileRoutes)   // Uses FILE_ENDPOINT_BASE from .env
   app.listen(config.port)                     // Uses PORT from .env
   ```

4. **Change any endpoint** → Edit `.env` file → Restart server
   ```
   Tidak perlu mengubah kode! 🎉
   ```

### Default Values

Jika environment variable tidak diset, system menggunakan default values yang tersedia di `src/config/endpoints.js`:

| Variable | Default Value |
|----------|---------------|
| PORT | 3000 |
| NODE_ENV | development |
| LOG_LEVEL | info |
| DOMAIN | http://localhost:3000 |
| API_BASE_PATH | /api/v1 |
| FILE_ENDPOINT_BASE | /api/v1/files |
| GPT_ENDPOINT_BASE | /api/v1/gpt |
| GPT_ACTIONS_BASE | /api/v1/gpt/actions |
| S3_REGION | us-east-1 |
| S3_URL_EXPIRY | 3600 |
| SUPABASE_TABLE_UPLOADS | uploads |
| GPT_MODEL | gpt-3.5-turbo |
| GPT_TEMPERATURE | 0.7 |
| GPT_MAX_TOKENS | 2000 |
| JWT_EXPIRY | 3600 |
| SIGNED_URL_EXPIRY | 3600 |
| MAX_FILE_SIZE | 104857600 (100MB) |

## 📁 Struktur Project

```
src/
├── config/              # External service configurations
│   ├── s3.js           # AWS S3 client & helpers
│   ├── supabase.js     # Supabase client & helpers
│   └── gpt.js          # GPT API client & helpers
├── services/            # Business logic
│   ├── fileService.js  # File upload & retrieval logic
│   └── gptService.js   # GPT text generation logic
├── controllers/         # Route handlers
│   ├── fileController.js
│   └── gptController.js
├── routes/              # API routes
│   ├── index.js        # Root routes
│   ├── fileRoutes.js   # File endpoints
│   └── gptRoutes.js    # GPT endpoints
├── middleware/          # Express middleware
│   ├── auth.js         # Supabase JWT verification
│   └── errorHandler.js # Error handling & CORS
├── utils/               # Utility functions
│   ├── logger.js       # Pino JSON logger
│   ├── validators.js   # Joi validation schemas
│   └── errorHandler.js # Custom error classes
└── index.js            # Express app entry point
```

## 🔌 API Endpoints

### Health Check
```bash
GET /health
```

Cek status server.

**Response:**
```json
{
  "status": "ok",
  "message": "Service is running",
  "timestamp": "2024-11-25T10:30:00Z"
}
```

### Info API
```bash
GET /api/v1
```

Dapatkan informasi umum API.

---

## 📤 File Management

### Upload File
```bash
POST /api/v1/files/upload
```

**Headers:**
```
Authorization: Bearer <SUPABASE_JWT_TOKEN>
Content-Type: multipart/form-data
```

**Body:**
```
file: <binary_file>
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "File uploaded successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "document.pdf",
    "size": 2048000,
    "mimetype": "application/pdf",
    "url": "https://file.bytrix.my.id/api/v1/files/550e8400-e29b-41d4-a716-446655440000"
  },
  "url": "https://file.bytrix.my.id/api/v1/files/550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "No file provided",
  "errorCode": "NO_FILE"
}
```

### Get File Metadata & Signed URL
```bash
GET /api/v1/files/:id
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "File retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "document.pdf",
    "mimetype": "application/pdf",
    "size": 2048000,
    "created_at": "2024-11-25T10:30:00Z",
    "s3_key": "uploads/user-id/550e8400-e29b-41d4-a716-446655440000.pdf",
    "signed_url": "https://s3.example.com/files/uploads/user-id/550e8400...?X-Amz-Signature=...",
    "expires_in": 3600
  }
}
```

**Error Response (404):**
```json
{
  "status": "error",
  "message": "Resource not found",
  "errorCode": "NOT_FOUND",
  "timestamp": "2024-11-25T10:30:00Z"
}
```

---

## 🤖 GPT Integration

### Generate Text
```bash
POST /api/v1/gpt/generate
```

**Headers:**
```
Authorization: Bearer <SUPABASE_JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "prompt": "Write a professional email to a client",
  "temperature": 0.7,
  "max_tokens": 500,
  "model": "gpt-3.5-turbo"
}
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| prompt* | string | - | Input prompt untuk GPT |
| temperature | number | 0.7 | Kreativitas respons (0-2) |
| max_tokens | number | 2000 | Max token dalam respons |
| model | string | gpt-3.5-turbo | Model GPT yang digunakan |
| top_p | number | 1 | Nucleus sampling parameter |
| frequency_penalty | number | 0 | Penalti untuk token berulang (-2 to 2) |
| presence_penalty | number | 0 | Penalti untuk token baru (-2 to 2) |

**Response (200 OK):**
```json
{
  "status": "ok",
  "data": {
    "id": "chatcmpl-8N8z2kcs0Oy7R4zT5X6Y7Z",
    "model": "gpt-3.5-turbo",
    "created": 1700899200,
    "message": "Dear Client,\n\nI hope this email finds you well...",
    "usage": {
      "prompt_tokens": 15,
      "completion_tokens": 120,
      "total_tokens": 135
    },
    "finish_reason": "stop"
  }
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "prompt",
      "message": "\"prompt\" is required"
    }
  ]
}
```

---

## 🤖 GPT CRUD Actions System

Custom GPT dapat automatically mengelola file dengan 5 CRUD actions yang terintegrasi langsung.

### ⚙️ How It Works

```
Custom GPT User Input
        ↓
GPT Receives: System Prompt (250+ lines) + Function Definitions (5)
        ↓
GPT Analyzes: What user wants, which action to use
        ↓
GPT Executes: HTTP request to action endpoint
        ↓
Bytrix Server: Validates ownership → Executes → Returns result
        ↓
GPT Formats: Response untuk user
        ↓
User Sees: Helpful, formatted response
```

### 📋 Available Actions

#### 1️⃣ List Files
```bash
GET /api/v1/gpt/actions/files/list
Authorization: Bearer <JWT_TOKEN>
```

**Deskripsi:** Daftar semua file user dengan metadata  
**Response:** Array of files dengan: id, filename, mimetype, size, created_at  
**Use case:** User says "Show my files"

**Response Example:**
```json
{
  "status": "ok",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "filename": "document.pdf",
      "mimetype": "application/pdf",
      "size": 2621440,
      "created_at": "2024-11-25T10:30:00Z"
    }
  ],
  "count": 1
}
```

#### 2️⃣ Get File (dengan Signed URL)
```bash
POST /api/v1/gpt/actions/files/get
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "file_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Deskripsi:** Get file metadata + signed download URL (expires 1 hour)  
**Parameters:**
- `file_id` (UUID, required) - ID file yang di-request

**Use case:** User says "Download document.pdf"

**Response Example:**
```json
{
  "status": "ok",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "document.pdf",
    "mimetype": "application/pdf",
    "size": 2621440,
    "created_at": "2024-11-25T10:30:00Z",
    "s3_key": "uploads/user-id/file-id.pdf",
    "signed_url": "https://s3.example.com/...?signature=...",
    "expires_in": 3600
  }
}
```

#### 3️⃣ File Info (Detailed)
```bash
POST /api/v1/gpt/actions/files/info
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "file_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Deskripsi:** Get detailed file information (readable size, file type, date)  
**Parameters:**
- `file_id` (UUID, required) - ID file

**Use case:** User says "Tell me about image.jpg"

**Response Example:**
```json
{
  "status": "ok",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "image.jpg",
    "mimetype": "image/jpeg",
    "size": 1847592,
    "size_readable": "1.8 MB",
    "created_at": "2024-11-25T10:30:00Z",
    "file_type": "image",
    "s3_key": "uploads/user-id/file-id.jpg"
  }
}
```

#### 4️⃣ Query/Search Files
```bash
POST /api/v1/gpt/actions/query
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "filename": "document",
  "mimetype": "application/pdf",
  "size_max": 5242880,
  "after_date": "2024-11-01"
}
```

**Deskripsi:** Search & filter files dengan multiple criteria  
**Parameters (optional):**
- `filename` (string) - Search by filename (partial match)
- `mimetype` (string) - Filter by MIME type (e.g., "application/pdf")
- `size_min` (number) - Minimum file size in bytes
- `size_max` (number) - Maximum file size in bytes
- `after_date` (string, ISO date) - Files created after date

**Use case:** User says "Find all PDFs smaller than 5MB from last week"

**Response Example:**
```json
{
  "status": "ok",
  "data": [
    {
      "id": "uuid-1",
      "filename": "report.pdf",
      "mimetype": "application/pdf",
      "size": 2400000,
      "created_at": "2024-11-22T10:30:00Z"
    },
    {
      "id": "uuid-2",
      "filename": "proposal.pdf",
      "mimetype": "application/pdf",
      "size": 1800000,
      "created_at": "2024-11-20T10:30:00Z"
    }
  ],
  "count": 2
}
```

#### 5️⃣ Delete File
```bash
POST /api/v1/gpt/actions/files/delete
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "file_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Deskripsi:** Delete file dari S3 & database (dengan ownership verification)  
**Parameters:**
- `file_id` (UUID, required) - ID file yang akan dihapus

**Use case:** User says "Delete the old backup.zip"

**Response Example:**
```json
{
  "status": "ok",
  "message": "File deleted successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "deleted": true
  }
}
```

### 🎮 Enable Actions in GPT Generate

```bash
POST /api/v1/gpt/generate
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "prompt": "List my files",
  "include_actions": true,
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "max_tokens": 2000
}
```

**Parameter:**
- `include_actions` (boolean, optional, default: false) - Enable GPT CRUD actions

**Apa yang terjadi saat `include_actions: true`:**
1. Server mengirim **system_prompt** (250+ lines) ke GPT
   - Menjelaskan 5 available actions
   - Kapan menggunakan setiap action
   - Guidelines untuk behavior yang benar
2. Server mengirim **function_definitions** (5 functions)
   - list_files, get_file, delete_file, file_info, query_files
3. GPT dapat execute actions otomatis
4. Response include `function_call` field jika GPT trigger action

**Response Example (dengan action):**
```json
{
  "status": "ok",
  "data": {
    "id": "chatcmpl-xxx",
    "model": "gpt-3.5-turbo",
    "message": "You have 3 files: document.pdf, image.jpg, spreadsheet.xlsx",
    "function_call": {
      "name": "list_files",
      "arguments": "{}"
    },
    "usage": {
      "prompt_tokens": 150,
      "completion_tokens": 80,
      "total_tokens": 230
    }
  }
}
```

### 📖 System Prompt Content

GPT menerima system prompt yang comprehensive (250+ lines):

**Main Sections:**
1. **Introduction** - Apa peran GPT
2. **5 Available Actions** - Detailed explanation
3. **When to Use Each** - Decision tree
4. **Important Guidelines** - File ownership, confirmation untuk delete, dll
5. **File Types** - Recognition (images, documents, spreadsheets, dll)
6. **Response Format** - Cara format jawaban untuk user
7. **Error Handling** - Handling berbagai skenario error

**Key Guidelines dalam Prompt:**
- ✅ Respect file ownership - hanya akses file sendiri
- ✅ Confirmation untuk delete - jangan langsung hapus
- ✅ Search refinement - arahkan user jika results terlalu banyak
- ✅ File classification - bantu user understand tipe file
- ✅ Contextual responses - remember conversation history

### 🔐 Security Features

**Setiap action endpoint:**
- ✅ JWT authentication (Bearer token)
- ✅ User ownership verification (check user_id di database)
- ✅ Input validation (Joi schemas)
- ✅ Proper HTTP status codes
- ✅ No information leakage dalam errors
- ✅ Audit logging untuk semua operations

**Contoh ownership check:**
```javascript
// Handler verify ownership sebelum return file
if (metadata.user_id !== req.userId) {
  throw new NotFoundError('File not found or access denied');
}
```

### 🧪 Testing Actions

#### Dengan cURL

**List files:**
```bash
curl -X GET "http://localhost:3000/api/v1/gpt/actions/files/list" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get file:**
```bash
curl -X POST "http://localhost:3000/api/v1/gpt/actions/files/get" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"file_id":"550e8400-e29b-41d4-a716-446655440000"}'
```

**Query files:**
```bash
curl -X POST "http://localhost:3000/api/v1/gpt/actions/query" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mimetype":"application/pdf"}'
```

**Generate dengan actions:**
```bash
curl -X POST "http://localhost:3000/api/v1/gpt/generate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "List my files",
    "include_actions": true,
    "model": "gpt-3.5-turbo"
  }'
```

#### Dengan VS Code REST Client
Gunakan file `requests.http` yang sudah disediakan - ada contoh untuk semua endpoints.

#### Dengan Postman
1. Import `gpt-actions-schema.json` (OpenAPI spec)
2. Setup Bearer token authentication
3. Test setiap endpoint

### 📊 File Types Recognition

System mengerti berbagai file types:
- **Images:** jpg, png, gif, webp, bmp
- **Documents:** pdf, doc, docx, txt, rtf
- **Spreadsheets:** xls, xlsx, csv, ods
- **Presentations:** ppt, pptx, odp
- **Archives:** zip, rar, 7z, tar, gz
- **Media:** mp4, mp3, avi, mov, mkv, wav

### 📈 Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| List files | ~30ms | Single DB query |
| Get file | ~45ms | Query + S3 URL generation |
| File info | ~40ms | Query + formatting |
| Query/search | ~120ms | Dynamic WHERE clause |
| Delete file | ~80ms | Delete from DB + S3 |

**Signed URL Expiry:** 1 hour (configurable)  
**Max File Size:** 100 MB (configurable)

### 🎯 Example Use Cases

#### Use Case 1: User wants to see all files
```
User: "Show me my files"
→ GPT calls: list_files
→ User sees: "You have 5 files: document.pdf, image.jpg, ..."
```

#### Use Case 2: User wants to download specific file
```
User: "Download document.pdf"
→ GPT calls: get_file (with filename search)
→ User gets: Download link (expires in 1 hour)
```

#### Use Case 3: User wants to search PDFs
```
User: "Find all PDF files larger than 1 MB"
→ GPT calls: query (mimetype=application/pdf, size_min=1048576)
→ User sees: "Found 3 PDFs matching your criteria"
```

#### Use Case 4: User wants to delete file
```
User: "Delete the old backup"
→ GPT finds: File matching "backup"
→ GPT confirms: "Are you sure?" (best practice)
→ User confirms: "Yes"
→ GPT calls: delete_file
→ User sees: "✅ File deleted"
```

### 🚀 Setup Custom GPT Integration

**For Custom GPT to work:**

1. **Server harus running** - npm start
2. **Import OpenAPI Spec** di Custom GPT:
   - File: `gpt-actions-schema.json`
   - Define 5 endpoints dengan security
3. **Add System Instructions** dari system prompt
4. **Configure Authentication** - Bearer token
5. **Test** - Talk to GPT about files

**Di Custom GPT builder:**
- Go to: https://chat.openai.com/gpts/editor
- Add Schema: Import `gpt-actions-schema.json`
- Add Instructions: Use system prompt dari code
- Setup Auth: Bearer token configuration

---

## 🔐 Authentication

Semua endpoint yang dilindungi memerlukan Supabase JWT token di header:

```bash
Authorization: Bearer <YOUR_SUPABASE_JWT_TOKEN>
```

**Cara mendapatkan token:**
1. Gunakan Supabase Auth SDK untuk login user
2. Token akan otomatis tersedia dalam session
3. Sertakan token di header `Authorization: Bearer {token}`

**Contoh dengan curl:**
```bash
curl -X POST http://localhost:3000/api/v1/gpt/generate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello"}'
```

---

## 🗄️ Database Schema

### Supabase Table: `uploads`

Buat table berikut di Supabase:

```sql
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR NOT NULL,
  s3_key VARCHAR NOT NULL,
  mimetype VARCHAR NOT NULL,
  size BIGINT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_created_at ON uploads(created_at DESC);
```

---

## 📝 Error Handling

Sistem error handling yang konsisten dengan status code HTTP standar:

| Status Code | Error Code | Penjelasan |
|-------------|-----------|-----------|
| 400 | VALIDATION_ERROR | Input validation gagal |
| 401 | AUTHENTICATION_ERROR | JWT token invalid atau expired |
| 404 | NOT_FOUND | Resource tidak ditemukan |
| 500 | S3_ERROR | S3 operation gagal |
| 500 | GPT_ERROR | GPT API call gagal |
| 500 | SUPABASE_ERROR | Database operation gagal |
| 500 | INTERNAL_ERROR | Unexpected server error |

**Error Response Format:**
```json
{
  "status": "error",
  "message": "Error description",
  "errorCode": "ERROR_CODE",
  "timestamp": "2024-11-25T10:30:00Z",
  "details": {}
}
```

---

## 📊 Logging

Menggunakan **Pino** untuk JSON logging. Logs tersedia di stdout/stderr dengan format:

```json
{
  "level": 30,
  "time": 1700899200000,
  "pid": 12345,
  "hostname": "bytrix-server",
  "method": "POST",
  "path": "/api/v1/files/upload",
  "status": 200,
  "duration": "234ms",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "msg": "POST /api/v1/files/upload - 200"
}
```

### Log Levels:
- **trace** (10): Sangat detail, untuk debug purposes
- **debug** (20): Debug information
- **info** (30): Informasi umum tentang operasi
- **warn** (40): Warning - sesuatu yang tidak biasa tapi bukan error
- **error** (50): Error - operasi gagal
- **fatal** (60): Fatal error - aplikasi tidak bisa lanjut

---

## 🚀 Production Deployment

### Environment Variables (Production)
```bash
NODE_ENV=production
LOG_LEVEL=info
PORT=3000
DOMAIN=https://file.bytrix.my.id
```

### Recommended Setup:
1. **Use Process Manager**: PM2
   ```bash
   pm2 start src/index.js --name bytrix-api
   ```

2. **Reverse Proxy**: Nginx atau Apache
   ```nginx
   server {
     listen 443 ssl http2;
     server_name file.bytrix.my.id;
     
     location /api {
       proxy_pass http://localhost:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

3. **Monitoring**: Gunakan:
   - PM2 monitoring
   - New Relic
   - DataDog
   - Sentry untuk error tracking

### Docker (Optional)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 3000

CMD ["npm", "start"]
```

---

## 🧪 Testing dengan cURL/Postman

### 1. Health Check
```bash
curl -X GET http://localhost:3000/health
```

### 2. Upload File
```bash
curl -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file.pdf"
```

### 3. Get File
```bash
curl -X GET http://localhost:3000/api/v1/files/{FILE_ID}
```

### 4. Generate Text
```bash
curl -X POST http://localhost:3000/api/v1/gpt/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Jelaskan tentang cloud computing"}'
```

---

## 🔧 Troubleshooting

### S3 Connection Error
**Masalah:** `S3_ERROR: Failed to upload file to S3`

**Solusi:**
- Verifikasi S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY
- Pastikan bucket sudah ada dan accessible
- Check S3 CORS settings

### Supabase Authentication Error
**Masalah:** `AUTHENTICATION_ERROR: Invalid authentication token`

**Solusi:**
- Verifikasi SUPABASE_URL dan SUPABASE_SERVICE_KEY
- Pastikan JWT token masih valid (check expiry)
- Token harus dari Supabase Auth

### GPT API Error
**Masalah:** `GPT_ERROR: Failed to generate completion from GPT API`

**Solusi:**
- Verifikasi GPT_API_KEY dan GPT_API_URL
- Check rate limits
- Pastikan endpoint URL benar dan accessible
- Check network connectivity

### File Upload Limit
**Masalah:** `413 Payload Too Large`

**Solusi:**
- Upload limit diset ke 100MB di multer config
- Untuk mengubah, edit `src/routes/fileRoutes.js` dan ubah `fileSize` limit

---

## 📦 Dependencies

- **express**: Web framework
- **@aws-sdk/client-s3**: AWS S3 client
- **@aws-sdk/s3-request-presigner**: Generate signed URLs
- **@supabase/supabase-js**: Supabase client
- **multer**: File upload middleware
- **pino**: JSON logger
- **pino-pretty**: Pretty print logs (dev)
- **joi**: Data validation
- **axios**: HTTP client untuk GPT API
- **dotenv**: Environment variables

---

## 📄 License

MIT License - Bytrix 2024

---

## 📞 Support

Untuk issues atau pertanyaan, silakan buat issue di repository ini.

---

**Version:** 1.0.0  
**Last Updated:** November 2024  
**Node.js Compatibility:** v18+
