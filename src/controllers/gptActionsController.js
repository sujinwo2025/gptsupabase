import logger from '../utils/logger.js';
import { getUploadMetadata } from '../config/supabase.js';
import { NotFoundError } from '../utils/errorHandler.js';
import supabase from '../config/supabase.js';

/**
 * List all files uploaded by the authenticated user
 */
export const listFilesAction = async (req, res, next) => {
  try {
    logger.debug({ userId: req.userId }, 'Listing files');

    const { data, error } = await supabase
      .from('uploads')
      .select('id, filename, mimetype, size, created_at')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json({
      status: 'ok',
      data: data || [],
      count: (data || []).length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get file metadata with signed URL
 */
export const getFileAction = async (req, res, next) => {
  try {
    const { file_id } = req.body;

    if (!file_id) {
      return res.status(400).json({
        status: 'error',
        message: 'file_id is required',
      });
    }

    logger.debug({ fileId: file_id, userId: req.userId }, 'Getting file info');

    const metadata = await getUploadMetadata(file_id);

    if (!metadata) {
      throw new NotFoundError(`File ${file_id} not found`);
    }

    // Verify ownership
    if (metadata.user_id !== req.userId) {
      throw new NotFoundError('File not found or access denied');
    }

    res.status(200).json({
      status: 'ok',
      data: metadata,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete file from S3 and database
 */
export const deleteFileAction = async (req, res, next) => {
  try {
    const { file_id } = req.body;

    if (!file_id) {
      return res.status(400).json({
        status: 'error',
        message: 'file_id is required',
      });
    }

    logger.debug({ fileId: file_id, userId: req.userId }, 'Deleting file');

    const metadata = await getUploadMetadata(file_id);

    if (!metadata) {
      throw new NotFoundError(`File ${file_id} not found`);
    }

    // Verify ownership
    if (metadata.user_id !== req.userId) {
      throw new NotFoundError('File not found or access denied');
    }

    // Delete from database
    const { error } = await supabase
      .from('uploads')
      .delete()
      .eq('id', file_id)
      .eq('user_id', req.userId);

    if (error) {
      throw error;
    }

    // TODO: Delete from S3 bucket using DeleteObjectCommand
    // For now, just delete metadata (S3 cleanup can be deferred or done via cron job)

    logger.info({ fileId: file_id }, 'File deleted successfully');

    res.status(200).json({
      status: 'ok',
      message: 'File deleted successfully',
      data: { id: file_id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed file information
 */
export const fileInfoAction = async (req, res, next) => {
  try {
    const { file_id } = req.body;

    if (!file_id) {
      return res.status(400).json({
        status: 'error',
        message: 'file_id is required',
      });
    }

    logger.debug({ fileId: file_id }, 'Getting file info');

    const metadata = await getUploadMetadata(file_id);

    if (!metadata) {
      throw new NotFoundError(`File ${file_id} not found`);
    }

    // Verify ownership
    if (metadata.user_id !== req.userId) {
      throw new NotFoundError('File not found or access denied');
    }

    const info = {
      id: metadata.id,
      filename: metadata.filename,
      mimetype: metadata.mimetype,
      size: metadata.size,
      size_readable: formatBytes(metadata.size),
      created_at: metadata.created_at,
      s3_key: metadata.s3_key,
      file_type: getFileType(metadata.mimetype),
    };

    res.status(200).json({
      status: 'ok',
      data: info,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Query files by metadata (search, filter)
 */
export const queryFilesAction = async (req, res, next) => {
  try {
    const { filename, mimetype, size_min, size_max, after_date } = req.body;

    logger.debug(
      { userId: req.userId, filters: { filename, mimetype, size_min, size_max, after_date } },
      'Querying files'
    );

    let query = supabase
      .from('uploads')
      .select('id, filename, mimetype, size, created_at')
      .eq('user_id', req.userId);

    // Apply filters
    if (filename) {
      query = query.ilike('filename', `%${filename}%`);
    }

    if (mimetype) {
      query = query.eq('mimetype', mimetype);
    }

    if (size_min !== undefined) {
      query = query.gte('size', size_min);
    }

    if (size_max !== undefined) {
      query = query.lte('size', size_max);
    }

    if (after_date) {
      query = query.gte('created_at', after_date);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    logger.info(
      { userId: req.userId, results_count: (data || []).length },
      'Query completed'
    );

    res.status(200).json({
      status: 'ok',
      data: data || [],
      count: (data || []).length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Format bytes to human-readable format
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Helper: Determine file type from MIME type
 */
function getFileType(mimetype) {
  if (!mimetype) return 'unknown';

  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.startsWith('text/')) return 'text';
  if (mimetype.includes('pdf')) return 'pdf';
  if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
  if (mimetype.includes('sheet') || mimetype.includes('spreadsheet')) return 'spreadsheet';
  if (mimetype.includes('presentation') || mimetype.includes('slide')) return 'presentation';
  if (mimetype.includes('zip') || mimetype.includes('archive')) return 'archive';

  return 'file';
}
