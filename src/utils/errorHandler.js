import logger from './logger.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class S3Error extends AppError {
  constructor(message, originalError = null) {
    super(message, 500, 'S3_ERROR');
    this.originalError = originalError;
  }
}

export class GPTError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500, 'GPT_ERROR');
    this.originalError = originalError;
  }
}

export class SupabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500, 'SUPABASE_ERROR');
    this.originalError = originalError;
  }
}

export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    logger.error(
      {
        errorCode: err.errorCode,
        statusCode: err.statusCode,
        timestamp: err.timestamp,
        path: req.path,
        method: req.method,
        originalError: err.originalError?.message,
      },
      err.message
    );

    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errorCode: err.errorCode,
      timestamp: err.timestamp,
      ...(err.details && { details: err.details }),
    });
  }

  logger.error(
    {
      errorCode: 'UNKNOWN_ERROR',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      error: err.message,
    },
    'Unexpected error'
  );

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    errorCode: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  });
};
