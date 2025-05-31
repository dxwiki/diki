import { TermData } from '@/types/database';
import React, { useState, useEffect } from 'react';
import CreateSlider from '@/components/ui/CreateSlider';
import { useFormValidation, InputFeedback } from './ValidatedInput';

interface DifficultySectionProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  handleCustomChange?: (name: string, value: number)=> void;
  validationErrors?: string[];
  isModal?: boolean;
}

const DifficultySection = ({ formData, handleChange, handleCustomChange, validationErrors = [], isModal = false }: DifficultySectionProps) => {
  const levels = ['기초', '초급', '중급', '고급', '전문'];
  const { getInputClassName, showValidation } = useFormValidation();

  // 특정 필드에 대한 유효성 검사 오류 찾기
  const getFieldError = (fieldName: string) => {
    return validationErrors.find((err) => err.includes(fieldName));
  };

  // 슬라이더 상태는 1~5 범위 사용
  const [levelValue, setLevelValue] = useState<number>(formData.difficulty?.level || 1);

  const handleLevelChange = (newValue: number) => {
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

  const containerClasses = isModal
    ? 'p-2'
    : 'p-2';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6">
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
            className={getInputClassName(formData.difficulty?.description)}
            placeholder="난이도에 대한 설명"
            required
            onChange={(e) => {
              handleChange(e);
              e.target.style.height = 'auto';
              e.target.style.height = `calc(${ e.target.scrollHeight }px + 1rem)`;
            }}
          />
          <InputFeedback
            value={formData.difficulty?.description}
            errorMessage={getFieldError('난이도 설명') || '난이도 설명을 입력하세요.'}
            showValidation={showValidation}
          />
        </div>
      </div>
    </div>
  );
};

export default DifficultySection;