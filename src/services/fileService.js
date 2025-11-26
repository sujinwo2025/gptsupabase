import { uploadToS3, generateSignedUrl } from '../config/s3.js';
import { saveUploadMetadata, getUploadMetadata } from '../config/supabase.js';
import logger from '../utils/logger.js';
import { ValidationError } from '../utils/errorHandler.js';
import { randomUUID } from 'crypto';

export const uploadFileService = async (file, userId) => {
  try {
    if (!file || !file.buffer) {
      throw new ValidationError('File is required', { file: 'No file provided' });
    }

    const fileId = randomUUID();
    const fileExtension = file.originalname.split('.').pop() || 'bin';
    const s3Key = `uploads/${userId}/${fileId}.${fileExtension}`;

    logger.debug({ fileId, s3Key, size: file.size }, 'Starting file upload');

    const s3Result = await uploadToS3(s3Key, file.buffer, file.mimetype);

    const metadata = await saveUploadMetadata({
      filename: file.originalname,
      s3_key: s3Result.key,
      mimetype: file.mimetype,
      size: file.size,
      user_id: userId,
    });

    logger.info({ uploadId: metadata.id }, 'File uploaded successfully');

    return {
      id: metadata.id,
      filename: metadata.filename,
      size: metadata.size,
      mimetype: metadata.mimetype,
      url: `${process.env.DOMAIN}/api/v1/file/${metadata.id}`,
    };
  } catch (error) {
    logger.error({ error: error.message }, 'File upload service error');
    throw error;
  }
};

export const getFileService = async (fileId) => {
  try {
    logger.debug({ fileId }, 'Fetching file metadata and generating signed URL');

    const metadata = await getUploadMetadata(fileId);

    if (!metadata) {
      throw new Error(`File with ID ${fileId} not found`);
    }

    const signedUrl = await generateSignedUrl(metadata.s3_key, 3600);

    logger.info({ fileId }, 'File metadata retrieved successfully');

    return {
      id: metadata.id,
      filename: metadata.filename,
      mimetype: metadata.mimetype,
      size: metadata.size,
      created_at: metadata.created_at,
      s3_key: metadata.s3_key,
      signed_url: signedUrl,
      expires_in: 3600,
    };
  } catch (error) {
    logger.error({ error: error.message, fileId }, 'File retrieval service error');
    throw error;
  }
};
