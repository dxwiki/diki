import { TermData } from '@/types/database';
import React, { useState, useEffect } from 'react';
import CreateSlider from '@/components/ui/CreateSlider';

interface RelevanceSectionProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  handleCustomChange?: (name: string, value: number)=> void;
}

const RelevanceSection = ({ formData, handleChange, handleCustomChange }: RelevanceSectionProps) => {
  const relevanceLevels = ['희박', '낮음', '보통', '높음', '밀접'];

  // 각 직무별 슬라이더 값 상태 관리 (1~5 범위 사용)
  const [analystScore, setAnalystScore] = useState<number>(formData.relevance?.analyst?.score || 1);
  const [engineerScore, setEngineerScore] = useState<number>(formData.relevance?.engineer?.score || 1);
  const [scientistScore, setScientistScore] = useState<number>(formData.relevance?.scientist?.score || 1);

  // 슬라이더 값 변경 핸들러 함수들
  const handleAnalystChange = (newValue: number) => {
    if (handleCustomChange) {
      // 커스텀 핸들러가 있는 경우 이를 사용
      handleCustomChange('relevance.analyst.score', newValue);
    } else {
      // 기존 방식으로 이벤트 시뮬레이션
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

  // formData가 변경될 때 슬라이더 값 업데이트
  useEffect(() => {
    setAnalystScore(formData.relevance?.analyst?.score || 1);
    setEngineerScore(formData.relevance?.engineer?.score || 1);
    setScientistScore(formData.relevance?.scientist?.score || 1);
  }, [formData.relevance?.analyst?.score, formData.relevance?.engineer?.score, formData.relevance?.scientist?.score]);

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
            </div>
          </div>
          <div className="grow">
            <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}</label>
            <textarea
              name="relevance.analyst.description"
              value={formData.relevance?.analyst?.description || ''}
              onChange={(e) => {
                handleChange(e);
                e.target.style.height = 'auto';
                e.target.style.height = `calc(${ e.target.scrollHeight }px + 1rem)`;
              }}
              className="w-full min-h-[120px] p-2 border border-gray4 text-main rounded-md"
              placeholder="데이터 분석가의 연관성에 대해 작성하세요."
            />
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
            </div>
          </div>
          <div className="grow">
            <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}</label>
            <textarea
              name="relevance.scientist.description"
              value={formData.relevance?.scientist?.description || ''}
              onChange={(e) => {
                handleChange(e);
                e.target.style.height = 'auto';
                e.target.style.height = `calc(${ e.target.scrollHeight }px + 1rem)`;
              }}
              className="w-full min-h-[120px] p-2 border border-gray4 text-main rounded-md"
              placeholder="데이터 과학자의 연관성에 대해 작성하세요."
            />
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
            </div>
          </div>
          <div className="grow">
            <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}</label>
            <textarea
              name="relevance.engineer.description"
              value={formData.relevance?.engineer?.description || ''}
              onChange={(e) => {
                handleChange(e);
                e.target.style.height = 'auto';
                e.target.style.height = `calc(${ e.target.scrollHeight }px + 1rem)`;
              }}
              className="w-full min-h-[120px] p-2 border border-gray4 text-main rounded-md"
              placeholder="데이터 엔지니어의 연관성에 대해 작성하세요."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelevanceSection;