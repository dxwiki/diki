'use client';

import { FormEvent, useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, Trash2 } from 'lucide-react';
import { AI_PROVIDERS, type AiProviderId } from '@diki/core';
import { AiClientError } from './aiClient';
import type { useAiKeys } from './useAiKeys';

const KEY_PAGES: Record<AiProviderId, string> = {
  anthropic: 'https://console.anthropic.com/settings/keys',
  openai: 'https://platform.openai.com/api-keys',
  google: 'https://aistudio.google.com/apikey',
};

interface AiSettingsPanelProps {
  keys: ReturnType<typeof useAiKeys>;
}

export default function AiSettingsPanel({ keys }: AiSettingsPanelProps) {
  const { state, models, register, loadModels, update, remove } = keys;
  const [tab, setTab] = useState<AiProviderId>(state.active ?? 'anthropic');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'error' | 'ok'; text: string } | null>(null);
  const stored = state.providers.find((p) => p.id === tab);
  const providerLabel = AI_PROVIDERS.find((p) => p.id === tab)?.label ?? '';

  useEffect(() => {
    if (stored && !models[tab]) loadModels(tab).catch(() => undefined);
  }, [stored, models, tab, loadModels]);

  const run = async (action: ()=> Promise<void>, success?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      if (success) setMessage({ tone: 'ok', text: success });
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof AiClientError ? error.message : '처리하지 못했어요.' });
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const apiKey = input.trim();
    // 입력값은 전송 직후 비워 화면 상태에 남기지 않는다
    setInput('');
    if (!apiKey) return;
    run(() => register(tab, apiKey), `${ providerLabel } 키를 확인하고 안전하게 저장했어요.`);
  };

  return (
    <div className="rounded-2xl border border-light p-5">
      <div className="flex items-center gap-2">
        <KeyRound className="size-4 text-primary" />
        <p className="text-sm font-bold text-main">{'AI 피드백 설정'}</p>
      </div>

      <div className="mt-4 flex gap-1 rounded-full bg-extreme-light p-1" role="tablist" aria-label="AI 회사 선택">
        {AI_PROVIDERS.map((provider) => {
          const has = state.providers.some((p) => p.id === provider.id);
          return (
            <button
              key={provider.id}
              role="tab"
              aria-selected={tab === provider.id}
              onClick={() => {
                setTab(provider.id);
                setMessage(null);
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-sm font-medium transition-colors
                ${ tab === provider.id ? 'bg-background text-main shadow-sm' : 'text-gray1 hover:text-main' }`}
            >
              {provider.label}
              {has && <span className={`size-1.5 rounded-full ${ state.active === provider.id ? 'bg-primary' : 'bg-gray3' }`} />}
            </button>
          );
        })}
      </div>

      {stored ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-gray1">{'저장된 키'}</span>
            <code className="rounded bg-extreme-light px-2 py-0.5 text-sub">{stored.masked}</code>
          </div>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="shrink-0 text-gray1">{'모델'}</span>
            <select
              value={stored.model}
              disabled={busy || !models[tab]}
              onChange={(e) => run(() => update({ provider: tab, model: e.target.value }))}
              className="min-w-0 flex-1 rounded-lg border border-light bg-background px-2 py-1 text-sub"
            >
              {(models[tab] ?? [stored.model]).map((model) => <option key={model} value={model}>{model}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => run(() => update({ active: tab }))}
              disabled={busy || state.active === tab}
              className="rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary disabled:border-light disabled:text-gray2"
            >
              {state.active === tab ? '피드백에 사용 중' : '이 회사로 피드백 받기'}
            </button>
            <button
              onClick={() => run(() => remove(tab), '키를 삭제했어요.')}
              disabled={busy}
              className="flex items-center gap-1 rounded-full border border-light px-3 py-1 text-xs text-gray1 hover:text-level-5"
            >
              <Trash2 className="size-3" />
              {'키 삭제'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-2">
          <label htmlFor="ai-api-key" className="text-sm text-gray1">{`${ providerLabel } API 키`}</label>
          <div className="flex gap-2">
            <input
              id="ai-api-key"
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="off"
              data-1p-ignore
              data-lpignore="true"
              placeholder={`${ AI_PROVIDERS.find((p) => p.id === tab)?.keyHint ?? '' }...`}
              className="min-w-0 flex-1 rounded-lg border border-light bg-background px-3 py-2 text-sm text-main outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={busy || input.trim().length < 20}
              className="shrink-0 rounded-lg bg-primary px-4 text-sm font-semibold text-background disabled:bg-gray4 disabled:text-gray2"
            >
              {busy ? '확인 중' : '확인 후 저장'}
            </button>
          </div>
          <a href={KEY_PAGES[tab]} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-primary hover:underline">
            {`${ providerLabel } 키 발급 페이지`}
          </a>
        </form>
      )}

      {message && (
        <p role="status" className={`mt-3 text-sm ${ message.tone === 'error' ? 'text-level-5' : 'text-level-2' }`}>{message.text}</p>
      )}

      <div className="mt-5 space-y-1.5 border-t border-light pt-4 text-xs leading-relaxed text-gray1">
        <p className="flex items-center gap-1 font-semibold text-sub">
          <ShieldCheck className="size-3.5" />
          {'키는 이렇게 보관돼요'}
        </p>
        <p>{'· 서버가 키를 암호화해 이 브라우저의 보안 쿠키(30일)에 넣어요. 페이지 스크립트로는 읽을 수 없고, Diki DB에는 저장하지 않아요.'}</p>
        <p>{'· 답변은 선택한 AI 회사로 전송되고, 사용료는 본인 계정에 청구돼요.'}</p>
        <p>{'· 사용 한도를 낮게 정한 전용 키를 권장해요. 공용 PC에서는 사용 후 키를 삭제해 주세요.'}</p>
        {state.providers.length > 1 && (
          <button onClick={() => run(() => remove(), '모든 키를 삭제했어요.')} disabled={busy} className="mt-1 text-level-5 hover:underline">
            {'모든 키 삭제'}
          </button>
        )}
      </div>
    </div>
  );
}
