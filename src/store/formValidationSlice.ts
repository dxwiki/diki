'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 섹션 키 타입
export type SectionKey = 'title' | 'summary' | 'difficulty' | 'description' | 'terms' | 'tags' | 'relevance' | 'usecase' | 'references';

// 필드 이름 타입 (dot notation)
export type FieldName =
  | 'title.ko'
  | 'title.en'
  | 'title.etc'
  | 'description.short'
  | 'description.full'
  | 'difficulty.level'
  | 'difficulty.description'
  | 'terms'
  | 'tags'
  | 'relevance.analyst.score'
  | 'relevance.analyst.description'
  | 'relevance.engineer.score'
  | 'relevance.engineer.description'
  | 'relevance.scientist.score'
  | 'relevance.scientist.description'
  | 'usecase.description'
  | 'usecase.example'
  | 'usecase.industries'
  | 'references';

// 필드와 섹션 매핑
export const fieldToSection: Record<FieldName, SectionKey> = {
  'title.ko': 'title',
  'title.en': 'title',
  'title.etc': 'title',
  'description.short': 'summary',
  'description.full': 'description',
  'difficulty.level': 'difficulty',
  'difficulty.description': 'difficulty',
  'terms': 'terms',
  'tags': 'tags',
  'relevance.analyst.score': 'relevance',
  'relevance.analyst.description': 'relevance',
  'relevance.engineer.score': 'relevance',
  'relevance.engineer.description': 'relevance',
  'relevance.scientist.score': 'relevance',
  'relevance.scientist.description': 'relevance',
  'usecase.description': 'usecase',
  'usecase.example': 'usecase',
  'usecase.industries': 'usecase',
  'references': 'references',
};

// 필수 필드 목록
export const requiredFields: FieldName[] = [
  'title.ko',
  'title.en',
  'description.short',
  'difficulty.description',
  'description.full',
  'terms',
  'tags',
  'relevance.analyst.description',
  'relevance.engineer.description',
  'relevance.scientist.description',
  'usecase.description',
  'usecase.example',
  'references',
];

// 섹션별 필수 필드 매핑
export const sectionRequiredFields: Record<SectionKey, FieldName[]> = {
  title: ['title.ko', 'title.en'],
  summary: ['description.short'],
  difficulty: ['difficulty.description'],
  description: ['description.full'],
  terms: ['terms'],
  tags: ['tags'],
  relevance: ['relevance.analyst.description', 'relevance.engineer.description', 'relevance.scientist.description'],
  usecase: ['usecase.description', 'usecase.example'],
  references: ['references'],
};

interface FormValidationState {
  // 필드별 에러 메시지 (null이면 에러 없음)
  fieldErrors: Partial<Record<FieldName, string | null>>;
  // 섹션별 에러 여부
  sectionErrors: Record<SectionKey, boolean>;
  // blur 된 필드 추적 (한 번이라도 blur 되었는지)
  touched: Partial<Record<FieldName, boolean>>;
  // 필드가 유효한 값을 가지고 있는지 (border-primary 표시용)
  fieldValid: Partial<Record<FieldName, boolean>>;
}

const initialState: FormValidationState = {
  fieldErrors: {},
  sectionErrors: {
    title: false,
    summary: false,
    difficulty: false,
    description: false,
    terms: false,
    tags: false,
    relevance: false,
    usecase: false,
    references: false,
  },
  touched: {},
  fieldValid: {},
};

const formValidationSlice = createSlice({
  name: 'formValidation',
  initialState,
  reducers: {
    // 필드 에러 설정
    setFieldError: (state, action: PayloadAction<{ field: FieldName; error: string | null }>) => {
      const { field, error } = action.payload;
      state.fieldErrors[field] = error;
    },

    // 여러 필드 에러 한번에 설정
    setFieldErrors: (state, action: PayloadAction<Partial<Record<FieldName, string | null>>>) => {
      state.fieldErrors = { ...state.fieldErrors, ...action.payload };
    },

    // 필드 touched 설정
    setFieldTouched: (state, action: PayloadAction<{ field: FieldName; touched: boolean }>) => {
      const { field, touched } = action.payload;
      state.touched[field] = touched;
    },

    // 필드 유효성 설정 (border-primary용)
    setFieldValid: (state, action: PayloadAction<{ field: FieldName; valid: boolean }>) => {
      const { field, valid } = action.payload;
      state.fieldValid[field] = valid;
    },

    // 여러 필드 유효성 한번에 설정
    setFieldValids: (state, action: PayloadAction<Partial<Record<FieldName, boolean>>>) => {
      state.fieldValid = { ...state.fieldValid, ...action.payload };
    },

    // 섹션 에러 설정
    setSectionError: (state, action: PayloadAction<{ section: SectionKey; hasError: boolean }>) => {
      const { section, hasError } = action.payload;
      state.sectionErrors[section] = hasError;
    },

    // 여러 섹션 에러 한번에 설정
    setSectionErrors: (state, action: PayloadAction<Partial<Record<SectionKey, boolean>>>) => {
      state.sectionErrors = { ...state.sectionErrors, ...action.payload };
    },

    // 특정 섹션의 모든 필드 touched 설정
    setSectionTouched: (state, action: PayloadAction<{ section: SectionKey; touched: boolean }>) => {
      const { section, touched } = action.payload;
      const fields = sectionRequiredFields[section];
      fields.forEach((field) => {
        state.touched[field] = touched;
      });
    },

    // 전체 validation 트리거 시 모든 필드 touched 처리
    setAllTouched: (state) => {
      requiredFields.forEach((field) => {
        state.touched[field] = true;
      });
    },

    // 상태 초기화
    resetValidation: () => initialState,

    // 특정 섹션 validation 상태만 초기화
    resetSectionValidation: (state, action: PayloadAction<SectionKey>) => {
      const section = action.payload;
      const fields = sectionRequiredFields[section];

      fields.forEach((field) => {
        state.fieldErrors[field] = null;
        state.touched[field] = false;
        state.fieldValid[field] = false;
      });

      state.sectionErrors[section] = false;
    },
  },
});

export const {
  setFieldError,
  setFieldErrors,
  setFieldTouched,
  setFieldValid,
  setFieldValids,
  setSectionError,
  setSectionErrors,
  setSectionTouched,
  setAllTouched,
  resetValidation,
  resetSectionValidation,
} = formValidationSlice.actions;

export default formValidationSlice.reducer;

