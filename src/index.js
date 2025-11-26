import 'dotenv/config';
import express from 'express';
import logger from './utils/logger.js';
import { errorHandler } from './utils/errorHandler.js';
import { requestLogger, corsMiddleware } from './middleware/errorHandler.js';
import indexRoutes from './routes/index.js';
import fileRoutes from './routes/fileRoutes.js';
import gptRoutes from './routes/gptRoutes.js';
import { servePublicFile } from './controllers/fileController.js';
import { initializeS3 } from './config/s3.js';
import { initializeSupabase } from './config/supabase.js';
import { initializeGPT } from './config/gpt.js';
import { config, endpoints } from './config/endpoints.js';

const app = express();

// Initialize external services
try {
  initializeS3();
  initializeSupabase();
  initializeGPT();
  logger.info('All external services initialized successfully');
} catch (error) {
  logger.error({ error: error.message }, 'Failed to initialize external services');
  process.exit(1);
}

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
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    errorCode: 'NOT_FOUND',
    path: req.originalUrl,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(config.port, '0.0.0.0', () => {
  logger.info(
    {
      port: config.port,
      env: config.env,
      domain: config.domain,
      basePath: endpoints.BASE,
    },
    `Server running on port ${config.port}`
  );
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
