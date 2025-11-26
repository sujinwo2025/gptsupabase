import 'dotenv/config';
import express from 'express';
import logger from '../src/utils/logger.js';
import { errorHandler } from '../src/utils/errorHandler.js';
import { requestLogger, corsMiddleware } from '../src/middleware/errorHandler.js';
import indexRoutes from '../src/routes/index.js';
import fileRoutes from '../src/routes/fileRoutes.js';
import gptRoutes from '../src/routes/gptRoutes.js';
import { servePublicFile } from '../src/controllers/fileController.js';
import { initializeS3 } from '../src/config/s3.js';
import { initializeSupabase } from '../src/config/supabase.js';
import { initializeGPT } from '../src/config/gpt.js';
import { config, endpoints } from '../src/config/endpoints.js';

// Create Express app
const app = express();

// Initialize external services on first request
let servicesInitialized = false;
app.use((req, res, next) => {
  if (!servicesInitialized) {
    try {
      initializeS3();
      initializeSupabase();
      initializeGPT();
      logger.info('All external services initialized successfully');
      servicesInitialized = true;
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to initialize external services');
      return res.status(500).json({ error: 'Service initialization failed' });
    }
  }
  next();
});

// Middleware - Request parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware - CORS
app.use(corsMiddleware);

// Middleware - Request logging
app.use(requestLogger);

// Routes
app.use(endpoints.BASE, indexRoutes);
app.use(endpoints.FILES.BASE, fileRoutes);
app.use(endpoints.GPT.BASE, gptRoutes);

// Public file access (vanity URL)
app.get(endpoints.FILES.DOWNLOAD, servePublicFile);

// Health check endpoint
app.get(endpoints.HEALTH, (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Service is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use(errorHandler);

// Export as Vercel handler
export default app;
