import axios from 'axios';
import logger from '../utils/logger.js';
import { GPTError } from '../utils/errorHandler.js';

const gptClient = axios.create({
  baseURL: process.env.GPT_API_URL || 'https://api.openai.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.GPT_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

export const initializeGPT = () => {
  logger.info({ endpoint: process.env.GPT_API_URL }, 'GPT client initialized');
  return gptClient;
};

export const generateCompletion = async (prompt, options = {}) => {
  try {
    const {
      temperature = 0.7,
      max_tokens = 2000,
      model = 'gpt-3.5-turbo',
      top_p = 1,
      frequency_penalty = 0,
      presence_penalty = 0,
      system_prompt = null,
      functions = null,
    } = options;

    // Build messages array
    const messages = [];

    // Add system message if provided
    if (system_prompt) {
      messages.push({
        role: 'system',
        content: system_prompt,
      });
    }

    // Add user message
    messages.push({
      role: 'user',
      content: prompt,
    });

    const payload = {
      model,
      messages,
      temperature,
      max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty,
    };

    // Add functions if provided
    if (functions && functions.length > 0) {
      payload.functions = functions;
      payload.function_call = 'auto'; // Let GPT decide whether to call functions
    }

    logger.debug(
      { model, prompt_length: prompt.length, has_system_prompt: !!system_prompt, has_functions: !!functions },
      'Sending request to GPT API'
    );

    const response = await gptClient.post('/chat/completions', payload);

    logger.info(
      {
        model,
        tokens_used: response.data.usage?.total_tokens,
        has_function_call: !!response.data.choices?.[0]?.message?.function_call,
      },
      'GPT completion generated successfully'
    );

    return {
      id: response.data.id,
      object: response.data.object,
      created: response.data.created,
      model: response.data.model,
      choices: response.data.choices,
      usage: response.data.usage,
    };
  } catch (error) {
    logger.error(
      {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      },
      'GPT API request failed'
    );
    throw new GPTError('Failed to generate completion from GPT API', error);
  }
};

export default gptClient;
