import Joi from 'joi';

export const uploadFileSchema = Joi.object({
  originalname: Joi.string().required(),
  mimetype: Joi.string().required(),
  size: Joi.number().required().max(100 * 1024 * 1024), // max 100MB
  buffer: Joi.binary().required(),
});

export const generateTextSchema = Joi.object({
  prompt: Joi.string().required().min(1).max(4000),
  temperature: Joi.number().optional().min(0).max(2),
  max_tokens: Joi.number().optional().min(1).max(4096),
  model: Joi.string().optional().default('gpt-3.5-turbo'),
});

export const getFileSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body || req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: messages,
      });
    }

    req.validatedData = value;
    next();
  };
};
