import { TermData } from '@/types/database';
import React, { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setFieldError, setFieldTouched, setFieldValid } from '@/store/formValidationSlice';
import { validateField, isFieldEmpty, getFieldGuidance, getRequiredFieldError } from '@/utils/formValidation';

export interface ShortDescriptionEditHandle {
  focus: () => void;
}

interface ShortDescriptionEditProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  onEnterPress?: ()=> void;
  onTabToNext?: () => void;
  autoFocus?: boolean;
}

const ShortDescriptionEdit = forwardRef<ShortDescriptionEditHandle, ShortDescriptionEditProps>(({ formData, handleChange, onEnterPress, onTabToNext, autoFocus }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
  }));

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => textareaRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);
  const dispatch = useDispatch<AppDispatch>();
  const fieldError = useSelector((state: RootState) => state.formValidation.fieldErrors['description.short']);
  const fieldValid = useSelector((state: RootState) => state.formValidation.fieldValid['description.short']);
  const touched = useSelector((state: RootState) => state.formValidation.touched['description.short']);

  // enterKeyError는 컴포넌트 내부에서 관리
  const [enterKeyError, setEnterKeyError] = useState<boolean>(false);

  const isEmpty = isFieldEmpty(formData, 'description.short');
  const guidance = getFieldGuidance('description.short');

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;

    setEnterKeyError(false);

    // 실시간 validation
    const error = validateField(formData, 'description.short', value);

    // 빈 값이 아닐 때만 에러 설정
    if (value.trim() !== '') {
      dispatch(setFieldError({ field: 'description.short', error }));
    } else {
      dispatch(setFieldError({ field: 'description.short', error: null }));
    }

    // 실시간 유효성 체크 (touched와 무관하게)
    const isValid = value.trim() !== '' && !error;
    dispatch(setFieldValid({ field: 'description.short', valid: isValid }));

    handleChange(e);
  };

  const handleBlur = useCallback(() => {
    dispatch(setFieldTouched({ field: 'description.short', touched: true }));

    // 빈 값이면 에러 없음 (guidance만 표시)
    if (isEmpty) {
      dispatch(setFieldError({ field: 'description.short', error: null }));
      dispatch(setFieldValid({ field: 'description.short', valid: false }));
      return;
    }

    // validation 수행
    const error = validateField(formData, 'description.short');
    dispatch(setFieldError({ field: 'description.short', error }));

    // 유효성 체크
    const isValid = !isEmpty && !error;
    dispatch(setFieldValid({ field: 'description.short', valid: isValid }));
  }, [dispatch, formData, isEmpty]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;

    // Enter 키와 Shift+Enter 모두 방지
    if (e.key === 'Enter') {
      e.preventDefault();

      // onEnterPress가 있고 Shift 키가 없을 때만 다음 필드로 이동
      if (!e.shiftKey && onEnterPress) {
        onEnterPress();
      } else {
        setEnterKeyError(true);
      }
    }
    if (e.key === 'Tab' && !e.shiftKey && onTabToNext) {
      e.preventDefault();
      onTabToNext();
    }
  };

  // 빈 값이면 무조건 guidance만 표시, 아니면 에러가 있을 때만 에러 표시
  const showError = !isEmpty && touched && fieldError;
  const showGuidance = isEmpty && guidance && !enterKeyError;

  // border 클래스 결정
  const getBorderClass = () => {
    if (showError) return 'border-level-5';
    if (touched && !fieldValid) return 'border-level-5';
    if (fieldValid) return 'border-primary';
    return 'border-gray4';
  };

  return (
    <div className="p-2">
      <label className="block text-sm font-medium mb-1 text-gray0">{'짧은 설명'}<span className="text-level-5 text-xs ml-0.5">{'*'}</span></label>
      <div className="relative">
        <textarea
          ref={textareaRef}
          name="description.short"
          value={formData.description?.short || ''}
          onChange={handleTextareaChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full p-2 border ${ getBorderClass() } text-main rounded-md resize-none overflow-hidden focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200`}
          placeholder="포스트에 대한 간단한 설명을 작성하세요."
          maxLength={100}
          rows={2}
          style={{ height: '80px', minHeight: '80px', maxHeight: '80px', overflowY: 'auto' }}
        />
        <div className="absolute right-2 bottom-2 text-xs text-gray2">
          {`${ formData.description?.short?.length || 0 }/100`}
        </div>
      </div>
      {showError ? (
        <p className="text-sm text-level-5 ml-1">{fieldError}</p>
      ) : enterKeyError ? (
        <p className="text-sm text-level-5 ml-1">{'짧은 설명에 줄바꿈을 추가할 수 없습니다.'}</p>
      ) : touched && !fieldValid ? (
        <p className="text-sm text-level-5 ml-1">{getRequiredFieldError('description.short')}</p>
      ) : showGuidance ? (
        <p className="text-sm text-primary ml-1">{guidance}</p>
      ) : null}
    </div>
  );
});

ShortDescriptionEdit.displayName = 'ShortDescriptionEdit';

export default ShortDescriptionEdit;
