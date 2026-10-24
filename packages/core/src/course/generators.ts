import type { TermData } from '../types';
import { curatedQuestions } from './interview';
import { courseSlug as termSlug } from './summary';
import { InterviewContent, LessonChoice, LessonItem, LessonMatch, RoleId } from './types';

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed: string) {
  let state = hash(seed) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: string): T[] {
  const random = seededRandom(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 문제에서 정답이 드러나지 않도록 설명 속 용어 이름을 가린다
function maskTermName(text: string, term: TermData): string {
  const names = [term.title?.ko, term.title?.en, ...(term.title?.etc ?? [])]
    .filter((name): name is string => !!name && name.length > 1)
    .sort((a, b) => b.length - a.length);
  return names.reduce((acc, name) => acc.replace(new RegExp(escapeRegExp(name), 'gi'), '○○'), text);
}

const BOLD = /\*\*([^*]+)\*\*/g;

function stripBold(text: string) {
  return text.replace(BOLD, '$1');
}

// 본문에서 굵게 강조한 핵심 구절만 빈칸 후보로 쓴다
function keyPhrases(term: TermData): string[] {
  const title = term.title?.ko ?? '';
  const phrases = Array.from((term.description?.full ?? '').matchAll(BOLD), (m) => m[1].trim());
  return Array.from(new Set(phrases)).filter((p) =>
    p.length >= 2 && p.length <= 40 && !p.startsWith(title) && !p.endsWith('.') && !p.endsWith('다')
  );
}

function sentencesOf(full: string): string[] {
  return full.split(/<br\s*\/?>|\n+/).flatMap((paragraph) => paragraph.split(/(?<=다\.)\s+/)).map((s) => s.trim()).filter(Boolean);
}

function buildClozes(term: TermData, count: number): LessonChoice[] {
  const slug = termSlug(term);
  const phrases = keyPhrases(term);
  if (phrases.length < 4) return [];

  const candidates = sentencesOf(term.description?.full ?? '')
    .map((sentence) => {
      const bolds = Array.from(sentence.matchAll(BOLD), (m) => m[1].trim()).filter((b) => phrases.includes(b));
      return { sentence, answer: bolds[0], valid: bolds.length === 1 };
    })
    .filter(({ sentence, answer, valid }) => {
      if (!valid || sentence.length < 25 || sentence.length > 260) return false;
      const core = answer.split('(')[0].trim();
      return !stripBold(sentence.split(`**${ answer }**`).join('')).includes(core);
    });

  const picked: typeof candidates = [];
  shuffle(candidates, `cloze:${ slug }`).forEach((c) => {
    if (picked.length < count && !picked.some((p) => p.answer === c.answer)) picked.push(c);
  });

  return picked.map(({ sentence, answer }, i): LessonChoice => {
    const plain = stripBold(sentence);
    const distractors = shuffle(phrases.filter((p) => p !== answer && !plain.includes(p.split('(')[0].trim())), `cloze-opt:${ slug }:${ i }`).slice(0, 3);
    return {
      kind: 'choice',
      id: `cloze-${ i }`,
      tag: '방금 읽은 내용',
      prompt: '빈칸에 들어갈 말로 알맞은 것은 무엇일까요?',
      context: stripBold(sentence.split(`**${ answer }**`).join('＿＿＿＿')),
      options: shuffle([answer, ...distractors], `cloze-order:${ slug }:${ i }`).map((p) => ({ slug: p, title: p, text: p })),
      answer,
      explanation: plain,
    };
  }).filter((q) => q.options.length >= 3);
}

function termChoice(id: string, tag: string, prompt: string, target: TermData, context: string, explanation: string, others: TermData[], seed: string): LessonChoice {
  const choices = shuffle([target, ...shuffle(others.filter((t) => t !== target), `${ seed }:pick`).slice(0, 3)], `${ seed }:order`);
  return {
    kind: 'choice',
    id,
    tag,
    prompt,
    context,
    options: choices.map((t) => ({ slug: termSlug(t), title: t.title?.ko ?? '', text: t.title?.ko ?? '' })),
    answer: termSlug(target),
    explanation,
    linkOptions: true,
  };
}

// 이전 Step에서 배운 용어만 묻고, 지금 배우는 용어는 오답 보기로만 쓴다
function buildReview(term: TermData, earlier: TermData[]): (LessonChoice | LessonMatch)[] {
  const slug = termSlug(term);
  const pool = earlier.slice(-8).filter((t) => t.description?.short);
  if (pool.length < 2) return [];

  const ordered = shuffle(pool, `review:${ slug }`);
  const others = [term, ...pool];
  const questions: (LessonChoice | LessonMatch)[] = [];

  const defTarget = ordered[0];
  questions.push(termChoice(
    'review-definition', '이전 Step 복습', '앞에서 배운 용어 중, 다음 설명에 해당하는 것은 무엇일까요?', defTarget, maskTermName(defTarget.description?.short ?? '', defTarget), `${ defTarget.title?.ko }: ${ defTarget.description?.short }`, others, `review-def:${ slug }`
  ));

  const exTarget = ordered.find((t) => t !== defTarget && t.usecase?.example);
  if (exTarget) {
    questions.push(termChoice(
      'review-example', '이전 Step 복습', '다음 사례는 앞에서 배운 어떤 개념을 활용한 것일까요?', exTarget, maskTermName(exTarget.usecase?.example ?? '', exTarget), `${ exTarget.title?.ko }: ${ exTarget.usecase?.example }`, others, `review-ex:${ slug }`
    ));
  }

  const matchTerms = [term, ...ordered.filter((t) => t !== defTarget && t !== exTarget), defTarget, exTarget]
    .filter((t, i, list): t is TermData => !!t && list.indexOf(t) === i)
    .slice(0, 3);
  // 같은 줄에 정답 설명이 오지 않도록 고정점 없는 순서만 쓴다
  if (matchTerms.length === 3) {
    questions.push({
      kind: 'match',
      id: 'review-match',
      tag: '지금까지 배운 용어',
      prompt: '용어와 설명을 짝지어 보세요.',
      pairs: matchTerms.map((t) => ({ left: t.title?.ko ?? '', right: maskTermName(t.description?.short ?? '', t) })),
      rightOrder: shuffle([[1, 2, 0], [2, 0, 1]], `match:${ slug }`)[0],
    });
  }

  return questions;
}

export function buildLesson(term: TermData, earlier: TermData[]): LessonItem[] {
  const items: (LessonItem | null)[] = [
    { kind: 'card', id: 'definition', label: '핵심 정의', body: term.description?.short ?? '', markdown: false },
    term.description?.full ? { kind: 'card', id: 'concept', label: '개념', body: term.description.full, markdown: true } : null,
    term.usecase?.example
      ? { kind: 'card', id: 'example', label: '이런 상황에서 쓰여요', body: term.usecase.example, markdown: false, tags: term.usecase.industries ?? [] }
      : null,
    ...buildClozes(term, 2),
    ...buildReview(term, earlier),
  ];
  return items.filter((item): item is LessonItem => !!item);
}

const questionTemplates: Record<RoleId, (title: string)=> string> = {
  ds: (title) => `'${ title }'의 핵심 원리를 설명하고, 모델링에서 언제 어떻게 활용하는지 말씀해 주세요.`,
  de: (title) => `'${ title }'에 대해 설명하고, 데이터 시스템에서 구현하거나 운영할 때 고려할 점을 말씀해 주세요.`,
  da: (title) => `'${ title }'에 대해 설명하고, 분석 업무에서 어떻게 활용하고 결과를 해석하는지 말씀해 주세요.`,
};

const roleRelevanceKey: Record<RoleId, 'scientist' | 'engineer' | 'analyst'> = {
  ds: 'scientist',
  de: 'engineer',
  da: 'analyst',
};

export function buildInterview(term: TermData, role: RoleId): InterviewContent {
  const curated = curatedQuestions[`${ role }:${ termSlug(term) }`];
  if (curated) return { ...curated, curated: true };

  const title = term.title?.ko ?? '';
  const related = (term.terms ?? []).map((t) => t.term).filter(Boolean).slice(0, 3);
  const relevance = term.relevance?.[roleRelevanceKey[role]]?.description;

  const items = [
    { label: '정의', detail: term.description?.short ?? '' },
    relevance ? { label: '직무 관점', detail: relevance } : null,
    term.usecase?.example ? { label: '활용 사례', detail: term.usecase.example } : null,
    related.length ? { label: '관련 개념 연결', detail: `${ related.join(', ') } 중 하나 이상과의 관계를 설명했는가` } : null,
  ].filter((item): item is { label: string; detail: string } => !!item && !!item.detail);

  return {
    question: questionTemplates[role](title),
    items,
    commonMisses: ['정의만 말하고 직무에서 쓰이는 맥락을 빠뜨림', '구체적인 사례 없이 추상적으로 설명함'],
    followUps: related.slice(0, 2).map((name) => `'${ name }' 개념과는 어떤 관계가 있나요?`),
    curated: false,
  };
}
