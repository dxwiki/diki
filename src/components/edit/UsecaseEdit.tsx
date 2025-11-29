import { TermData } from '@/types/database';
import React, { useState, KeyboardEvent, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setFieldTouched, setFieldValid } from '@/store/formValidationSlice';
import { isFieldEmpty, getFieldGuidance } from '@/utils/formValidation';
import { X } from 'lucide-react';

export interface UsecaseEditHandle {
  focus: () => void;
}

interface UsecaseSectionProps {
  formData: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  onTabToNext?: () => void;
  autoFocus?: boolean;
}

const UsecaseSection = forwardRef<UsecaseEditHandle, UsecaseSectionProps>(({ formData, setFormData, handleChange, onTabToNext, autoFocus }, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const descriptionValid = useSelector((state: RootState) => state.formValidation.fieldValid['usecase.description']);
  const exampleValid = useSelector((state: RootState) => state.formValidation.fieldValid['usecase.example']);
  const descriptionTouched = useSelector((state: RootState) => state.formValidation.touched['usecase.description']);
  const exampleTouched = useSelector((state: RootState) => state.formValidation.touched['usecase.example']);

  const [newIndustry, setNewIndustry] = useState('');
  const [descEnterError, setDescEnterError] = useState<boolean>(false);
  const [exampleEnterError, setExampleEnterError] = useState<boolean>(false);

  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const exampleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const industryInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => descriptionTextareaRef.current?.focus(),
  }));

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => descriptionTextareaRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const descriptionEmpty = isFieldEmpty(formData, 'usecase.description');
  const exampleEmpty = isFieldEmpty(formData, 'usecase.example');
  const descriptionGuidance = getFieldGuidance('usecase.description');
  const exampleGuidance = getFieldGuidance('usecase.example');

  const handleAddIndustry = () => {
    if (newIndustry.trim()) {
      setFormData((prev) => ({
        ...prev,
        usecase: {
          ...prev.usecase,
          industries: [...(prev.usecase?.industries || []), newIndustry],
        },
      }));
      setNewIndustry('');
    }
  };


  const handleRemoveIndustry = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      usecase: {
        ...prev.usecase,
        industries: (prev.usecase?.industries || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);
    setDescEnterError(false);

    // 실시간 유효성 체크 (touched와 무관하게)
    const isValid = e.target.value.trim() !== '';
    dispatch(setFieldValid({ field: 'usecase.description', valid: isValid }));
  };

  const handleExampleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);
    setExampleEnterError(false);

    // 실시간 유효성 체크 (touched와 무관하게)
    const isValid = e.target.value.trim() !== '';
    dispatch(setFieldValid({ field: 'usecase.example', valid: isValid }));
  };

  // blur 핸들러
  const handleDescriptionBlur = useCallback(() => {
    dispatch(setFieldTouched({ field: 'usecase.description', touched: true }));
    dispatch(setFieldValid({ field: 'usecase.description', valid: !descriptionEmpty }));
  }, [dispatch, descriptionEmpty]);

  const handleExampleBlur = useCallback(() => {
    dispatch(setFieldTouched({ field: 'usecase.example', touched: true }));
    dispatch(setFieldValid({ field: 'usecase.example', valid: !exampleEmpty }));
  }, [dispatch, exampleEmpty]);

  // Enter 키 입력 방지 핸들러
  const handleDescKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setDescEnterError(true);
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      exampleTextareaRef.current?.focus();
    }
  };

  const handleExampleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setExampleEnterError(true);
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      industryInputRef.current?.focus();
    }
  };

  const handleIndustryKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIndustry();
    }
    if (e.key === 'Tab' && !e.shiftKey && onTabToNext) {
      e.preventDefault();
      onTabToNext();
    }
  };

  // border 클래스 결정
  const getDescriptionBorderClass = () => {
    if (descriptionTouched && !descriptionValid) return 'border-level-5';
    if (descriptionValid) return 'border-primary';
    return 'border-gray4';
  };

  const getExampleBorderClass = () => {
    if (exampleTouched && !exampleValid) return 'border-level-5';
    if (exampleValid) return 'border-primary';
    return 'border-gray4';
  };

  // 빈 값이면 무조건 guidance만 표시
  const showDescGuidance = descriptionEmpty && descriptionGuidance && !descEnterError;
  const showExampleGuidance = exampleEmpty && exampleGuidance && !exampleEnterError;

  return (
    <div className="p-2">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray0">{'개요'}<span className="text-primary text-xs ml-0.5">{'*'}</span></label>
        <textarea
          ref={descriptionTextareaRef}
          name="usecase.description"
          value={formData.usecase?.description || ''}
          onChange={handleDescriptionChange}
          onBlur={handleDescriptionBlur}
          onKeyDown={handleDescKeyDown}
          className={`w-full p-2 border ${ getDescriptionBorderClass() } text-main rounded-md transition-colors duration-200`}
          placeholder="포스트 내용의 사용 사례에 대한 개요를 작성하세요."
          rows={4}
          style={{ resize: 'none', height: '80px', minHeight: '80px', maxHeight: '80px', overflowY: 'auto' }}
        />
        {descEnterError ? (
          <p className="text-sm text-level-5">{'사용 사례 개요에 줄바꿈을 추가할 수 없습니다.'}</p>
        ) : descriptionTouched && !descriptionValid ? (
          <p className="text-sm text-level-5">{descriptionGuidance}</p>
        ) : showDescGuidance ? (
          <p className="text-sm text-sub">{descriptionGuidance}</p>
        ) : null}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray0">{'사례'}<span className="text-primary text-xs ml-0.5">{'*'}</span></label>
        <textarea
          ref={exampleTextareaRef}
          name="usecase.example"
          value={formData.usecase?.example || ''}
          onChange={handleExampleChange}
          onBlur={handleExampleBlur}
          onKeyDown={handleExampleKeyDown}
          className={`w-full p-2 border ${ getExampleBorderClass() } text-main rounded-md transition-colors duration-200`}
          placeholder="구체적인 사용 사례를 작성하세요."
          rows={4}
          style={{ resize: 'none', height: '80px', minHeight: '80px', maxHeight: '80px', overflowY: 'auto' }}
        />
        {exampleEnterError ? (
          <p className="text-sm text-level-5">{'사용 사례에 줄바꿈을 추가할 수 없습니다.'}</p>
        ) : exampleTouched && !exampleValid ? (
          <p className="text-sm text-level-5">{exampleGuidance}</p>
        ) : showExampleGuidance ? (
          <p className="text-sm text-sub">{exampleGuidance}</p>
        ) : null}
      </div>

      <div className="mb-1">
        <label className="block text-sm font-medium mb-1 text-gray0">{'관련 산업 분야 (선택)'}</label>
        <div className="flex items-end space-x-2 mb-2">
          <div className="flex-1">
            <input
              ref={industryInputRef}
              type="text"
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              onKeyDown={handleIndustryKeyDown}
              className="w-full p-2 border border-gray4 rounded-md text-main truncate"
              placeholder="산업 분야 (ex. 모든 산업 분야, 의료, 금융, 제조, 교통, 교육, 보안, 리테일, 에너지, 농업 등)"
            />
          </div>
          <button
            type="button"
            onClick={handleAddIndustry}
            className="px-4 py-2 text-main border border-gray4 bg-gray4 hover:text-white hover:bg-gray3 rounded-md"
          >
            {'추가'}
          </button>
        </div>
        <p className="text-sm text-gray2 mb-2">
          {'Enter 키 또는 [추가] 버튼을 눌러 산업 분야를 추가할 수 있습니다.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {formData.usecase?.industries?.map((industry, index) => (
          <div key={index} className="bg-gray5 border border-gray4 rounded-lg px-3 py-1 flex items-center">
            <span>{industry}</span>
            <button
              type="button"
              onClick={() => handleRemoveIndustry(index)}
              className="ml-2 text-level-5"
            >
              <X className="size-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

UsecaseSection.displayName = 'UsecaseSection';

export default UsecaseSection;
