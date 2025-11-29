import { TermData } from '@/types/database';
import {
  FieldName,
  SectionKey,
  sectionRequiredFields,
  requiredFields,
} from '@/store/formValidationSlice';

// 필드 값 추출 헬퍼
export function getFieldValue(formData: TermData, field: FieldName): unknown {
  switch (field) {
    case 'title.ko':
      return formData.title?.ko;
    case 'title.en':
      return formData.title?.en;
    case 'title.etc':
      return formData.title?.etc;
    case 'description.short':
      return formData.description?.short;
    case 'description.full':
      return formData.description?.full;
    case 'difficulty.level':
      return formData.difficulty?.level;
    case 'difficulty.description':
      return formData.difficulty?.description;
    case 'terms':
      return formData.terms;
    case 'tags':
      return formData.tags;
    case 'relevance.analyst.score':
      return formData.relevance?.analyst?.score;
    case 'relevance.analyst.description':
      return formData.relevance?.analyst?.description;
    case 'relevance.engineer.score':
      return formData.relevance?.engineer?.score;
    case 'relevance.engineer.description':
      return formData.relevance?.engineer?.description;
    case 'relevance.scientist.score':
      return formData.relevance?.scientist?.score;
    case 'relevance.scientist.description':
      return formData.relevance?.scientist?.description;
    case 'usecase.description':
      return formData.usecase?.description;
    case 'usecase.example':
      return formData.usecase?.example;
    case 'usecase.industries':
      return formData.usecase?.industries;
    case 'references':
      // references는 하나라도 있으면 유효
      return formData.references;
    default:
      return undefined;
  }
}

// 필드가 비어있는지 확인
export function isFieldEmpty(formData: TermData, field: FieldName): boolean {
  const value = getFieldValue(formData, field);

  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;

  // references 특별 처리
  if (field === 'references' && typeof value === 'object') {
    const refs = value as TermData['references'];
    const hasTutorials = Array.isArray(refs?.tutorials) && refs.tutorials.length > 0;
    const hasBooks = Array.isArray(refs?.books) && refs.books.length > 0;
    const hasAcademic = Array.isArray(refs?.academic) && refs.academic.length > 0;
    const hasOpensource = Array.isArray(refs?.opensource) && refs.opensource.length > 0;
    return !(hasTutorials || hasBooks || hasAcademic || hasOpensource);
  }

  return false;
}

// 필드가 필수인지 확인
export function isRequiredField(field: FieldName): boolean {
  return requiredFields.includes(field);
}

// 개별 필드 validation 규칙
// 에러 메시지를 반환하거나, 유효하면 null 반환
export function validateField(formData: TermData, field: FieldName, value?: string): string | null {
  const fieldValue = value ?? getFieldValue(formData, field);

  // 빈 값은 에러가 아님 (guidance만 표시)
  if (isFieldEmpty(formData, field) && value === undefined) {
    return null;
  }

  switch (field) {
    case 'title.ko': {
      const strValue = String(fieldValue || '');
      if (strValue.trim() === '') return null; // 빈 값은 에러 아님
      // 한글, 영어, 별(*), 하이픈(-), 공백만 허용
      const allowedPattern = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s*-]*$/;
      if (!allowedPattern.test(strValue)) {
        return '한국어, 영어, 별(*), 하이픈(-) 외의 문자는 사용할 수 없습니다.';
      }
      return null;
    }

    case 'title.en': {
      const strValue = String(fieldValue || '');
      if (strValue.trim() === '') return null; // 빈 값은 에러 아님
      // 영어, 별(*), 하이픈(-), 공백만 허용
      const allowedPattern = /^[a-zA-Z\s*-]*$/;
      if (!allowedPattern.test(strValue)) {
        return '영어, 별(*), 하이픈(-) 외의 문자는 사용할 수 없습니다.';
      }
      return null;
    }

    case 'description.short': {
      const strValue = String(fieldValue || '');
      if (strValue.trim() === '') return null; // 빈 값은 에러 아님
      if (strValue.length > 100) {
        return '짧은 설명은 100자를 초과할 수 없습니다.';
      }
      return null;
    }

    // 나머지 필드들은 특별한 형식 validation 없음
    default:
      return null;
  }
}

// 필드가 유효한 값을 가지고 있는지 (border-primary 표시용)
export function isFieldValid(formData: TermData, field: FieldName): boolean {
  // 필수 필드가 아니면 valid 표시 안 함
  if (!isRequiredField(field)) return false;

  // 비어있으면 valid 아님
  if (isFieldEmpty(formData, field)) return false;

  // 에러가 있으면 valid 아님
  const error = validateField(formData, field);
  if (error) return false;

  return true;
}

// 섹션의 모든 필수 필드 validation
export function validateSection(formData: TermData, section: SectionKey): {
  errors: Partial<Record<FieldName, string | null>>;
  hasError: boolean;
  fieldValids: Partial<Record<FieldName, boolean>>;
} {
  const fields = sectionRequiredFields[section];
  const errors: Partial<Record<FieldName, string | null>> = {};
  const fieldValids: Partial<Record<FieldName, boolean>> = {};
  let hasError = false;

  fields.forEach((field) => {
    // 필드별 validation 에러 체크
    const error = validateField(formData, field);
    errors[field] = error;

    // 빈 값인지 체크 (필수 필드가 비어있으면 섹션 에러)
    const isEmpty = isFieldEmpty(formData, field);
    if (isEmpty && isRequiredField(field)) {
      hasError = true;
    }

    // 형식 에러가 있어도 섹션 에러
    if (error) {
      hasError = true;
    }

    // 필드 유효성 (border-primary용)
    fieldValids[field] = isFieldValid(formData, field);
  });

  return { errors, hasError, fieldValids };
}

// 전체 폼 validation
export function validateAllSections(formData: TermData): {
  sectionErrors: Record<SectionKey, boolean>;
  fieldErrors: Partial<Record<FieldName, string | null>>;
  fieldValids: Partial<Record<FieldName, boolean>>;
  invalidSections: string[];
} {
  const sections: SectionKey[] = ['title', 'summary', 'difficulty', 'description', 'terms', 'tags', 'relevance', 'usecase', 'references'];
  const sectionLabels: Record<SectionKey, string> = {
    title: '제목',
    summary: '요약',
    difficulty: '난이도',
    description: '개념',
    terms: '관련 용어',
    tags: '관련 포스트',
    relevance: '직무 연관도',
    usecase: '사용 사례',
    references: '참고 자료',
  };

  const sectionErrors: Record<SectionKey, boolean> = {
    title: false,
    summary: false,
    difficulty: false,
    description: false,
    terms: false,
    tags: false,
    relevance: false,
    usecase: false,
    references: false,
  };
  let fieldErrors: Partial<Record<FieldName, string | null>> = {};
  let fieldValids: Partial<Record<FieldName, boolean>> = {};
  const invalidSections: string[] = [];

  sections.forEach((section) => {
    const result = validateSection(formData, section);
    sectionErrors[section] = result.hasError;
    fieldErrors = { ...fieldErrors, ...result.errors };
    fieldValids = { ...fieldValids, ...result.fieldValids };

    if (result.hasError) {
      invalidSections.push(sectionLabels[section]);
    }
  });

  return { sectionErrors, fieldErrors, fieldValids, invalidSections };
}

// Guidance 메시지 반환
export function getFieldGuidance(field: FieldName): string | null {
  const guidances: Partial<Record<FieldName, string>> = {
    'title.ko': '한글 제목을 작성해주세요.',
    'title.en': '영문 제목을 작성해주세요.',
    'description.short': '짧은 설명을 작성해주세요.',
    'difficulty.description': '난이도 설명을 작성해주세요.',
    'description.full': '본문을 작성해주세요.',
    'terms': '관련 용어를 1개 이상 작성해주세요.',
    'tags': '관련 포스트를 1개 이상 선택해주세요.',
    'relevance.analyst.description': '연관도 설명을 작성해주세요.',
    'relevance.engineer.description': '연관도 설명을 작성해주세요.',
    'relevance.scientist.description': '연관도 설명을 작성해주세요.',
    'usecase.description': '사용 사례 개요를 작성해주세요.',
    'usecase.example': '사용 사례를 작성해주세요.',
    'references': '참고 자료를 1개 이상 작성해주세요.',
  };

  return guidances[field] ?? null;
}

// 필수 필드 에러 메시지 반환
export function getRequiredFieldError(field: FieldName): string | null {
  const errorMessages: Partial<Record<FieldName, string>> = {
    'title.ko': '한글 제목은 반드시 입력해야 합니다.',
    'title.en': '영문 제목은 반드시 입력해야 합니다.',
    'description.short': '짧은 설명은 반드시 입력해야 합니다.',
    'difficulty.description': '난이도 설명은 반드시 입력해야 합니다.',
    'description.full': '개념은 반드시 입력해야 합니다.',
    'terms': '관련 용어는 1개 이상 추가해야 합니다.',
    'tags': '관련 포스트는 1개 이상 선택해야 합니다.',
    'relevance.analyst.description': '데이터 분석가 연관도 설명은 반드시 입력해야 합니다.',
    'relevance.engineer.description': '데이터 엔지니어 연관도 설명은 반드시 입력해야 합니다.',
    'relevance.scientist.description': '데이터 과학자 연관도 설명은 반드시 입력해야 합니다.',
    'usecase.description': '사용 사례 개요는 반드시 입력해야 합니다.',
    'usecase.example': '사용 사례는 반드시 입력해야 합니다.',
    'references': '참고 자료는 1개 이상 추가해야 합니다.',
  };

  return errorMessages[field] ?? null;
}

