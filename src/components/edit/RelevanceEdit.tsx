import { TermData } from '@/types/database';
import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setFieldTouched, setFieldValid } from '@/store/formValidationSlice';
import { isFieldEmpty, getFieldGuidance, getRequiredFieldError } from '@/utils/formValidation';
import CreateSlider from '@/components/ui/CreateSlider';

export interface RelevanceEditHandle {
  focus: () => void;
}

interface RelevanceSectionProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  handleCustomChange?: (name: string, value: number)=> void;
  onTabToNext?: () => void;
  autoFocus?: boolean;
}

const RelevanceSection = forwardRef<RelevanceEditHandle, RelevanceSectionProps>(({ formData, handleChange, handleCustomChange, onTabToNext, autoFocus }, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const analystValid = useSelector((state: RootState) => state.formValidation.fieldValid['relevance.analyst.description']);
  const engineerValid = useSelector((state: RootState) => state.formValidation.fieldValid['relevance.engineer.description']);
  const scientistValid = useSelector((state: RootState) => state.formValidation.fieldValid['relevance.scientist.description']);
  const analystTouched = useSelector((state: RootState) => state.formValidation.touched['relevance.analyst.description']);
  const engineerTouched = useSelector((state: RootState) => state.formValidation.touched['relevance.engineer.description']);
  const scientistTouched = useSelector((state: RootState) => state.formValidation.touched['relevance.scientist.description']);

  const relevanceLevels = ['희박', '낮음', '보통', '높음', '밀접'];

  // 각 직무별 슬라이더 값 상태 관리 (1~5 범위 사용)
  const [analystScore, setAnalystScore] = useState<number>(formData.relevance?.analyst?.score || 1);
  const [engineerScore, setEngineerScore] = useState<number>(formData.relevance?.engineer?.score || 1);
  const [scientistScore, setScientistScore] = useState<number>(formData.relevance?.scientist?.score || 1);

  // 슬라이더 값 변경 여부 상태
  const [userChangedAnalyst, setUserChangedAnalyst] = useState<boolean>(false);
  const [userChangedEngineer, setUserChangedEngineer] = useState<boolean>(false);
  const [userChangedScientist, setUserChangedScientist] = useState<boolean>(false);

  // Enter 키 에러 상태 (컴포넌트 내부에서 관리)
  const [analystEnterError, setAnalystEnterError] = useState<boolean>(false);
  const [engineerEnterError, setEngineerEnterError] = useState<boolean>(false);
  const [scientistEnterError, setScientistEnterError] = useState<boolean>(false);

  // textarea refs
  const analystTextareaRef = useRef<HTMLTextAreaElement>(null);
  const scientistTextareaRef = useRef<HTMLTextAreaElement>(null);
  const engineerTextareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => analystTextareaRef.current?.focus(),
  }));

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => analystTextareaRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const analystEmpty = isFieldEmpty(formData, 'relevance.analyst.description');
  const engineerEmpty = isFieldEmpty(formData, 'relevance.engineer.description');
  const scientistEmpty = isFieldEmpty(formData, 'relevance.scientist.description');
  const guidance = getFieldGuidance('relevance.analyst.description');

  // 슬라이더 값 변경 핸들러 함수들
  const handleAnalystChange = (newValue: number) => {
    setUserChangedAnalyst(true);

    if (handleCustomChange) {
      handleCustomChange('relevance.analyst.score', newValue);
    } else {
      const event = {
        target: {
          name: 'relevance.analyst.score',
          value: newValue,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      handleChange(event);
    }
    setAnalystScore(newValue);
  };

  const handleEngineerChange = (newValue: number) => {
    setUserChangedEngineer(true);

    if (handleCustomChange) {
      handleCustomChange('relevance.engineer.score', newValue);
    } else {
      const event = {
        target: {
          name: 'relevance.engineer.score',
          value: newValue,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      handleChange(event);
    }
    setEngineerScore(newValue);
  };

  const handleScientistChange = (newValue: number) => {
    setUserChangedScientist(true);

    if (handleCustomChange) {
      handleCustomChange('relevance.scientist.score', newValue);
    } else {
      const event = {
        target: {
          name: 'relevance.scientist.score',
          value: newValue,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      handleChange(event);
    }
    setScientistScore(newValue);
  };

  // 텍스트 영역 변경 핸들러 함수들
  const handleAnalystDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);
    setAnalystEnterError(false);

    // 실시간 유효성 체크 (touched와 무관하게)
    const isValid = e.target.value.trim() !== '';
    dispatch(setFieldValid({ field: 'relevance.analyst.description', valid: isValid }));
  };

  const handleEngineerDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);
    setEngineerEnterError(false);

    // 실시간 유효성 체크 (touched와 무관하게)
    const isValid = e.target.value.trim() !== '';
    dispatch(setFieldValid({ field: 'relevance.engineer.description', valid: isValid }));
  };

  const handleScientistDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);
    setScientistEnterError(false);

    // 실시간 유효성 체크 (touched와 무관하게)
    const isValid = e.target.value.trim() !== '';
    dispatch(setFieldValid({ field: 'relevance.scientist.description', valid: isValid }));
  };

  // blur 핸들러
  const handleAnalystBlur = useCallback(() => {
    dispatch(setFieldTouched({ field: 'relevance.analyst.description', touched: true }));
    dispatch(setFieldValid({ field: 'relevance.analyst.description', valid: !analystEmpty }));
  }, [dispatch, analystEmpty]);

  const handleEngineerBlur = useCallback(() => {
    dispatch(setFieldTouched({ field: 'relevance.engineer.description', touched: true }));
    dispatch(setFieldValid({ field: 'relevance.engineer.description', valid: !engineerEmpty }));
  }, [dispatch, engineerEmpty]);

  const handleScientistBlur = useCallback(() => {
    dispatch(setFieldTouched({ field: 'relevance.scientist.description', touched: true }));
    dispatch(setFieldValid({ field: 'relevance.scientist.description', valid: !scientistEmpty }));
  }, [dispatch, scientistEmpty]);

  // Enter 키 입력 방지 핸들러들
  const handleAnalystKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setAnalystEnterError(true);
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      scientistTextareaRef.current?.focus();
    }
  };

  const handleEngineerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setEngineerEnterError(true);
    }
    if (e.key === 'Tab' && !e.shiftKey && onTabToNext) {
      e.preventDefault();
      onTabToNext();
    }
  };

  const handleScientistKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setScientistEnterError(true);
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      engineerTextareaRef.current?.focus();
    }
  };

  // formData가 변경될 때 슬라이더 값 업데이트
  useEffect(() => {
    setAnalystScore(formData.relevance?.analyst?.score || 1);
    setEngineerScore(formData.relevance?.engineer?.score || 1);
    setScientistScore(formData.relevance?.scientist?.score || 1);
  }, [formData.relevance?.analyst?.score, formData.relevance?.engineer?.score, formData.relevance?.scientist?.score]);

  // border 클래스 결정
  const getAnalystBorderClass = () => {
    if (analystTouched && !analystValid) return 'border-level-5';
    if (analystValid) return 'border-primary';
    return 'border-gray4';
  };

  const getEngineerBorderClass = () => {
    if (engineerTouched && !engineerValid) return 'border-level-5';
    if (engineerValid) return 'border-primary';
    return 'border-gray4';
  };

  const getScientistBorderClass = () => {
    if (scientistTouched && !scientistValid) return 'border-level-5';
    if (scientistValid) return 'border-primary';
    return 'border-gray4';
  };

  // 빈 값이면 무조건 guidance만 표시
  const showAnalystGuidance = analystEmpty && guidance && !analystEnterError;
  const showEngineerGuidance = engineerEmpty && guidance && !engineerEnterError;
  const showScientistGuidance = scientistEmpty && guidance && !scientistEnterError;

  return (
    <div className="p-2">
      {/* sm 이상에서는 3열 그리드, 그 이하에서는 세로 배치 */}
      <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-6">
        {/* 데이터 분석가 (DA) */}
        <div className="border-b border-gray4 pb-4 sm:pb-0 sm:border-0 mb-4 sm:mb-0 flex flex-col">
          <div className="">
            <h3 className="text-base font-medium text-gray0">{'데이터 분석가 (DA)'}</h3>
            <div className="px-3 mb-3">
              <CreateSlider
                displayLevels={relevanceLevels}
                value={analystScore}
                onChange={handleAnalystChange}
              />
              <p className={`text-sm text-primary !ml-[-12px] ${ !userChangedAnalyst ? 'opacity-100' : 'opacity-0' }`}>
                {'연관도를 선택해주세요.(기본값: 희박)'}
              </p>
            </div>
          </div>
          <div className="grow">
            <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}<span className="text-level-5 text-xs ml-0.5">{'*'}</span></label>
            <textarea
              ref={analystTextareaRef}
              name="relevance.analyst.description"
              value={formData.relevance?.analyst?.description || ''}
              onChange={handleAnalystDescChange}
              onBlur={handleAnalystBlur}
              onKeyDown={handleAnalystKeyDown}
              className={`w-full p-2 border ${ getAnalystBorderClass() } text-main rounded-md transition-colors duration-200`}
              placeholder="데이터 분석가의 연관성에 대해 작성하세요."
              rows={4}
              style={{ resize: 'none', height: '120px', minHeight: '120px', maxHeight: '120px', overflowY: 'auto' }}
            />
            {analystEnterError ? (
              <p className="text-sm text-level-5 mt-1">{'줄바꿈을 추가할 수 없습니다.'}</p>
            ) : analystTouched && !analystValid ? (
              <p className="text-sm text-level-5 mt-1">{getRequiredFieldError('relevance.analyst.description')}</p>
            ) : showAnalystGuidance ? (
              <p className="text-sm text-primary mt-1">{guidance}</p>
            ) : null}
          </div>
        </div>

        {/* 데이터 과학자 (DS) */}
        <div className="border-b border-gray4 pb-4 sm:pb-0 sm:border-0 mb-4 sm:mb-0 flex flex-col">
          <div className="">
            <h3 className="text-base font-medium text-gray0">{'데이터 과학자 (DS)'}</h3>
            <div className="px-3 mb-3">
              <CreateSlider
                displayLevels={relevanceLevels}
                value={scientistScore}
                onChange={handleScientistChange}
              />
              <p className={`text-sm text-primary !ml-[-12px] ${ !userChangedScientist ? 'opacity-100' : 'opacity-0' }`}>
                {'연관도를 선택해주세요.(기본값: 희박)'}
              </p>
            </div>
          </div>
          <div className="grow">
            <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}<span className="text-level-5 text-xs ml-0.5">{'*'}</span></label>
            <textarea
              ref={scientistTextareaRef}
              name="relevance.scientist.description"
              value={formData.relevance?.scientist?.description || ''}
              onChange={handleScientistDescChange}
              onBlur={handleScientistBlur}
              onKeyDown={handleScientistKeyDown}
              className={`w-full p-2 border ${ getScientistBorderClass() } text-main rounded-md transition-colors duration-200`}
              placeholder="데이터 과학자의 연관성에 대해 작성하세요."
              rows={4}
              style={{ resize: 'none', height: '120px', minHeight: '120px', maxHeight: '120px', overflowY: 'auto' }}
            />
            {scientistEnterError ? (
              <p className="text-sm text-level-5 mt-1">{'줄바꿈을 추가할 수 없습니다.'}</p>
            ) : scientistTouched && !scientistValid ? (
              <p className="text-sm text-level-5 mt-1">{getRequiredFieldError('relevance.scientist.description')}</p>
            ) : showScientistGuidance ? (
              <p className="text-sm text-primary mt-1">{guidance}</p>
            ) : null}
          </div>
        </div>

        {/* 데이터 엔지니어 (DE) */}
        <div className="border-b border-gray4 pb-4 sm:pb-0 sm:border-0 mb-4 sm:mb-0 flex flex-col">
          <div className="">
            <h3 className="text-base font-medium text-gray0">{'데이터 엔지니어 (DE)'}</h3>
            <div className="px-3 mb-3">
              <CreateSlider
                displayLevels={relevanceLevels}
                value={engineerScore}
                onChange={handleEngineerChange}
              />
              <p className={`text-sm text-primary !ml-[-12px] ${ !userChangedEngineer ? 'opacity-100' : 'opacity-0' }`}>
                {'연관도를 선택해주세요.(기본값: 희박)'}
              </p>
            </div>
          </div>
          <div className="grow">
            <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}<span className="text-level-5 text-xs ml-0.5">{'*'}</span></label>
            <textarea
              ref={engineerTextareaRef}
              name="relevance.engineer.description"
              value={formData.relevance?.engineer?.description || ''}
              onChange={handleEngineerDescChange}
              onBlur={handleEngineerBlur}
              onKeyDown={handleEngineerKeyDown}
              className={`w-full p-2 border ${ getEngineerBorderClass() } text-main rounded-md transition-colors duration-200`}
              placeholder="데이터 엔지니어의 연관성에 대해 작성하세요."
              rows={4}
              style={{ resize: 'none', height: '120px', minHeight: '120px', maxHeight: '120px', overflowY: 'auto' }}
            />
            {engineerEnterError ? (
              <p className="text-sm text-level-5 mt-1">{'줄바꿈을 추가할 수 없습니다.'}</p>
            ) : engineerTouched && !engineerValid ? (
              <p className="text-sm text-level-5 mt-1">{getRequiredFieldError('relevance.engineer.description')}</p>
            ) : showEngineerGuidance ? (
              <p className="text-sm text-primary mt-1">{guidance}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
});

RelevanceSection.displayName = 'RelevanceSection';

export default RelevanceSection;
