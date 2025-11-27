import logger from '../utils/logger.js';
import { AuthenticationError } from '../utils/errorHandler.js';
import { verifySupabaseUser } from '../config/supabase.js';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    // Allow three authentication methods:
    // 1) Supabase user JWT (validate via Supabase)
    // 2) Service Role Key provided as Bearer token (treat as admin/service)
    // 3) Dev/Local JWT signed by our JWT_SECRET (validate locally)

    // 2) Service role key (server-to-server master key)
    if (process.env.SUPABASE_SERVICE_KEY && token === process.env.SUPABASE_SERVICE_KEY) {
      req.user = { id: 'service-role', role: 'service', service: true };
      req.userId = req.user.id;
      logger.debug({ userId: req.user.id }, 'Service role authenticated');
      return next();
    }

    // 1) Try verify via Supabase (user JWT)
    try {
      const user = await verifySupabaseUser(token);
      req.user = user;
      req.userId = user.id;
      logger.debug({ userId: user.id }, 'User authenticated via Supabase');
      return next();
    } catch (err) {
      logger.debug({ err: err.message }, 'Supabase verification failed, trying local JWT');
    }

    // 3) Try local JWT verify (development tokens)
    if (process.env.JWT_SECRET) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // normalize payload to user-like object
        req.user = payload.user || payload;
        req.userId = req.user.id || req.user.user_id || req.user.sub || 'dev-user';
        logger.debug({ userId: req.userId }, 'User authenticated via local JWT');
        return next();
      } catch (err) {
        logger.debug({ err: err.message }, 'Local JWT verification failed');
      }
    }

    throw new AuthenticationError('Invalid authentication token');
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return next(error);
    }

    logger.warn({ error: error.message }, 'Authentication failed');
    next(new AuthenticationError('Invalid authentication token'));
  }
};

export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // Accept service key
      if (process.env.SUPABASE_SERVICE_KEY && token === process.env.SUPABASE_SERVICE_KEY) {
        req.user = { id: 'service-role', role: 'service', service: true };
        req.userId = req.user.id;
        logger.debug({ userId: req.user.id }, 'Service role authenticated (optional)');
        return next();
      }

      try {
        const user = await verifySupabaseUser(token);
        req.user = user;
        req.userId = user.id;
        logger.debug({ userId: user.id }, 'User authenticated (optional)');
        return next();
      } catch (err) {
        logger.debug({ err: err.message }, 'Supabase optional verify failed, trying local JWT');
      }

      if (process.env.JWT_SECRET) {
        try {
          const payload = jwt.verify(token, process.env.JWT_SECRET);
          req.user = payload.user || payload;
          req.userId = req.user.id || req.user.user_id || req.user.sub || 'dev-user';
          logger.debug({ userId: req.userId }, 'User authenticated via local JWT (optional)');
          return next();
        } catch (err) {
          logger.debug({ err: err.message }, 'Local JWT optional verify failed');
        }
      }
    }

    next();
  } catch (error) {
    logger.debug({ error: error.message }, 'Optional authentication skipped');
    next();
  }
};
