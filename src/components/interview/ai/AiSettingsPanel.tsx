'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, KeyRound, ShieldCheck, Trash2 } from 'lucide-react';
import { AI_PROVIDERS, type AiProviderId } from '@diki/core';
import { AiClientError } from './aiClient';
import type { useAiKeys } from './useAiKeys';

interface AiSettingsPanelProps {
  keys: ReturnType<typeof useAiKeys>;
  notice?: string | null;
}

// 키 입력은 분석·광고 스크립트가 없는 별도 페이지(/ai/keys)에서만 받는다
const keyPageHref = (provider: AiProviderId) => {
  const returnTo = typeof window === 'undefined' ? '/interview' : window.location.pathname;
  return `/ai/keys?provider=${ provider }&return=${ encodeURIComponent(returnTo) }`;
};

export default function AiSettingsPanel({ keys, notice }: AiSettingsPanelProps) {
  const { state, models, loadModels, update, remove } = keys;
  const [tab, setTab] = useState<AiProviderId>(state.active ?? 'anthropic');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'error' | 'ok'; text: string } | null>(notice ? { tone: 'ok', text: notice } : null);
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
            <a href={keyPageHref(tab)} className="rounded-full border border-light px-3 py-1 text-xs text-gray1 hover:text-primary">{'키 교체'}</a>
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
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray1">{`${ providerLabel } 키가 등록되지 않았어요. 키는 스크립트가 없는 별도 보안 페이지에서 입력해요.`}</p>
          <a
            href={keyPageHref(tab)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-semibold text-background hover:opacity-90"
          >
            {`${ providerLabel } API 키 등록하기`}
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      )}

      {message && (
        <p role="status" className={`mt-3 text-sm ${ message.tone === 'error' ? 'text-level-5' : 'text-level-2' }`}>{message.text}</p>
      )}

      <div className="mt-5 space-y-1.5 border-t border-light pt-4 text-xs leading-relaxed text-gray1">
        <p className="flex items-center gap-1 font-semibold text-sub">
          <ShieldCheck className="size-3.5" />
          {'키는 이렇게 보관돼요'}
        </p>
        <p>{'· 키 입력 페이지에는 분석·광고를 포함한 어떤 스크립트도 실행되지 않아요.'}</p>
        <p>{'· 서버가 키를 암호화해 이 브라우저의 보안 쿠키(30일)에 넣어요. 페이지 스크립트로는 읽을 수 없고, Diki DB에는 저장하지 않아요.'}</p>
        <p>{'· 답변은 선택한 AI 회사로 전송되고, 사용료는 본인 계정에 청구돼요. 사용 한도를 낮게 정한 전용 키를 권장해요.'}</p>
        {state.providers.length > 1 && (
          <button onClick={() => run(() => remove(), '모든 키를 삭제했어요.')} disabled={busy} className="mt-1 text-level-5 hover:underline">
            {'모든 키 삭제'}
          </button>
        )}
      </div>
    </div>
  );
}
