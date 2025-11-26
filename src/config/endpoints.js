/**
 * Centralized Endpoint Configuration
 * All endpoint paths are defined here and loaded from environment variables
 * This makes it easy to customize all endpoints from .env file
 */

export const endpoints = {
  // Base paths
  BASE: process.env.API_BASE_PATH || '/api/v1',
  
  // File Management Endpoints
  FILES: {
    BASE: process.env.FILE_ENDPOINT_BASE || '/api/v1/files',
    UPLOAD: `${process.env.FILE_ENDPOINT_BASE || '/api/v1/files'}/upload`,
    GET: `${process.env.FILE_ENDPOINT_BASE || '/api/v1/files'}/:id`,
    LIST: `${process.env.FILE_ENDPOINT_BASE || '/api/v1/files'}`,
    DELETE: `${process.env.FILE_ENDPOINT_BASE || '/api/v1/files'}/:id`,
    DOWNLOAD: '/file/:id', // Public endpoint for direct download
  },

  // GPT Endpoints
  GPT: {
    BASE: process.env.GPT_ENDPOINT_BASE || '/api/v1/gpt',
    GENERATE: `${process.env.GPT_ENDPOINT_BASE || '/api/v1/gpt'}/generate`,
  },

  // GPT CRUD Actions Endpoints
  GPT_ACTIONS: {
    BASE: process.env.GPT_ACTIONS_BASE || '/api/v1/gpt/actions',
    
    FILES: {
      BASE: `${process.env.GPT_ACTIONS_BASE || '/api/v1/gpt/actions'}/files`,
      LIST: `${process.env.GPT_ACTIONS_BASE || '/api/v1/gpt/actions'}/files/list`,
      GET: `${process.env.GPT_ACTIONS_BASE || '/api/v1/gpt/actions'}/files/get`,
      INFO: `${process.env.GPT_ACTIONS_BASE || '/api/v1/gpt/actions'}/files/info`,
      DELETE: `${process.env.GPT_ACTIONS_BASE || '/api/v1/gpt/actions'}/files/delete`,
    },
    
    QUERY: `${process.env.GPT_ACTIONS_BASE || '/api/v1/gpt/actions'}/query`,
  },

  // Root Endpoints
  HEALTH: '/health',
  INFO: `${process.env.API_BASE_PATH || '/api/v1'}`,
};

/**
 * Configuration Settings (loaded from .env)
 */
export const config = {
  // Server
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  domain: process.env.DOMAIN || 'http://localhost:3000',

  // S3
  s3: {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'us-east-1',
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucket: process.env.S3_BUCKET || 'files',
    urlExpiry: parseInt(process.env.S3_URL_EXPIRY || '3600'),
  },

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_KEY,
    tableUploads: process.env.SUPABASE_TABLE_UPLOADS || 'uploads',
  },

  // GPT
  gpt: {
    apiKey: process.env.GPT_API_KEY,
    apiUrl: process.env.GPT_API_URL || 'https://api.openai.com/v1',
    model: process.env.GPT_MODEL || 'gpt-3.5-turbo',
    temperature: parseFloat(process.env.GPT_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.GPT_MAX_TOKENS || '2000'),
  },

  // Security & Expiry
  jwt: {
    expiry: parseInt(process.env.JWT_EXPIRY || '3600'),
  },
  signedUrl: {
    expiry: parseInt(process.env.SIGNED_URL_EXPIRY || '3600'),
  },
  uploads: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB
  },
};

export default { endpoints, config };
