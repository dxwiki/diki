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

  // 슬라이더 값 변경 여부 상태
  const [userChangedAnalyst, setUserChangedAnalyst] = useState<boolean>(false);
  const [userChangedEngineer, setUserChangedEngineer] = useState<boolean>(false);
  const [userChangedScientist, setUserChangedScientist] = useState<boolean>(false);

  // 설명 입력 여부 상태
  const [showAnalystGuidance, setShowAnalystGuidance] = useState<boolean>(true);
  const [showEngineerGuidance, setShowEngineerGuidance] = useState<boolean>(true);
  const [showScientistGuidance, setShowScientistGuidance] = useState<boolean>(true);

  // Enter 키 에러 상태
  const [analystEnterError, setAnalystEnterError] = useState<boolean>(false);
  const [engineerEnterError, setEngineerEnterError] = useState<boolean>(false);
  const [scientistEnterError, setScientistEnterError] = useState<boolean>(false);

  // 슬라이더 값 변경 핸들러 함수들
  const handleAnalystChange = (newValue: number) => {
    setUserChangedAnalyst(true);

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

    if (e.target.value.trim() !== '') {
      setShowAnalystGuidance(false);
    } else {
      setShowAnalystGuidance(true);
    }

    setAnalystEnterError(false);
  };

  const handleEngineerDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);

    if (e.target.value.trim() !== '') {
      setShowEngineerGuidance(false);
    } else {
      setShowEngineerGuidance(true);
    }

    setEngineerEnterError(false);
  };

  const handleScientistDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);

    if (e.target.value.trim() !== '') {
      setShowScientistGuidance(false);
    } else {
      setShowScientistGuidance(true);
    }

    setScientistEnterError(false);
  };

  // Enter 키 입력 방지 핸들러들
  const handleAnalystKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setAnalystEnterError(true);
    }
  };

  const handleEngineerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setEngineerEnterError(true);
    }
  };

  const handleScientistKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setScientistEnterError(true);
    }
  };

  // formData가 변경될 때 슬라이더 값 업데이트
  useEffect(() => {
    setAnalystScore(formData.relevance?.analyst?.score || 1);
    setEngineerScore(formData.relevance?.engineer?.score || 1);
    setScientistScore(formData.relevance?.scientist?.score || 1);
  }, [formData.relevance?.analyst?.score, formData.relevance?.engineer?.score, formData.relevance?.scientist?.score]);

  // 설명 입력 여부에 따라 안내 메시지 표시 여부 결정
  useEffect(() => {
    if (formData.relevance?.analyst?.description && formData.relevance.analyst.description.trim() !== '') {
      setShowAnalystGuidance(false);
    } else {
      setShowAnalystGuidance(true);
    }

    if (formData.relevance?.engineer?.description && formData.relevance.engineer.description.trim() !== '') {
      setShowEngineerGuidance(false);
    } else {
      setShowEngineerGuidance(true);
    }

    if (formData.relevance?.scientist?.description && formData.relevance.scientist.description.trim() !== '') {
      setShowScientistGuidance(false);
    } else {
      setShowScientistGuidance(true);
    }
  }, [formData.relevance?.analyst?.description, formData.relevance?.engineer?.description, formData.relevance?.scientist?.description]);

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
              <p className={`text-sm text-level-5 !ml-[-12px] ${ !userChangedAnalyst ? 'opacity-100' : 'opacity-0' }`}>
                {'연관도를 선택해주세요.(기본값: 희박)'}
              </p>
            </div>
          </div>
          <div className="grow">
            <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}</label>
            <textarea
              name="relevance.analyst.description"
              value={formData.relevance?.analyst?.description || ''}
              onChange={handleAnalystDescChange}
              onKeyDown={handleAnalystKeyDown}
              className="w-full p-2 border border-gray4 text-main rounded-md"
              placeholder="데이터 분석가의 연관성에 대해 작성하세요."
              rows={4}
              style={{ resize: 'none', height: '120px', minHeight: '120px', maxHeight: '120px', overflowY: 'auto' }}
            />
            {analystEnterError ? (
              <p className="text-sm text-primary mt-1">{'줄바꿈을 추가할 수 없습니다.'}</p>
            ) : showAnalystGuidance ? (
              <p className="text-sm text-level-5 mt-1">{'연관도 설명을 작성해주세요.'}</p>
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
              <p className={`text-sm text-level-5 !ml-[-12px] ${ !userChangedScientist ? 'opacity-100' : 'opacity-0' }`}>
                {'연관도를 선택해주세요.(기본값: 희박)'}
              </p>
            </div>
          </div>
          <div className="grow">
            <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}</label>
            <textarea
              name="relevance.scientist.description"
              value={formData.relevance?.scientist?.description || ''}
              onChange={handleScientistDescChange}
              onKeyDown={handleScientistKeyDown}
              className="w-full p-2 border border-gray4 text-main rounded-md"
              placeholder="데이터 과학자의 연관성에 대해 작성하세요."
              rows={4}
              style={{ resize: 'none', height: '120px', minHeight: '120px', maxHeight: '120px', overflowY: 'auto' }}
            />
            {scientistEnterError ? (
              <p className="text-sm text-primary mt-1">{'줄바꿈을 추가할 수 없습니다.'}</p>
            ) : showScientistGuidance ? (
              <p className="text-sm text-level-5 mt-1">{'연관도 설명을 작성해주세요.'}</p>
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
              <p className={`text-sm text-level-5 !ml-[-12px] ${ !userChangedEngineer ? 'opacity-100' : 'opacity-0' }`}>
                {'연관도를 선택해주세요.(기본값: 희박)'}
              </p>
            </div>
          </div>
          <div className="grow">
            <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}</label>
            <textarea
              name="relevance.engineer.description"
              value={formData.relevance?.engineer?.description || ''}
              onChange={handleEngineerDescChange}
              onKeyDown={handleEngineerKeyDown}
              className="w-full p-2 border border-gray4 text-main rounded-md"
              placeholder="데이터 엔지니어의 연관성에 대해 작성하세요."
              rows={4}
              style={{ resize: 'none', height: '120px', minHeight: '120px', maxHeight: '120px', overflowY: 'auto' }}
            />
            {engineerEnterError ? (
              <p className="text-sm text-primary mt-1">{'줄바꿈을 추가할 수 없습니다.'}</p>
            ) : showEngineerGuidance ? (
              <p className="text-sm text-level-5 mt-1">{'연관도 설명을 작성해주세요.'}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelevanceSection;