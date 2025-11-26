import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Service is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

router.get('/', (req, res) => {
  res.status(200).json({
    name: 'Bytrix API',
    version: '1.0.0',
    description: 'Production-ready backend service for file management with GPT integration',
    endpoints: {
      files: '/api/v1/files',
      gpt: '/api/v1/gpt',
    },
  });
});

export default router;
