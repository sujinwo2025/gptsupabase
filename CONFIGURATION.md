# Bytrix API - Endpoint Configuration Guide

## Quick Overview

All Bytrix API endpoints are now **completely configurable via environment variables**. No need to edit code to change API paths!

**Key benefit:** Change ANY endpoint path by just editing `.env` file → restart server ✨

---

## How It Works

### 1. Configuration Manager (`src/config/endpoints.js`)

This file does two things:

1. **Loads from environment variables** with fallback defaults
2. **Exports two objects:**
   - `endpoints` - All API route paths
   - `config` - All configuration settings

### 2. Server loads configuration (`src/index.js`)

```javascript
import { config, endpoints } from './config/endpoints.js';

// Server uses centralized config
app.listen(config.port, '0.0.0.0', () => {
  logger.info({ port: config.port, basePath: endpoints.BASE });
});

// Routes use centralized endpoints
app.use(endpoints.BASE, indexRoutes);
app.use(endpoints.FILES.BASE, fileRoutes);
app.use(endpoints.GPT.BASE, gptRoutes);
```

### 3. You customize via `.env` file

```bash
# Change the base API path
API_BASE_PATH=/api/v2

# Now ALL endpoints use /api/v2 base instead of /api/v1
```

---

## Available Configuration Variables

### Server Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment (development, production, staging) |
| `LOG_LEVEL` | info | Logging level (debug, info, warn, error) |
| `DOMAIN` | http://localhost:3000 | Your domain/base URL |

### S3 / File Storage

| Variable | Default | Purpose |
|----------|---------|---------|
| `S3_ENDPOINT` | - | S3 endpoint URL |
| `S3_REGION` | us-east-1 | AWS region |
| `S3_ACCESS_KEY` | - | S3 access key |
| `S3_SECRET_KEY` | - | S3 secret key |
| `S3_BUCKET` | files | Bucket name |
| `S3_URL_EXPIRY` | 3600 | Signed URL expiry (seconds) |

### Supabase / Database

| Variable | Default | Purpose |
|----------|---------|---------|
| `SUPABASE_URL` | - | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | - | Supabase service key |
| `SUPABASE_TABLE_UPLOADS` | uploads | Table name for files |

### GPT API

| Variable | Default | Purpose |
|----------|---------|---------|
| `GPT_API_KEY` | - | GPT API key |
| `GPT_API_URL` | - | GPT API endpoint |
| `GPT_MODEL` | gpt-3.5-turbo | Model name |
| `GPT_TEMPERATURE` | 0.7 | Response randomness (0.0-1.0) |
| `GPT_MAX_TOKENS` | 2000 | Max response length |

### Endpoint Paths (Optional)

These control endpoint paths. Only change if you want custom URLs!

| Variable | Default | Affects |
|----------|---------|---------|
| `API_BASE_PATH` | /api/v1 | All API endpoints |
| `FILE_ENDPOINT_BASE` | /api/v1/files | File operations |
| `GPT_ENDPOINT_BASE` | /api/v1/gpt | GPT text generation |
| `GPT_ACTIONS_BASE` | /api/v1/gpt/actions | GPT CRUD operations |

### Security & Expiry

| Variable | Default | Purpose |
|----------|---------|---------|
| `JWT_EXPIRY` | 3600 | JWT token lifetime (seconds) |
| `SIGNED_URL_EXPIRY` | 3600 | File download URL lifetime |
| `MAX_FILE_SIZE` | 104857600 | Max upload size (bytes = 100MB) |

---

## Usage Examples

### Example 1: Change Base API Path

**Current state:**
```
POST /api/v1/files/upload
GET  /api/v1/files
POST /api/v1/gpt/generate
```

**Edit .env:**
```bash
API_BASE_PATH=/api/v2
FILE_ENDPOINT_BASE=/api/v2/files
GPT_ENDPOINT_BASE=/api/v2/gpt
GPT_ACTIONS_BASE=/api/v2/gpt/actions
```

**After restart:**
```
POST /api/v2/files/upload
GET  /api/v2/files
POST /api/v2/gpt/generate
```

### Example 2: Customize File Endpoint

**Edit .env:**
```bash
FILE_ENDPOINT_BASE=/api/v1/storage
```

**File endpoints become:**
```
POST /api/v1/storage/upload       ← Upload
GET  /api/v1/storage              ← List
GET  /api/v1/storage/:id          ← Get details
DELETE /api/v1/storage/:id        ← Delete
```

### Example 3: Change GPT Endpoint

**Edit .env:**
```bash
GPT_ENDPOINT_BASE=/api/v1/ai
```

**GPT endpoints become:**
```
POST /api/v1/ai/generate          ← GPT text generation
```

### Example 4: Staging vs Production

**Staging (.env):**
```bash
NODE_ENV=staging
PORT=3001
LOG_LEVEL=debug
DOMAIN=https://staging-api.bytrix.my.id
```

**Production (.env):**
```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=warn
DOMAIN=https://api.bytrix.my.id
```

---

## All Endpoints at a Glance

### Health & Info
```
GET  /health                                      # Check if server is running
GET  /api/v1                                      # API info
```

### File Management
```
POST /api/v1/files/upload                         # Upload file
GET  /api/v1/files                                # List all files
GET  /api/v1/files/:id                            # Get file details
DELETE /api/v1/files/:id                          # Delete file
GET  /file/:id                                    # Public download (no auth needed)
```

### GPT Text Generation
```
POST /api/v1/gpt/generate                         # Generate text with GPT
```

### GPT CRUD Actions (for custom GPT)
```
GET  /api/v1/gpt/actions/files/list               # List files (for GPT)
GET  /api/v1/gpt/actions/files/get                # Get file (for GPT)
GET  /api/v1/gpt/actions/files/info               # Get file info (for GPT)
DELETE /api/v1/gpt/actions/files/delete           # Delete file (for GPT)
POST /api/v1/gpt/actions/query                    # Query files (for GPT)
```

---

## Testing Configuration

Run the configuration test to verify everything is loaded correctly:

```bash
node test-config.js
```

Output shows:
- ✅ All environment variables loaded
- ✅ Endpoint paths configured
- ✅ Configuration validation

---

## Technical Details

### How Defaults Work

If an environment variable is not set, system uses defaults from `src/config/endpoints.js`:

```javascript
// Example from endpoints.js
BASE: process.env.API_BASE_PATH || '/api/v1',
```

If `API_BASE_PATH` is not in `.env`, it defaults to `/api/v1`.

### Type Conversion

Numeric values are automatically parsed:

```javascript
// In config object
port: parseInt(process.env.PORT) || 3000,
temperature: parseFloat(process.env.GPT_TEMPERATURE) || 0.7,
maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600,
```

### Environment Loading

`.env` file is automatically loaded when server starts:

```javascript
// In src/index.js (first import)
import 'dotenv/config.js';
```

---

## Production Deployment

### Docker Example

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci --only=production

# Pass environment variables at runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=warn

EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose Example

```yaml
version: '3'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      LOG_LEVEL: warn
      API_BASE_PATH: /api/v2
      S3_ENDPOINT: $S3_ENDPOINT
      SUPABASE_URL: $SUPABASE_URL
      GPT_API_KEY: $GPT_API_KEY
```

### Multiple Environments

Create separate `.env` files:

```bash
.env              # Development
.env.staging      # Staging
.env.production   # Production
```

Load specific file:

```bash
# Start with staging config
cp .env.staging .env
npm start

# Or via environment variable
NODE_ENV=production npm start
```

---

## Troubleshooting

### Endpoints Still Using Old Paths?

1. Verify `.env` file exists in project root
2. Check variable names are exact (case-sensitive):
   ```bash
   ❌ api_base_path=...    # Wrong (lowercase)
   ✅ API_BASE_PATH=...    # Correct (uppercase)
   ```
3. Restart server after changing `.env`
4. Run configuration test: `node test-config.js`

### Configuration Test Shows Errors?

Check for missing environment variables in `.env`:

```bash
# See what's missing
node test-config.js

# Add missing variables to .env
# Example:
S3_ENDPOINT=https://s3.amazonaws.com
GPT_API_KEY=your_key_here
```

### Want to Reset to Defaults?

Just remove the environment variable from `.env`:

```bash
# Remove this line to use default
# API_BASE_PATH=/api/v2

# Restart → will use default /api/v1
npm start
```

---

## Summary

✅ **All endpoints are configurable via .env**  
✅ **No code changes needed**  
✅ **Easy to switch between environments**  
✅ **Sensible defaults provided**  
✅ **Configuration test included**  

**Change endpoints → Edit .env → Restart server** 🎉

---

For more details, see:
- `README.md` - Main documentation
- `.env.example` - All available variables
- `src/config/endpoints.js` - Configuration source code
- Run `node test-config.js` - Test your configuration
