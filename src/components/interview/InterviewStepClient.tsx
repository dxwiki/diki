'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Check, Pencil } from 'lucide-react';
import StepShell from '@/components/course/StepShell';
import { InterviewContent, RoleSummary, StepLink } from '@/content/types';
import { computePhaseStates, stepKey } from '@/content/progress';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { AiEntry, AiItemNote, AiSummary, type AiEvaluationResult } from './ai/AiFeedback';
import { useAiKeys } from './ai/useAiKeys';

interface InterviewStepClientProps {
  role: RoleSummary;
  phaseId: string;
  stepId: string;
  termTitle: string;
  reference: { short: string; relevance: string; example: string };
  content: InterviewContent;
  neighbors: { prev: StepLink | null; next: StepLink | null };
}

type Assessment = 'met' | 'missing';

const activities = ['질문', '답변 작성', '평가 기준 확인', '자기 점검'];
const MIN_ANSWER_LENGTH = 10;

export default function InterviewStepClient({ role, phaseId, stepId, termTitle, reference, content, neighbors }: InterviewStepClientProps) {
  const { ready, state, recordAttempt, saveDraft } = useCourseProgress();
  const key = stepKey(role.id, phaseId, stepId);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [assessment, setAssessment] = useState<Record<number, Assessment>>({});
  const [finished, setFinished] = useState(false);
  const [aiResult, setAiResult] = useState<AiEvaluationResult | null>(null);
  const aiKeys = useAiKeys();
  const stepRef = { role: role.id, phaseId, stepId };
  const loadedDraft = useRef(false);

  useEffect(() => {
    if (!ready || loadedDraft.current) return;
    loadedDraft.current = true;
    setAnswer(state.drafts[key] ?? '');
  }, [ready, state.drafts, key]);

  useEffect(() => {
    if (!loadedDraft.current) return;
    const timer = setTimeout(() => saveDraft(key, answer), 800);
    return () => clearTimeout(timer);
  }, [answer, key, saveDraft]);

  const phases = useMemo(() => computePhaseStates(role.phases, role.id, state.interview), [role, state.interview]);
  const phase = phases.find((p) => p.id === phaseId);
  const stepIndex = phase?.steps.findIndex((s) => s.id === stepId) ?? -1;
  const step = phase?.steps[stepIndex];
  const firstAvailable = phases.flatMap((p) => p.steps.map((s) => ({ p, s }))).find(({ s }) => s.status === 'available');

  const canReveal = answer.trim().length >= MIN_ANSWER_LENGTH;
  const allAssessed = content.items.every((_, i) => assessment[i]);
  const missingItems = content.items.filter((_, i) => assessment[i] === 'missing');
  const activity = finished || allAssessed ? 3 : revealed ? 2 : answer ? 1 : 0;

  const finish = () => {
    setFinished(true);
    recordAttempt('interview', key, { completed: true, review: missingItems.length > 0 });
  };

  // AI 판정을 자가 점검 선택에 미리 채운다. 부분 충족은 보완 필요로 보고, 사용자가 고칠 수 있다
  const applyAiResult = (result: AiEvaluationResult) => {
    setAiResult(result);
    setAssessment(Object.fromEntries(result.evaluation.items.map((item, i) => [i, item.verdict === 'met' ? 'met' : 'missing'])));
    setRevealed(true);
  };

  const practiceAgain = () => {
    setFinished(false);
    setRevealed(false);
    setAssessment({});
    setAiResult(null);
  };

  return (
    <StepShell
      ready={ready}
      status={step?.status}
      mapHref={`/interview/${ role.id }`}
      mapLabel={`${ role.fullLabel } 코스 지도`}
      eyebrow={`${ role.label } · ${ phase?.title } · 질문 ${ stepIndex + 1 }/${ phase?.steps.length }`}
      title={termTitle}
      activities={activities}
      currentActivity={activity}
      neighbors={neighbors}
      firstAvailable={firstAvailable ? { href: `/interview/${ role.id }/${ firstAvailable.p.id }/${ firstAvailable.s.id }`, title: firstAvailable.s.title } : null}
    >
      <section className="rounded-2xl bg-extreme-light p-6">
        <p className="text-xs font-semibold text-primary">{'면접 질문'}</p>
        <p className="mt-2 text-lg font-semibold leading-relaxed text-main">{content.question}</p>
      </section>

      <section className="mt-8">
        <label htmlFor="answer" className="text-lg font-bold text-main">{'내 답변'}</label>
        <p className="mt-1 text-xs text-gray2">{'면접관에게 말하듯 적어 보세요. 작성 중인 답변은 이 브라우저에 자동 저장됩니다.'}</p>
        <textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          readOnly={revealed && !finished}
          rows={8}
          placeholder="핵심 정의부터 시작해 사례와 근거를 덧붙여 보세요."
          className="mt-3 w-full resize-y rounded-xl !bg-extreme-light p-4 text-sm leading-relaxed text-main outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="mt-1 flex justify-between text-xs text-gray2">
          <span>{canReveal ? '' : `${ MIN_ANSWER_LENGTH }자 이상 작성하면 평가 기준을 볼 수 있습니다`}</span>
          <span>{`${ answer.trim().length }자`}</span>
        </div>
        {!revealed && (
          <button
            onClick={() => setRevealed(true)}
            disabled={!canReveal}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray4 disabled:text-gray2"
          >
            {'답변 제출하고 평가 기준 보기'}
            <ArrowRight className="size-4" />
          </button>
        )}
        {!revealed && (
          <AiEntry
            keys={aiKeys}
            step={stepRef}
            answer={answer}
            canRequest={canReveal}
            onResult={applyAiResult}
          />
        )}
      </section>

      {revealed && (
        <section className="mt-12 animate-slideDown">
          <h2 className="text-lg font-bold text-main">{'평가 기준 확인 · 자기 점검'}</h2>
          <p className="mt-1 text-xs text-gray2">
            {aiResult
              ? 'AI 판정을 참고해 각 항목을 최종 점검하세요. 판정은 직접 바꿀 수 있습니다.'
              : '내 답변이 각 항목을 충족했는지 스스로 점검합니다. AI 채점이나 합격 가능성 평가가 아닙니다.'}
          </p>

          <ol className="mt-4 space-y-3">
            {content.items.map((item, i) => (
              <li key={item.label} className="rounded-xl bg-extreme-light p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-main">{`${ i + 1 }. ${ item.label }`}</p>
                    <p className="mt-1 text-sm text-gray1">{item.detail}</p>
                  </div>
                </div>
                {aiResult?.evaluation.items[i] && <AiItemNote feedback={aiResult.evaluation.items[i]} />}
                <div className="mt-3 flex gap-2" role="radiogroup" aria-label={`${ item.label } 점검`}>
                  {(['met', 'missing'] as Assessment[]).map((value) => (
                    <button
                      key={value}
                      role="radio"
                      aria-checked={assessment[i] === value}
                      disabled={finished}
                      onClick={() => setAssessment((prev) => ({ ...prev, [i]: value }))}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors
                        ${ assessment[i] === value
                      ? value === 'met' ? 'bg-level-2 text-background' : 'bg-level-4 text-background'
                      : 'bg-background text-gray1 hover:text-main' }`}
                    >
                      {value === 'met' ? '충족' : '보완 필요'}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          {aiResult && (
            <AiSummary
              result={aiResult}
              step={stepRef}
              answer={answer}
            />
          )}

          <div className="mt-6 rounded-xl bg-extreme-light p-4">
            {content.sampleAnswer ? (
              <>
                <p className="text-sm font-semibold text-main">{'답변 예시'}</p>
                <p className="mt-2 text-sm leading-relaxed text-sub">{content.sampleAnswer}</p>
              </>
            ) : (
              <>
                <p className="flex items-center gap-1 text-sm font-semibold text-main">
                  <BookOpen className="size-4" />
                  {'용어사전 기반 참고 자료'}
                </p>
                <dl className="mt-2 space-y-2 text-sm">
                  <div><dt className="text-xs text-gray2">{'정의'}</dt><dd className="text-sub">{reference.short}</dd></div>
                  {reference.relevance && <div><dt className="text-xs text-gray2">{`${ role.fullLabel }에게 중요한 이유`}</dt><dd className="text-sub">{reference.relevance}</dd></div>}
                  {reference.example && <div><dt className="text-xs text-gray2">{'활용 사례'}</dt><dd className="text-sub">{reference.example}</dd></div>}
                </dl>
                <Link href={`/posts/${ stepId }`} className="mt-2 inline-block text-xs text-primary hover:underline">{'용어사전에서 자세히 보기'}</Link>
              </>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-main">{'흔한 누락'}</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray1">
                {content.commonMisses.map((miss) => <li key={miss}>{miss}</li>)}
              </ul>
            </div>
            {content.followUps.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-main">{'꼬리 질문 대비'}</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-gray1">
                  {content.followUps.map((q) => <li key={q}>{q}</li>)}
                </ul>
              </div>
            )}
          </div>

          {!finished ? (
            <button
              onClick={finish}
              disabled={!allAssessed}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray4 disabled:text-gray2"
            >
              <Check className="size-4" />
              {allAssessed ? '점검 완료' : '모든 항목을 점검해 주세요'}
            </button>
          ) : (
            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-extreme-light p-4">
                <p className={`font-semibold ${ missingItems.length ? 'text-level-4' : 'text-level-2' }`}>
                  {missingItems.length ? `연습 완료 · ${ missingItems.length }개 항목은 재연습 목록에 담았어요` : '연습 완료 · 모든 항목을 충족했어요'}
                </p>
                {missingItems.length > 0 && (
                  <p className="mt-1 text-sm text-gray1">{`보완할 항목: ${ missingItems.map((item) => item.label).join(', ') }`}</p>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <button onClick={practiceAgain} className="flex items-center justify-center gap-2 rounded-xl bg-extreme-light py-3 text-sm font-semibold text-sub hover:bg-gray4 hover:text-primary">
                  <Pencil className="size-4" />
                  {'답변 보완하기'}
                </button>
                <Link
                  href={neighbors.next?.href ?? `/interview/${ role.id }`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-background hover:opacity-90"
                >
                  {neighbors.next ? `다음 질문: ${ neighbors.next.title }` : '코스 지도로 돌아가기'}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          )}
        </section>
      )}
    </StepShell>
  );
}
