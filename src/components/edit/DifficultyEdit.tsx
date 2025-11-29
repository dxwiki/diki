import { TermData } from '@/types/database';
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setFieldTouched, setFieldValid } from '@/store/formValidationSlice';
import { isFieldEmpty, getFieldGuidance } from '@/utils/formValidation';
import CreateSlider from '@/components/ui/CreateSlider';

interface DifficultySectionProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  handleCustomChange?: (name: string, value: number)=> void;
  isModal?: boolean;
}

const DifficultySection = ({ formData, handleChange, handleCustomChange, isModal = false }: DifficultySectionProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const fieldValid = useSelector((state: RootState) => state.formValidation.fieldValid['difficulty.description']);
  const touched = useSelector((state: RootState) => state.formValidation.touched['difficulty.description']);

  const levels = ['기초', '초급', '중급', '고급', '전문'];

  // 슬라이더 상태는 1~5 범위 사용
  const [levelValue, setLevelValue] = useState<number>(formData.difficulty?.level || 1);
  const [userChangedLevel, setUserChangedLevel] = useState<boolean>(false);

  // enterKeyError는 컴포넌트 내부에서 관리
  const [enterKeyError, setEnterKeyError] = useState<boolean>(false);

  const isEmpty = isFieldEmpty(formData, 'difficulty.description');
  const guidance = getFieldGuidance('difficulty.description');

  const handleLevelChange = (newValue: number) => {
    setUserChangedLevel(true);

    if (handleCustomChange) {
      handleCustomChange('difficulty.level', newValue);
    } else {
      const event = {
        target: {
          name: 'difficulty.level',
          value: newValue,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      handleChange(event);
    }
    setLevelValue(newValue);
  };

  // formData가 변경될 때 슬라이더 값 업데이트
  useEffect(() => {
    setLevelValue(formData.difficulty?.level || 1);
  }, [formData.difficulty?.level]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);
    setEnterKeyError(false);

    // 실시간 유효성 체크 (touched가 true인 경우에만)
    if (touched) {
      const isValid = e.target.value.trim() !== '';
      dispatch(setFieldValid({ field: 'difficulty.description', valid: isValid }));
    }
  };

  const handleBlur = useCallback(() => {
    dispatch(setFieldTouched({ field: 'difficulty.description', touched: true }));

    // 유효성 체크
    const isValid = !isEmpty;
    dispatch(setFieldValid({ field: 'difficulty.description', valid: isValid }));
  }, [dispatch, isEmpty]);

  // Enter 키 입력 방지
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setEnterKeyError(true);
    }
  };

  // guidance 표시 조건
  const showGuidance = isEmpty && !enterKeyError;

  // border 클래스 결정
  const getBorderClass = () => {
    if (fieldValid) return 'border-primary';
    return 'border-gray4';
  };

  const containerClasses = isModal ? 'p-2' : 'p-2';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col sm:space-y-0 sm:grid sm:grid-cols-2 sm:space-x-6">
        <div>
          <label className="text-sm font-medium text-gray0">{'난이도'}</label>
          <div className="px-3">
            <CreateSlider
              displayLevels={levels}
              value={levelValue}
              onChange={handleLevelChange}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray0">{'난이도 설명'}</label>
          <textarea
            name="difficulty.description"
            value={formData.difficulty?.description || ''}
            className={`w-full p-2 border ${ getBorderClass() } text-main rounded-md transition-colors duration-200`}
            placeholder="난이도에 대한 설명을 작성하세요."
            onChange={handleDescriptionChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            rows={4}
            style={{ resize: 'none', height: '80px', minHeight: '80px', maxHeight: '80px', overflowY: 'auto' }}
          />
        </div>
        <p className={`text-sm text-level-5 !m-0 ${ !userChangedLevel ? 'opacity-100' : 'opacity-0' }`}>
          {'난이도를 선택해주세요.(기본값: 기초)'}
        </p>
        {enterKeyError ? (
          <p className="text-sm text-level-5 ml-1">{'난이도 설명에 줄바꿈을 추가할 수 없습니다.'}</p>
        ) : showGuidance ? (
          <p className="text-sm text-level-5 ml-1">{guidance}</p>
        ) : null}
      </div>
    </div>
  );
};

export default DifficultySection;
