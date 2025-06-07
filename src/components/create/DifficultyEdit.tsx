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

  const handleLevelChange = (newValue: number) => {
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
            className="w-full p-2 border border-gray4 text-main rounded-md"
            placeholder="난이도에 대한 설명을 작성하세요."
            onChange={(e) => {
              handleChange(e);
              e.target.style.height = 'auto';
              e.target.style.height = `calc(${ e.target.scrollHeight }px + 1rem)`;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DifficultySection;