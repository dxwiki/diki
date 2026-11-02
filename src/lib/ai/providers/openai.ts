import 'server-only';
import OpenAI from 'openai';
import { extractJson } from '@diki/core';
import { AiRequestError } from '../guard';
import { PROVIDER_TIMEOUT_MS, type ProviderAdapter } from './types';

const client = (apiKey: string) => new OpenAI({ apiKey, maxRetries: 1, timeout: PROVIDER_TIMEOUT_MS });

function toAiError(error: unknown): AiRequestError {
  if (error instanceof OpenAI.AuthenticationError) return new AiRequestError('invalid_key');
  if (error instanceof OpenAI.PermissionDeniedError) return new AiRequestError('permission');
  if (error instanceof OpenAI.RateLimitError) return new AiRequestError('provider_rate_limited');
  if (error instanceof OpenAI.APIConnectionTimeoutError) return new AiRequestError('timeout');
  return new AiRequestError('upstream');
}

export const openAiAdapter: ProviderAdapter = {
  async listModels(apiKey) {
    try {
      const models = [];
      for await (const model of client(apiKey).models.list()) models.push({ id: model.id });
      return models;
    } catch (error) {
      throw toAiError(error);
    }
  },

  // store: false 로 OpenAI 쪽 응답 보관을 끈다
  async generateJson({ apiKey, model, system, user, schema, schemaName, maxOutputTokens }) {
    let response: OpenAI.Responses.Response;
    try {
      response = await client(apiKey).responses.create({
        model,
        instructions: system,
        input: user,
        max_output_tokens: maxOutputTokens,
        store: false,
        text: { format: { type: 'json_schema', name: schemaName, schema, strict: true } },
      });
    } catch (error) {
      throw toAiError(error);
    }
    const refused = response.output.some((item) => item.type === 'message' && item.content.some((part) => part.type === 'refusal'));
    if (refused || response.incomplete_details?.reason === 'content_filter') throw new AiRequestError('refused');
    if (response.status === 'incomplete') throw new AiRequestError('bad_output');
    return {
      data: extractJson(response.output_text),
      usage: { inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 },
    };
  },
};
