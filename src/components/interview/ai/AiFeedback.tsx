'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ChevronDown, MessageCircleQuestion, Settings, Sparkles } from 'lucide-react';
import {
  AI_PROVIDERS,
  MAX_ANSWER_CHARS,
  MAX_FOLLOW_UP_TURNS,
  MIN_ANSWER_CHARS,
  type AiEvaluation,
  type AiFollowUp,
  type AiItemFeedback,
  type AiProviderId,
  type FollowUpTurn,
} from '@diki/core';
import { aiFetch, AiClientError } from './aiClient';
import AiSettingsPanel from './AiSettingsPanel';
import type { useAiKeys } from './useAiKeys';

export interface StepRef {
  role: string;
  phaseId: string;
  stepId: string;
}

interface Usage {
  inputTokens: number;
  outputTokens: number;
}

export interface AiEvaluationResult {
  evaluation: AiEvaluation;
  provider: AiProviderId;
  model: string;
  usage: Usage;
}

const providerLabel = (id: AiProviderId) => AI_PROVIDERS.find((p) => p.id === id)?.label ?? id;
const errorText = (error: unknown) => (error instanceof AiClientError ? error.message : '처리하지 못했어요.');

const VERDICT: Record<AiItemFeedback['verdict'], { label: string; tone: string }> = {
  met: { label: '충족', tone: 'text-level-2 border-level-2' },
  partial: { label: '부분 충족', tone: 'text-level-3 border-level-3' },
  missing: { label: '누락', tone: 'text-level-5 border-level-5' },
};

export function AiEntry({ keys, step, answer, canRequest, onResult }: {
  keys: ReturnType<typeof useAiKeys>;
  step: StepRef;
  answer: string;
  canRequest: boolean;
  onResult: (result: AiEvaluationResult)=> void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // 키 등록 페이지에서 돌아오면(?ai=saved) 설정을 열어 결과를 알리고 주소에서 표시를 지운다
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('ai') !== 'saved') return;
    setNotice('키를 확인하고 안전하게 저장했어요.');
    setOpen(true);
    url.searchParams.delete('ai');
    window.history.replaceState(window.history.state, '', `${ url.pathname }${ url.search }${ url.hash }`);
  }, []);

  if (keys.status === 'unavailable') return null;
  const active = keys.state.providers.find((p) => p.id === keys.state.active);

  const request = async () => {
    setBusy(true);
    setError(null);
    try {
      onResult(await aiFetch<AiEvaluationResult>('/interview/evaluate', { method: 'POST', body: { ...step, answer } }));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {active ? (
          <button
            onClick={request}
            disabled={!canRequest || busy || answer.trim().length > MAX_ANSWER_CHARS}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary py-3 text-sm font-semibold text-primary hover:bg-background-secondary disabled:cursor-not-allowed disabled:border-light disabled:text-gray2"
          >
            <Sparkles className="size-4" />
            {busy ? 'AI가 답변을 읽는 중…' : `AI 피드백 받기 · ${ providerLabel(active.id) } ${ active.model }`}
          </button>
        ) : (
          <p className="flex-1 text-sm text-gray1">{'Claude·GPT·Gemini API 키를 등록하면 AI 피드백을 받을 수 있어요.'}</p>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-1 rounded-xl border border-light p-3 text-sm text-gray1 hover:text-primary"
        >
          <Settings className="size-4" />
          {active ? '설정' : 'API 키 등록'}
        </button>
      </div>
      {answer.trim().length > MAX_ANSWER_CHARS && <p className="text-xs text-level-5">{`AI 피드백은 ${ MAX_ANSWER_CHARS }자까지 보낼 수 있어요.`}</p>}
      {error && <p role="alert" className="text-sm text-level-5">{error}</p>}
      {open && keys.status === 'ready' && (
        <AiSettingsPanel
          keys={keys}
          notice={notice}
        />
      )}
    </div>
  );
}

export function AiItemNote({ feedback }: { feedback: AiItemFeedback }) {
  const verdict = VERDICT[feedback.verdict];
  return (
    <div className="mt-3 rounded-lg bg-background p-3 text-sm">
      <p className="flex items-center gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${ verdict.tone }`}>{`AI · ${ verdict.label }`}</span>
      </p>
      {feedback.evidence && <p className="mt-2 border-l-2 border-light pl-2 text-gray1">{`“${ feedback.evidence }”`}</p>}
      {feedback.tip && <p className="mt-2 text-sub">{feedback.tip}</p>}
    </div>
  );
}

export function AiSummary({ result, step, answer }: { result: AiEvaluationResult; step: StepRef; answer: string }) {
  const [showImproved, setShowImproved] = useState(false);
  const { evaluation, provider, model, usage } = result;
  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-xl border border-light p-4">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-main">
          <Sparkles className="size-4 text-primary" />
          {'AI 총평'}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-sub">{evaluation.summary}</p>
        {evaluation.improvedAnswer && (
          <div className="mt-3">
            <button onClick={() => setShowImproved((v) => !v)} aria-expanded={showImproved} className="flex items-center gap-1 text-xs font-medium text-primary">
              {'보완한 답변 예시'}
              <ChevronDown className={`size-3.5 transition-transform ${ showImproved ? 'rotate-180' : '' }`} />
            </button>
            {showImproved && <p className="mt-2 whitespace-pre-line rounded-lg bg-extreme-light p-3 text-sm leading-relaxed text-sub">{evaluation.improvedAnswer}</p>}
          </div>
        )}
        <p className="mt-3 text-xs text-gray2">
          {`${ providerLabel(provider) } ${ model } · 입력 ${ usage.inputTokens.toLocaleString() } / 출력 ${ usage.outputTokens.toLocaleString() } 토큰 · AI 판단은 틀릴 수 있어요`}
        </p>
      </div>
      {evaluation.followUp && <FollowUpChat firstQuestion={evaluation.followUp} step={step} answer={answer} />}
    </div>
  );
}

function FollowUpChat({ firstQuestion, step, answer }: { firstQuestion: string; step: StepRef; answer: string }) {
  const [started, setStarted] = useState(false);
  const [turns, setTurns] = useState<(FollowUpTurn & { feedback?: string })[]>([]);
  const [question, setQuestion] = useState<string | null>(firstQuestion);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const reply = draft.trim();
    if (!question || reply.length < MIN_ANSWER_CHARS || reply.length > MAX_ANSWER_CHARS) return;
    const nextTurns = [...turns.map(({ question: q, answer: a }) => ({ question: q, answer: a })), { question, answer: reply }];
    setBusy(true);
    setError(null);
    try {
      const result = await aiFetch<AiFollowUp>('/interview/follow-up', { method: 'POST', body: { ...step, answer, turns: nextTurns } });
      setTurns([...turns, { question, answer: reply, feedback: result.feedback }]);
      setQuestion(nextTurns.length < MAX_FOLLOW_UP_TURNS ? result.nextQuestion : null);
      setDraft('');
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  if (!started) {
    return (
      <button onClick={() => setStarted(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-light py-3 text-sm font-semibold text-sub hover:border-primary hover:text-primary">
        <MessageCircleQuestion className="size-4" />
        {`AI 꼬리 질문 받기 (최대 ${ MAX_FOLLOW_UP_TURNS }번)`}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-light p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-main">
        <MessageCircleQuestion className="size-4 text-primary" />
        {'꼬리 질문'}
      </p>
      <ol className="mt-3 space-y-4">
        {turns.map((turn, i) => (
          <li key={i} className="space-y-2 text-sm">
            <p className="font-semibold text-main">{`Q${ i + 1 }. ${ turn.question }`}</p>
            <p className="whitespace-pre-line rounded-lg bg-extreme-light p-3 text-sub">{turn.answer}</p>
            {turn.feedback && <p className="border-l-2 border-primary pl-3 leading-relaxed text-sub">{turn.feedback}</p>}
          </li>
        ))}
      </ol>
      {question ? (
        <form onSubmit={submit} className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-main">{`Q${ turns.length + 1 }. ${ question }`}</p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            disabled={busy}
            placeholder="면접관에게 답하듯 적어 보세요."
            className="w-full resize-y rounded-xl !bg-extreme-light p-3 text-sm leading-relaxed text-main outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={busy || draft.trim().length < MIN_ANSWER_CHARS}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-background disabled:bg-gray4 disabled:text-gray2"
          >
            {busy ? 'AI가 답변을 읽는 중…' : '답변 보내기'}
          </button>
        </form>
      ) : (
        <p className="mt-3 text-sm text-gray1">{'꼬리 질문 연습을 마쳤어요.'}</p>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-level-5">{error}</p>}
    </div>
  );
}
