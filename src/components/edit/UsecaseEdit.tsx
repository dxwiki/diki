import { TermData } from '@/types/database';
import React, { useState, KeyboardEvent, useEffect } from 'react';
import { X } from 'lucide-react';

interface UsecaseSectionProps {
  formData: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
}

const UsecaseSection = ({ formData, setFormData, handleChange }: UsecaseSectionProps) => {
  const [newIndustry, setNewIndustry] = useState('');
  const [showDescriptionGuidance, setShowDescriptionGuidance] = useState<boolean>(true);
  const [showExampleGuidance, setShowExampleGuidance] = useState<boolean>(true);
  const [descEnterError, setDescEnterError] = useState<boolean>(false);
  const [exampleEnterError, setExampleEnterError] = useState<boolean>(false);

  // 설명 입력 여부에 따라 안내 메시지 표시 여부 결정
  useEffect(() => {
    if (formData.usecase?.description && formData.usecase.description.trim() !== '') {
      setShowDescriptionGuidance(false);
    } else {
      setShowDescriptionGuidance(true);
    }

    if (formData.usecase?.example && formData.usecase.example.trim() !== '') {
      setShowExampleGuidance(false);
    } else {
      setShowExampleGuidance(true);
    }
  }, [formData.usecase?.description, formData.usecase?.example]);

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIndustry();
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

    if (e.target.value.trim() !== '') {
      setShowDescriptionGuidance(false);
    } else {
      setShowDescriptionGuidance(true);
    }

    setDescEnterError(false);
  };

  const handleExampleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);

    if (e.target.value.trim() !== '') {
      setShowExampleGuidance(false);
    } else {
      setShowExampleGuidance(true);
    }

    setExampleEnterError(false);
  };

  // Enter 키 입력 방지 핸들러
  const handleDescKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setDescEnterError(true);
    }
  };

  const handleExampleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setExampleEnterError(true);
    }
  };

  return (
    <div className="p-2">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray0">{'개요'}</label>
        <textarea
          name="usecase.description"
          value={formData.usecase?.description || ''}
          onChange={handleDescriptionChange}
          onKeyDown={handleDescKeyDown}
          className="w-full p-2 border border-gray4 text-main rounded-md"
          placeholder="포스트 내용의 사용 사례에 대한 개요를 작성하세요."
          rows={4}
          style={{ resize: 'none', height: '80px', minHeight: '80px', maxHeight: '80px', overflowY: 'auto' }}
        />
        {descEnterError ? (
          <p className="text-sm text-primary">{'사용 사례 개요에 줄바꿈을 추가할 수 없습니다.'}</p>
        ) : showDescriptionGuidance ? (
          <p className="text-sm text-level-5">{'사용 사례 개요를 작성해주세요.'}</p>
        ) : null}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray0">{'사례'}</label>
        <textarea
          name="usecase.example"
          value={formData.usecase?.example || ''}
          onChange={handleExampleChange}
          onKeyDown={handleExampleKeyDown}
          className="w-full p-2 border border-gray4 text-main rounded-md"
          placeholder="구체적인 사용 사례를 작성하세요."
          rows={4}
          style={{ resize: 'none', height: '80px', minHeight: '80px', maxHeight: '80px', overflowY: 'auto' }}
        />
        {exampleEnterError ? (
          <p className="text-sm text-primary">{'사용 사례에 줄바꿈을 추가할 수 없습니다.'}</p>
        ) : showExampleGuidance ? (
          <p className="text-sm text-level-5">{'사용 사례를 작성해주세요.'}</p>
        ) : null}
      </div>

      <div className="mb-1">
        <label className="block text-sm font-medium mb-1 text-gray0">{'관련 산업 분야 (선택)'}</label>
        <div className="flex items-end space-x-2 mb-2">
          <div className="flex-1">
            <input
              type="text"
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              onKeyDown={handleKeyDown}
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
};

export default UsecaseSection;