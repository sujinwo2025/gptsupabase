import { generateCompletion } from '../config/gpt.js';
import logger from '../utils/logger.js';
import { ValidationError } from '../utils/errorHandler.js';

export const generateTextService = async (prompt, options = {}) => {
  try {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new ValidationError('Invalid prompt', { prompt: 'Prompt is required and must be a non-empty string' });
    }

    logger.debug({ prompt_length: prompt.length, include_actions: options.include_actions }, 'Generating text with GPT');

    const completionOptions = {
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2000,
      model: options.model || 'gpt-3.5-turbo',
      top_p: options.top_p || 1,
      frequency_penalty: options.frequency_penalty || 0,
      presence_penalty: options.presence_penalty || 0,
      system_prompt: options.system_prompt,
      functions: options.functions,
    };

    const response = await generateCompletion(prompt, completionOptions);

    logger.info(
      {
        model: response.model,
        tokens_used: response.usage?.total_tokens,
        include_actions: options.include_actions,
      },
      'Text generated successfully'
    );

    return {
      status: 'ok',
      data: {
        id: response.id,
        model: response.model,
        created: response.created,
        message: response.choices?.[0]?.message?.content || '',
        usage: response.usage,
        finish_reason: response.choices?.[0]?.finish_reason || 'stop',
        function_call: response.choices?.[0]?.message?.function_call || null,
      },
    };
  } catch (error) {
    logger.error({ error: error.message }, 'Text generation service error');
    throw error;
  }
};
