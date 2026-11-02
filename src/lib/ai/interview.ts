import 'server-only';
import { buildInterview, interviewRoles, type InterviewContent, type InterviewPromptInput, type RoleId } from '@diki/core';
import { getTerm } from '@/content/terms';
import { AiRequestError } from './guard';
import { PROVIDER_ADAPTERS } from './providers';
import type { ProviderAdapter } from './providers/types';
import type { KeyState, StoredProviderKey } from './keyStore';

const RELEVANCE_KEY: Record<RoleId, 'scientist' | 'engineer' | 'analyst'> = { ds: 'scientist', de: 'engineer', da: 'analyst' };

// 코스에 실제로 있는 Step 만 허용하고, 질문·평가 항목은 서버가 콘텐츠에서 만든다
export function loadInterviewStep(body: Record<string, unknown>): { input: InterviewPromptInput; content: InterviewContent } {
  const { role: roleId, phaseId, stepId } = body;
  const role = interviewRoles.find((r) => r.id === roleId);
  const phase = role?.phases.find((p) => p.id === phaseId);
  if (!role || !phase || typeof stepId !== 'string' || !phase.steps.includes(stepId)) throw new AiRequestError('bad_request');
  const term = getTerm(stepId);
  if (!term) throw new AiRequestError('bad_request');
  const content = buildInterview(term, role.id);
  return {
    content,
    input: { role, term, content, relevance: term.relevance?.[RELEVANCE_KEY[role.id]]?.description ?? '' },
  };
}

export function activeProvider(state: KeyState): { adapter: ProviderAdapter; stored: StoredProviderKey; provider: NonNullable<KeyState['active']> } {
  const provider = state.active;
  const stored = provider ? state.keys[provider] : undefined;
  if (!provider || !stored) throw new AiRequestError('no_key');
  return { adapter: PROVIDER_ADAPTERS[provider], stored, provider };
}
