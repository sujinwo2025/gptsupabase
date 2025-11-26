import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import logger from '../utils/logger.js';
import { S3Error } from '../utils/errorHandler.js';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
});

export const initializeS3 = () => {
  logger.info('S3 client initialized');
  return s3Client;
};

export const uploadToS3 = async (filename, buffer, mimetype) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET || 'files',
      Key: filename,
      Body: buffer,
      ContentType: mimetype,
      Metadata: {
        'uploaded-at': new Date().toISOString(),
      },
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    logger.info({ filename }, 'File uploaded to S3 successfully');
    return {
      bucket: process.env.S3_BUCKET,
      key: filename,
      size: buffer.length,
    };
  } catch (error) {
    logger.error({ error: error.message, filename }, 'S3 upload failed');
    throw new S3Error('Failed to upload file to S3', error);
  }
};

export const generateSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET || 'files',
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3Client, command, { expiresIn });

    logger.debug({ key, expiresIn }, 'Signed URL generated');
    return url;
  } catch (error) {
    logger.error({ error: error.message, key }, 'Failed to generate signed URL');
    throw new S3Error('Failed to generate signed URL', error);
  }
};

export default s3Client;
