import { TermData } from '@/types/database';
import React, { useState, useEffect } from 'react';
import CreateSlider from '@/components/ui/CreateSlider';

interface DifficultySectionProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  handleCustomChange?: (name: string, value: number)=> void;
}

const DifficultySection = ({ formData, handleChange, handleCustomChange }: DifficultySectionProps) => {
  const levels = ['기초', '초급', '중급', '고급', '전문'];

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

  return (
    <div className="p-2 md:p-6 border-b border-gray3">
      <h2 className="flex items-center text-xl font-semibold mb-4">
        <span className="text-primary mr-1">{'#'}</span>
        {'난이도'}
      </h2>
      <div className="flex flex-col sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6">
        <div className="">
          <label className="text-sm font-medium text-gray0">{'레벨'}</label>
          <div className="px-3">
            <CreateSlider
              displayLevels={levels}
              value={levelValue}
              onChange={handleLevelChange}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}</label>
          <textarea
            name="difficulty.description"
            value={formData.difficulty?.description || ''}
            className="w-full p-2 border border-gray4 rounded-md h-20"
            placeholder="난이도에 대한 설명"
            required
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