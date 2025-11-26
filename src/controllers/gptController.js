import logger from '../utils/logger.js';
import { generateTextService } from '../services/gptService.js';
import { getGPTSystemPrompt, getGPTFunctionDefinitions } from '../utils/gptPrompt.js';

export const generateText = async (req, res, next) => {
  try {
    const { prompt, temperature, max_tokens, model, top_p, frequency_penalty, presence_penalty, include_actions } = req.body;

    logger.debug({ prompt_length: prompt?.length, include_actions }, 'Generate text endpoint called');

    const result = await generateTextService(prompt, {
      temperature,
      max_tokens,
      model,
      top_p,
      frequency_penalty,
      presence_penalty,
      include_actions,
      system_prompt: getGPTSystemPrompt(),
      functions: include_actions ? getGPTFunctionDefinitions() : undefined,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
