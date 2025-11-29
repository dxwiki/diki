import { TermData } from '@/types/database';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setFieldError, setFieldTouched, setFieldValid } from '@/store/formValidationSlice';
import { validateField, isFieldEmpty, getFieldGuidance } from '@/utils/formValidation';

interface KoreanTitleEditProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  onEnterPress?: ()=> void;
}

const KoreanTitleEdit = ({ formData, handleChange, onEnterPress }: KoreanTitleEditProps) => {
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

    // 실시간 validation (입력 중에는 에러만 체크, touched가 true인 경우에만)
    if (touched) {
      const error = validateField(formData, 'title.ko', allowedCharsOnly);
      dispatch(setFieldError({ field: 'title.ko', error }));

      // 유효성 체크 (border-primary용)
      const isValid = allowedCharsOnly.trim() !== '' && !error;
      dispatch(setFieldValid({ field: 'title.ko', valid: isValid }));
    }

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
  };

  // 에러가 있으면 에러 표시, 없으면 빈 값일 때만 guidance 표시
  const showError = touched && fieldError;
  const showGuidance = isEmpty && !showError;

  // border 클래스 결정
  const getBorderClass = () => {
    if (showError) return 'border-level-5';
    if (fieldValid) return 'border-primary';
    return 'border-gray4';
  };

  return (
    <div className="p-2">
      <label className="block text-sm font-medium mb-1 text-gray0">{'한글 제목'}</label>
      <input
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
      ) : showGuidance ? (
        <p className="text-sm text-level-5 ml-1 mt-1">{guidance}</p>
      ) : null}
    </div>
  );
};

export default KoreanTitleEdit;
