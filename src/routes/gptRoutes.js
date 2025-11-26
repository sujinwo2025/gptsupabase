import express from 'express';
import { generateText } from '../controllers/gptController.js';
import {
  listFilesAction,
  getFileAction,
  deleteFileAction,
  fileInfoAction,
  queryFilesAction,
} from '../controllers/gptActionsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../utils/validators.js';
import Joi from 'joi';

const router = express.Router();

const generateSchema = Joi.object({
  prompt: Joi.string().required().min(1).max(4000),
  temperature: Joi.number().optional().min(0).max(2),
  max_tokens: Joi.number().optional().min(1).max(4096),
  model: Joi.string().optional().default('gpt-3.5-turbo'),
  top_p: Joi.number().optional().min(0).max(1),
  frequency_penalty: Joi.number().optional().min(-2).max(2),
  presence_penalty: Joi.number().optional().min(-2).max(2),
});

const fileIdSchema = Joi.object({
  file_id: Joi.string().uuid().required(),
});

const querySchema = Joi.object({
  filename: Joi.string().optional(),
  mimetype: Joi.string().optional(),
  size_min: Joi.number().optional().min(0),
  size_max: Joi.number().optional().min(0),
  after_date: Joi.string().optional().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Main generation endpoint
router.post('/generate', authMiddleware, validateRequest(generateSchema), generateText);

// CRUD Actions endpoints
router.get('/actions/files/list', authMiddleware, listFilesAction);
router.post('/actions/files/get', authMiddleware, validateRequest(fileIdSchema), getFileAction);
router.post('/actions/files/delete', authMiddleware, validateRequest(fileIdSchema), deleteFileAction);
router.post('/actions/files/info', authMiddleware, validateRequest(fileIdSchema), fileInfoAction);
router.post('/actions/query', authMiddleware, validateRequest(querySchema), queryFilesAction);

export default router;

