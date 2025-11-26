import logger from '../utils/logger.js';
import { AuthenticationError } from '../utils/errorHandler.js';
import { verifySupabaseUser } from '../config/supabase.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    const user = await verifySupabaseUser(token);

    req.user = user;
    req.userId = user.id;

    logger.debug({ userId: user.id }, 'User authenticated');
    next();
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
      const user = await verifySupabaseUser(token);
      req.user = user;
      req.userId = user.id;
      logger.debug({ userId: user.id }, 'User authenticated (optional)');
    }

    next();
  } catch (error) {
    logger.debug({ error: error.message }, 'Optional authentication skipped');
    next();
  }
};
