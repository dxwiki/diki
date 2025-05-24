import { TermData } from '@/types/database';
import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { useFormValidation, InputFeedback } from './ValidatedInput';

interface UsecaseSectionProps {
  formData: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  validationErrors?: string[];
}

const UsecaseSection = ({ formData, setFormData, handleChange, validationErrors = [] }: UsecaseSectionProps) => {
  const [newIndustry, setNewIndustry] = useState('');
  const { getInputClassName, showValidation } = useFormValidation();

  // 특정 필드에 대한 유효성 검사 오류 찾기
  const getFieldError = (fieldName: string) => {
    return validationErrors.find((err) => err.includes(fieldName));
  };

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

  return (
    <div className="p-2 md:p-6 border-b border-gray3">
      <h2 className="flex items-center text-xl font-semibold mb-4">
        <span className="text-primary mr-1">{'#'}</span>
        {'사용 사례'}
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray0">{'개요'}</label>
        <textarea
          name="usecase.description"
          value={formData.usecase?.description || ''}
          onChange={(e) => {
            handleChange(e);
            e.target.style.height = 'auto';
            e.target.style.height = `calc(${ e.target.scrollHeight }px + 1rem)`;
          }}
          className={getInputClassName(formData.usecase?.description)}
          placeholder="해당 용어의 사용 사례에 대한 개요"
          required
        />
        <InputFeedback
          value={formData.usecase?.description}
          errorMessage={getFieldError('사용 사례 개요') || '사용 사례 개요'}
          showValidation={showValidation}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray0">{'사례'}</label>
        <textarea
          name="usecase.example"
          value={formData.usecase?.example || ''}
          onChange={(e) => {
            handleChange(e);
            e.target.style.height = 'auto';
            e.target.style.height = `calc(${ e.target.scrollHeight }px + 1rem)`;
          }}
          className={getInputClassName(formData.usecase?.example)}
          placeholder="구체적인 사용 사례"
          required
        />
        <InputFeedback
          value={formData.usecase?.example}
          errorMessage={getFieldError('구체적인 사용 사례') || '구체적인 사용 사례를 입력해주세요.'}
          showValidation={showValidation}
        />
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
              className="w-full p-2 border border-gray4 rounded-md text-main"
              placeholder="산업 분야 입력"
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
          {'산업 분야 추가 (ex. 의료, 금융, 제조, 교통, 교육, 엔터테인먼트, 보안, 리테일, 에너지, 농업 등)'}
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