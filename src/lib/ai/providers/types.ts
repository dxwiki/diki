import type { RawModel } from './catalog';

export interface GenerateJsonParams {
  apiKey: string;
  model: string;
  system: string;
  user: string;
  schema: Record<string, unknown>;
  schemaName: string;
  maxOutputTokens: number;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface GenerateJsonResult {
  data: unknown;
  usage: TokenUsage;
}

export interface ProviderAdapter {
  listModels(apiKey: string): Promise<RawModel[]>;
  generateJson(params: GenerateJsonParams): Promise<GenerateJsonResult>;
}

export const PROVIDER_TIMEOUT_MS = 50_000;
