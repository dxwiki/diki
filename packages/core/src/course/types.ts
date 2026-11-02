export type CourseMode = 'learn' | 'interview';

export interface PhaseDefinition {
  id: string;
  title: string;
  steps: string[];
}

export interface StageDefinition {
  id: string;
  label: string;
  description: string;
  phases: PhaseDefinition[];
}

export type RoleId = 'ds' | 'de' | 'da';

export interface RoleDefinition {
  id: RoleId;
  label: string;
  fullLabel: string;
  description: string;
  phases: PhaseDefinition[];
}

export interface StepSummary {
  id: string;
  title: string;
  summary: string;
}

export interface PhaseSummary {
  id: string;
  title: string;
  steps: StepSummary[];
}

export interface StageSummary {
  id: string;
  label: string;
  description: string;
  phases: PhaseSummary[];
}

export interface RoleSummary {
  id: RoleId;
  label: string;
  fullLabel: string;
  description: string;
  phases: PhaseSummary[];
}

export interface StepLink {
  href: string;
  title: string;
}

export interface QuizOption {
  slug: string;
  title: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  context?: string;
  options: QuizOption[];
  answer: string;
  explanation: string;
  linkOptions?: boolean;
  tag?: string;
}

export interface LessonCard {
  kind: 'card';
  id: string;
  label: string;
  body: string;
  markdown: boolean;
  tags?: string[];
}

export interface LessonChoice extends QuizQuestion {
  kind: 'choice';
}

export interface LessonMatch {
  kind: 'match';
  id: string;
  tag?: string;
  prompt: string;
  pairs: { left: string; right: string }[];
  rightOrder: number[];
}

export type LessonItem = LessonCard | LessonChoice | LessonMatch;
export type LessonQuestion = LessonChoice | LessonMatch;

export interface EvaluationItem {
  label: string;
  detail: string;
}

export interface InterviewContent {
  question: string;
  items: EvaluationItem[];
  sampleAnswer?: string;
  commonMisses: string[];
  followUps: string[];
  curated: boolean;
}
