import express from 'express';
import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';

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

// Development helper: generate a short-lived dev JWT token
// Note: This endpoint should be disabled or protected in production environments
router.post('/auth/dev-token', (req, res) => {
  if (process.env.NODE_ENV === 'production' && process.env.DISABLE_DEV_TOKEN !== 'false') {
    return res.status(403).json({ status: 'error', message: 'Dev token disabled in production' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key';
  const expirySeconds = parseInt(process.env.JWT_EXPIRY || '604800', 10); // default 7 days

  const payload = {
    user_id: req.body.user_id || 'dev-user',
    role: req.body.role || 'authenticated',
  };

  const token = jwt.sign(payload, jwtSecret, { expiresIn: expirySeconds });

  res.json({ status: 'ok', token, expires_in: expirySeconds });
});

export default router;
