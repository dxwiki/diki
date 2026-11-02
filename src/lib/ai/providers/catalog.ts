import type { AiProviderId } from '@diki/core';

export const CLAUDE_DEFAULT_MODEL = 'claude-opus-5-5';
const MAX_MODELS = 40;

// 버전 숫자를 비교 가능한 배열로 바꾼다 (예: '2.5' → [2, 5])
const versionOf = (text: string | undefined) => (text ?? '').split('.').map((n) => Number(n) || 0);
const compareVersion = (a: number[], b: number[]) => {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (b[i] ?? 0) - (a[i] ?? 0);
    if (diff) return diff;
  }
  return 0;
};

const OPENAI_EXCLUDE = /(audio|realtime|tts|transcribe|search|image|embedding|moderation|instruct|dall-e|whisper|computer-use|codex|deep-research|oss)/i;
const DATED = /-\d{4}-\d{2}-\d{2}$|-\d{4}$/;

function rankOpenAi(id: string): [number, number[], number] {
  const gpt = id.match(/^gpt-(\d+(?:\.\d+)?)(.*)$/);
  if (gpt) return [0, versionOf(gpt[1]), gpt[2] === '' ? 0 : gpt[2] === '-mini' ? 1 : 2];
  const o = id.match(/^o(\d+)(.*)$/);
  if (o) return [1, versionOf(o[1]), o[2] === '' ? 0 : 1];
  return [2, [0], 9];
}

function rankGemini(id: string): [number, number[], number] {
  const m = id.match(/^gemini-(\d+(?:\.\d+)?)-(pro|flash-lite|flash)(.*)$/);
  if (!m) return [9, [0], 9];
  const tier = m[2] === 'pro' ? 0 : m[2] === 'flash' ? 1 : 2;
  const stable = m[3] === '' || m[3] === '-latest' ? 0 : /preview|exp/.test(m[3]) ? 2 : 1;
  return [stable, versionOf(m[1]), tier];
}

const byRank = (rank: (id: string)=> [number, number[], number]) => (a: string, b: string) => {
  const [ga, va, ta] = rank(a);
  const [gb, vb, tb] = rank(b);
  return ga - gb || compareVersion(va, vb) || ta - tb || a.localeCompare(b);
};

export interface RawModel {
  id: string;
  actions?: string[];
}

// 텍스트 생성에 쓸 수 있는 모델만 남기고 고를 만한 순서로 정렬한다
export function selectModels(provider: AiProviderId, raw: RawModel[]): string[] {
  let ids: string[];
  if (provider === 'anthropic') {
    ids = raw.map((m) => m.id).filter((id) => id.startsWith('claude-'));
    const preferred = ids.filter((id) => id === CLAUDE_DEFAULT_MODEL);
    ids = [...preferred, ...ids.filter((id) => id !== CLAUDE_DEFAULT_MODEL)];
  } else if (provider === 'openai') {
    ids = raw.map((m) => m.id)
      .filter((id) => /^(gpt-|o\d)/.test(id) && !OPENAI_EXCLUDE.test(id) && !DATED.test(id))
      .sort(byRank(rankOpenAi));
  } else {
    ids = raw
      .filter((m) => !m.actions || m.actions.includes('generateContent'))
      .map((m) => m.id.replace(/^models\//, ''))
      .filter((id) => /^gemini-/.test(id) && !/(embedding|image|tts|audio|live|vision|robotics|computer|aqa)/.test(id))
      .sort(byRank(rankGemini));
  }
  return Array.from(new Set(ids)).slice(0, MAX_MODELS);
}

export const isModelId = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9._:/-]{2,100}$/.test(value);
