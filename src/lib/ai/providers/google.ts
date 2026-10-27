import 'server-only';
import { ApiError, FinishReason, GoogleGenAI } from '@google/genai';
import { extractJson } from '@diki/core';
import { AiRequestError } from '../guard';
import { PROVIDER_TIMEOUT_MS, type ProviderAdapter } from './types';

const client = (apiKey: string) => new GoogleGenAI({ apiKey, httpOptions: { timeout: PROVIDER_TIMEOUT_MS } });

const REFUSAL_REASONS: (FinishReason | undefined)[] = [
  FinishReason.SAFETY,
  FinishReason.PROHIBITED_CONTENT,
  FinishReason.BLOCKLIST,
  FinishReason.SPII,
  FinishReason.RECITATION,
];

// Gemini 는 잘못된 키에 400 을 돌려주므로 상태 코드만으로 구분하지 않는다
function toAiError(error: unknown): AiRequestError {
  if (error instanceof ApiError) {
    if (error.status === 401 || (error.status === 400 && /api[ _]?key/i.test(error.message))) return new AiRequestError('invalid_key');
    if (error.status === 403) return new AiRequestError('permission');
    if (error.status === 429) return new AiRequestError('provider_rate_limited');
    if (error.status === 408 || error.status === 504) return new AiRequestError('timeout');
  }
  return new AiRequestError('upstream');
}

export const googleAdapter: ProviderAdapter = {
  async listModels(apiKey) {
    try {
      const models = [];
      const pager = await client(apiKey).models.list({ config: { pageSize: 100 } });
      for await (const model of pager) {
        if (model.name) models.push({ id: model.name, actions: model.supportedActions });
      }
      return models;
    } catch (error) {
      throw toAiError(error);
    }
  },

  async generateJson({ apiKey, model, system, user, schema, maxOutputTokens }) {
    let response;
    try {
      response = await client(apiKey).models.generateContent({
        model,
        contents: user,
        config: {
          systemInstruction: system,
          responseMimeType: 'application/json',
          responseJsonSchema: schema,
          maxOutputTokens,
        },
      });
    } catch (error) {
      throw toAiError(error);
    }
    const finish = response.candidates?.[0]?.finishReason;
    if (response.promptFeedback?.blockReason || REFUSAL_REASONS.includes(finish)) throw new AiRequestError('refused');
    if (finish === FinishReason.MAX_TOKENS) throw new AiRequestError('bad_output');
    const usage = response.usageMetadata;
    return {
      data: extractJson(response.text ?? ''),
      usage: {
        inputTokens: usage?.promptTokenCount ?? 0,
        outputTokens: (usage?.candidatesTokenCount ?? 0) + (usage?.thoughtsTokenCount ?? 0),
      },
    };
  },
};
