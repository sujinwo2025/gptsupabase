import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';
import { SupabaseError } from '../utils/errorHandler.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const initializeSupabase = () => {
  logger.info('Supabase client initialized');
  return supabase;
};

export const saveUploadMetadata = async (fileData) => {
  try {
    const { data, error } = await supabase
      .from('uploads')
      .insert([
        {
          filename: fileData.filename,
          s3_key: fileData.s3_key,
          mimetype: fileData.mimetype,
          size: fileData.size,
          user_id: fileData.user_id,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info({ id: data.id }, 'Upload metadata saved');
    return data;
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to save upload metadata');
    throw new SupabaseError('Failed to save file metadata', error);
  }
};

export const getUploadMetadata = async (id) => {
  try {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    logger.debug({ id }, 'Upload metadata retrieved');
    return data;
  } catch (error) {
    logger.error({ error: error.message, id }, 'Failed to retrieve upload metadata');
    throw new SupabaseError('Failed to retrieve file metadata', error);
  }
};

export const verifySupabaseUser = async (token) => {
  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      throw error || new Error('Invalid token');
    }

    return data.user;
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to verify Supabase user');
    throw new SupabaseError('Failed to verify user', error);
  }
};

export default supabase;
