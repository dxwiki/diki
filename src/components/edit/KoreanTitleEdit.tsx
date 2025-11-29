import { TermData } from '@/types/database';
import React, { useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setFieldError, setFieldTouched, setFieldValid } from '@/store/formValidationSlice';
import { validateField, isFieldEmpty, getFieldGuidance, getRequiredFieldError } from '@/utils/formValidation';

export interface KoreanTitleEditHandle {
  focus: () => void;
}

interface KoreanTitleEditProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  onEnterPress?: ()=> void;
  onTabToNext?: () => void;
  autoFocus?: boolean;
}

const KoreanTitleEdit = forwardRef<KoreanTitleEditHandle, KoreanTitleEditProps>(({ formData, handleChange, onEnterPress, onTabToNext, autoFocus }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);
  const dispatch = useDispatch<AppDispatch>();
  const fieldError = useSelector((state: RootState) => state.formValidation.fieldErrors['title.ko']);
  const fieldValid = useSelector((state: RootState) => state.formValidation.fieldValid['title.ko']);
  const touched = useSelector((state: RootState) => state.formValidation.touched['title.ko']);

  const isEmpty = isFieldEmpty(formData, 'title.ko');
  const guidance = getFieldGuidance('title.ko');

  const handleKoreanTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // 한글, 영어, 별(*), 하이픈(-) 문자만 허용
    const allowedCharsOnly = value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s*-]/g, '');

    // 허용되지 않는 문자가 있었는지 체크
    const hasInvalidChars = value !== allowedCharsOnly;

    // 실시간 validation
    let error = validateField(formData, 'title.ko', allowedCharsOnly);

    // 허용되지 않는 문자가 있으면 에러 메시지 설정
    if (hasInvalidChars) {
      error = '한국어, 영어, 별(*), 하이픈(-) 외의 문자는 사용할 수 없습니다.';
    }

    // 에러 설정 (허용되지 않는 문자 에러 또는 validation 에러)
    if (hasInvalidChars || (allowedCharsOnly.trim() !== '' && error)) {
      dispatch(setFieldError({ field: 'title.ko', error }));
    } else {
      dispatch(setFieldError({ field: 'title.ko', error: null }));
    }

    // 실시간 유효성 체크 (touched와 무관하게)
    const isValid = allowedCharsOnly.trim() !== '' && !error;
    dispatch(setFieldValid({ field: 'title.ko', valid: isValid }));

    const filteredEvent = {
      target: {
        name: e.target.name,
        value: allowedCharsOnly,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    handleChange(filteredEvent);
  };

  const handleBlur = useCallback(() => {
    dispatch(setFieldTouched({ field: 'title.ko', touched: true }));

    // 빈 값이면 에러 없음 (guidance만 표시)
    if (isEmpty) {
      dispatch(setFieldError({ field: 'title.ko', error: null }));
      dispatch(setFieldValid({ field: 'title.ko', valid: false }));
      return;
    }

    // validation 수행
    const error = validateField(formData, 'title.ko');
    dispatch(setFieldError({ field: 'title.ko', error }));

    // 유효성 체크
    const isValid = !isEmpty && !error;
    dispatch(setFieldValid({ field: 'title.ko', valid: isValid }));
  }, [dispatch, formData, isEmpty]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && onEnterPress) {
      e.preventDefault();
      onEnterPress();
    }
    if (e.key === 'Tab' && !e.shiftKey && onTabToNext) {
      e.preventDefault();
      onTabToNext();
    }
  };

  // 에러가 있으면 에러 표시 (touched 여부와 무관하게 즉시 표시)
  // 빈 값이고 에러가 없으면 guidance 표시
  const showError = fieldError;
  const showGuidance = isEmpty && !fieldError && guidance;

  // border 클래스 결정
  const getBorderClass = () => {
    if (showError) return 'border-level-5';
    if (touched && !fieldValid) return 'border-level-5';
    if (fieldValid) return 'border-primary';
    return 'border-gray4';
  };

  return (
    <div className="p-2">
      <label className="block text-sm font-medium mb-1 text-gray0">{'한글 제목'}<span className="text-level-5 text-xs ml-0.5">{'*'}</span></label>
      <input
        ref={inputRef}
        type="text"
        name="title.ko"
        value={formData.title?.ko || ''}
        onChange={handleKoreanTitleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full p-2 border ${ getBorderClass() } text-main rounded-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200`}
        placeholder="포스트 한글 제목 (ex. 인공지능)"
      />
      {showError ? (
        <p className="text-sm text-level-5 ml-1 mt-1">{fieldError}</p>
      ) : touched && !fieldValid ? (
        <p className="text-sm text-level-5 ml-1 mt-1">{getRequiredFieldError('title.ko')}</p>
      ) : showGuidance ? (
        <p className="text-sm text-primary ml-1 mt-1">{guidance}</p>
      ) : null}
    </div>
  );
});

KoreanTitleEdit.displayName = 'KoreanTitleEdit';

export default KoreanTitleEdit;
