export type {
  CourseMode,
  PhaseDefinition,
  StageDefinition,
  RoleId,
  RoleDefinition,
  StepSummary,
  PhaseSummary,
  StageSummary,
  RoleSummary,
  StepLink,
  QuizOption,
  QuizQuestion,
  LessonCard,
  LessonChoice,
  LessonMatch,
  LessonItem,
  LessonQuestion,
  EvaluationItem,
  InterviewContent,
} from './types';
export { learnStages } from './learn';
export { interviewRoles, curatedQuestions } from './interview';
export type { StepStatus, ProgressRecord, StepState, PhaseState, StepRecord, ProgressState } from './progress';
export { stepKey, computePhaseStates, isCourseComplete, EMPTY_PROGRESS, parseProgress, applyAttempt } from './progress';
export { buildLesson, buildInterview } from './generators';
export {
  courseSlug,
  buildCourseTermMap,
  summarizePhases,
  getStageSummaries,
  getRoleSummaries,
  getNeighborSteps,
  getEarlierTerms,
  getUnlockedStages,
} from './summary';
