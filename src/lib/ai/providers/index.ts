import 'server-only';
import type { AiProviderId } from '@diki/core';
import { anthropicAdapter } from './anthropic';
import { googleAdapter } from './google';
import { openAiAdapter } from './openai';
import type { ProviderAdapter } from './types';

export const PROVIDER_ADAPTERS: Record<AiProviderId, ProviderAdapter> = {
  anthropic: anthropicAdapter,
  openai: openAiAdapter,
  google: googleAdapter,
};
