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
    <div className="p-2 md:p-6 border-b border-gray4">
      <h2 className="flex items-center text-xl font-semibold mb-6">
        <span className="text-primary mr-1">{'#'}</span>
        {'직무 연관도'}
      </h2>

      {/* sm 이상에서는 3열 그리드, 그 이하에서는 세로 배치 */}
      <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-6">
        {/* 데이터 분석가 (DA) */}
        <div className="mb-6 sm:mb-0 flex flex-col">
          <div className="mb-2">
            <h3 className="text-lg font-medium">{'데이터 분석가 (DA)'}</h3>
            <div className="px-3 mb-3">
              <CreateSlider
                displayLevels={relevanceLevels}
                value={analystScore}
                onChange={handleAnalystChange}
              />
            </div>
          </div>
          <div className="grow">
            <label className="block text-sm font-medium mb-1">{'설명'}</label>
            <textarea
              name="relevance.analyst.description"
              value={formData.relevance?.analyst?.description || ''}
              onChange={handleChange}
              className="w-full min-h-[120px] p-2 border border-gray4 rounded-md"
              placeholder="데이터 분석가 직무와의 연관성에 대해 설명하세요"
              required
            />
          </div>
        </div>

        {/* 데이터 과학자 (DS) */}
        <div className="mb-6 sm:mb-0 flex flex-col">
          <div className="mb-2">
            <h3 className="text-lg font-medium">{'데이터 과학자 (DS)'}</h3>
            <div className="px-3 mb-3">
              <CreateSlider
                displayLevels={relevanceLevels}
                value={scientistScore}
                onChange={handleScientistChange}
              />
            </div>
          </div>
          <div className="grow">
            <label className="block text-sm font-medium mb-1">{'설명'}</label>
            <textarea
              name="relevance.scientist.description"
              value={formData.relevance?.scientist?.description || ''}
              onChange={handleChange}
              className="w-full min-h-[120px] p-2 border border-gray4 rounded-md"
              placeholder="데이터 과학자 직무와의 연관성에 대해 설명하세요"
              required
            />
          </div>
        </div>

        {/* 데이터 엔지니어 (DE) */}
        <div className="mb-6 sm:mb-0 flex flex-col">
          <div className="mb-2">
            <h3 className="text-lg font-medium">{'데이터 엔지니어 (DE)'}</h3>
            <div className="px-3 mb-3">
              <CreateSlider
                displayLevels={relevanceLevels}
                value={engineerScore}
                onChange={handleEngineerChange}
              />
            </div>
          </div>
          <div className="grow">
            <label className="block text-sm font-medium mb-1">{'설명'}</label>
            <textarea
              name="relevance.engineer.description"
              value={formData.relevance?.engineer?.description || ''}
              onChange={handleChange}
              className="w-full min-h-[120px] p-2 border border-gray4 rounded-md"
              placeholder="데이터 엔지니어 직무와의 연관성에 대해 설명하세요"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelevanceSection;