import logger from '../utils/logger.js';
import { uploadFileService, getFileService } from '../services/fileService.js';
import { NotFoundError } from '../utils/errorHandler.js';

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file provided',
        errorCode: 'NO_FILE',
      });
    }

    const result = await uploadFileService(req.file, req.userId);

    logger.info({ fileId: result.id }, 'File uploaded');

    res.status(200).json({
      status: 'ok',
      message: 'File uploaded successfully',
      data: result,
      url: result.url,
    });
  } catch (error) {
    next(error);
  }
};

export const getFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await getFileService(id);

    if (!result) {
      throw new NotFoundError(`File with ID ${id} not found`);
    }

    logger.info({ fileId: id }, 'File retrieved');

    res.status(200).json({
      status: 'ok',
      message: 'File retrieved successfully',
      data: result,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return next(new NotFoundError(error.message));
    }
    next(error);
  }
};

export const listFiles = async (req, res, next) => {
  try {
    logger.debug({ userId: req.userId }, 'List files endpoint called');

    res.status(200).json({
      status: 'ok',
      message: 'This endpoint is available for future implementation',
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.debug({ fileId: id }, 'Delete file endpoint called');

    res.status(200).json({
      status: 'ok',
      message: 'This endpoint is available for future implementation',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};

export const servePublicFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await getFileService(id);

    if (!result || !result.signed_url) {
      return next(new NotFoundError(`File with ID ${id} not found`));
    }

    // Redirect user to the signed S3 URL (temporary redirect)
    return res.redirect(302, result.signed_url);
  } catch (error) {
    next(error);
  }
};
