import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { extractJson } from '@diki/core';
import { AiRequestError } from '../guard';
import { PROVIDER_TIMEOUT_MS, type ProviderAdapter } from './types';

const client = (apiKey: string) => new Anthropic({ apiKey, maxRetries: 1, timeout: PROVIDER_TIMEOUT_MS });

function toAiError(error: unknown): AiRequestError {
  if (error instanceof Anthropic.AuthenticationError) return new AiRequestError('invalid_key');
  if (error instanceof Anthropic.PermissionDeniedError) return new AiRequestError('permission');
  if (error instanceof Anthropic.RateLimitError) return new AiRequestError('provider_rate_limited');
  if (error instanceof Anthropic.APIConnectionTimeoutError) return new AiRequestError('timeout');
  return new AiRequestError('upstream');
}

export const anthropicAdapter: ProviderAdapter = {
  async listModels(apiKey) {
    try {
      const models = [];
      for await (const model of client(apiKey).models.list({ limit: 100 })) models.push({ id: model.id });
      return models;
    } catch (error) {
      throw toAiError(error);
    }
  },

  async generateJson({ apiKey, model, system, user, schema, maxOutputTokens }) {
    let response: Anthropic.Message;
    try {
      response = await client(apiKey).messages.create({
        model,
        max_tokens: maxOutputTokens,
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: user }],
        output_config: { format: { type: 'json_schema', schema } },
      });
    } catch (error) {
      throw toAiError(error);
    }
    if (response.stop_reason === 'refusal') throw new AiRequestError('refused');
    if (response.stop_reason === 'max_tokens') throw new AiRequestError('bad_output');
    const text = response.content.map((block) => (block.type === 'text' ? block.text : '')).join('');
    const usage = response.usage;
    return {
      data: extractJson(text),
      usage: {
        inputTokens: usage.input_tokens + (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0),
        outputTokens: usage.output_tokens,
      },
    };
  },
};
