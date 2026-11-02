import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLAUDE_DEFAULT_MODEL, isModelId, selectModels } from '../providers/catalog';

test('Claude: claude- 모델만, 기본 모델을 맨 앞에', () => {
  const ids = selectModels('anthropic', [{ id: 'claude-sonnet-5-5' }, { id: CLAUDE_DEFAULT_MODEL }, { id: 'other' }]);
  assert.deepEqual(ids, [CLAUDE_DEFAULT_MODEL, 'claude-sonnet-5-5']);
});

test('OpenAI: 대화용 모델만 남기고 높은 버전·기본형을 앞에', () => {
  const ids = selectModels('openai', [
    { id: 'gpt-4.1-mini' },
    { id: 'gpt-5' },
    { id: 'gpt-5-mini' },
    { id: 'gpt-4o-audio-preview' },
    { id: 'text-embedding-3-large' },
    { id: 'gpt-5-2025-08-07' },
    { id: 'o3' },
    { id: 'dall-e-3' },
    { id: 'gpt-4.1' },
  ]);
  assert.deepEqual(ids, ['gpt-5', 'gpt-5-mini', 'gpt-4.1', 'gpt-4.1-mini', 'o3']);
});

test('Gemini: generateContent 지원 모델만, 안정판·높은 버전·pro 를 앞에', () => {
  const ids = selectModels('google', [
    { id: 'models/gemini-2.0-flash', actions: ['generateContent'] },
    { id: 'models/gemini-2.5-pro', actions: ['generateContent'] },
    { id: 'models/gemini-3.0-pro-preview', actions: ['generateContent'] },
    { id: 'models/text-embedding-004', actions: ['embedContent'] },
    { id: 'models/gemini-2.5-flash', actions: ['generateContent'] },
    { id: 'models/gemini-2.5-flash-image', actions: ['generateContent'] },
  ]);
  assert.deepEqual(ids, ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.0-pro-preview']);
});

test('모델 ID 형식 검사', () => {
  assert.ok(isModelId('gpt-5'));
  assert.ok(isModelId('models/gemini-2.5-pro'));
  assert.equal(isModelId('a b'), false);
  assert.equal(isModelId(''), false);
  assert.equal(isModelId('x'.repeat(101)), false);
});
