import { TermData } from '@/types/database';
import React, { useState, useEffect } from 'react';
import CreateSlider from '@/components/ui/CreateSlider';

interface DifficultySectionProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  handleCustomChange?: (name: string, value: number)=> void;
  isModal?: boolean;
}

const DifficultySection = ({ formData, handleChange, handleCustomChange, isModal = false }: DifficultySectionProps) => {
  const levels = ['기초', '초급', '중급', '고급', '전문'];

  // 슬라이더 상태는 1~5 범위 사용
  const [levelValue, setLevelValue] = useState<number>(formData.difficulty?.level || 1);
  const [userChangedLevel, setUserChangedLevel] = useState<boolean>(false);
  const [showDescGuidance, setShowDescGuidance] = useState<boolean>(true);
  const [enterKeyError, setEnterKeyError] = useState<boolean>(false);

  const handleLevelChange = (newValue: number) => {
    setUserChangedLevel(true);

    if (handleCustomChange) {
      // 커스텀 핸들러가 있는 경우 이를 사용
      handleCustomChange('difficulty.level', newValue);
    } else {
      // 기존 방식으로 이벤트 시뮬레이션
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

  useEffect(() => {
    if (formData.difficulty?.description && formData.difficulty.description.trim() !== '') {
      setShowDescGuidance(false);
    } else {
      setShowDescGuidance(true);
    }
  }, [formData.difficulty?.description]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);

    if (e.target.value.trim() !== '') {
      setShowDescGuidance(false);
    } else {
      setShowDescGuidance(true);
    }

    setEnterKeyError(false);
  };

  // Enter 키 입력 방지
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setEnterKeyError(true);
    }
  };

  const containerClasses = isModal
    ? 'p-2'
    : 'p-2';

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
            className="w-full p-2 border border-gray4 text-main rounded-md"
            placeholder="난이도에 대한 설명을 작성하세요."
            onChange={handleDescriptionChange}
            onKeyDown={handleKeyDown}
            rows={4}
            style={{ resize: 'none', height: '80px', minHeight: '80px', maxHeight: '80px', overflowY: 'auto' }}
          />
        </div>
        <p className={`text-sm text-level-5 !m-0 ${ !userChangedLevel ? 'opacity-100' : 'opacity-0' }`}>{'난이도를 선택해주세요.(기본값: 기초)'}</p>
        {enterKeyError ? (
          <p className="text-sm text-primary ml-1">{'난이도 설명에 줄바꿈을 추가할 수 없습니다.'}</p>
        ) : showDescGuidance ? (
          <p className="text-sm text-level-5 ml-1">{'난이도 설명을 작성해주세요.'}</p>
        ) : null}
      </div>
    </div>
  );
};

export default DifficultySection;