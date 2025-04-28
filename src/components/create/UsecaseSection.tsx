import { TermData } from '@/types/database';
import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface UsecaseSectionProps {
  formData: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
}

const UsecaseSection = ({ formData, setFormData, handleChange }: UsecaseSectionProps) => {
  const [newIndustry, setNewIndustry] = useState('');

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

  return (
    <div className="p-2 md:p-6 border-b border-gray3">
      <h2 className="flex items-center text-xl font-semibold mb-4">
        <span className="text-primary mr-1">{'#'}</span>
        {'사용 사례'}
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray0">{'개요'}</label>
          <textarea
            name="usecase.description"
            value={formData.usecase?.description || ''}
            onChange={(e) => {
              handleChange(e);
              e.target.style.height = 'auto';
              e.target.style.height = `calc(${ e.target.scrollHeight }px + 1rem)`;
            }}
            className="w-full p-2 border border-gray4 rounded-md h-20"
            rows={2}
            required
            placeholder="해당 용어의 사용 사례에 대한 개요"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray0">{'사례'}</label>
          <textarea
            name="usecase.example"
            value={formData.usecase?.example || ''}
            onChange={(e) => {
              handleChange(e);
              e.target.style.height = 'auto';
              e.target.style.height = `calc(${ e.target.scrollHeight }px + 1rem)`;
            }}
            className="w-full p-2 border border-gray4 rounded-md h-20"
            rows={2}
            required
            placeholder="구체적인 사용 사례"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray0">{'산업 분야 (선택)'}</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray4 rounded-md"
              placeholder="산업 분야 추가 (ex. 의료, 금융, 제조, 교통, 교육, 엔터테인먼트, 보안, 리테일, 에너지, 농업 등)"
            />
            <button
              type="button"
              onClick={handleAddIndustry}
              className="px-4 py-2 text-main border border-gray4 bg-gray4 hover:text-white hover:bg-gray3 rounded-md"
            >
              {'추가'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {formData.usecase?.industries?.map((industry, index) => (
              <div key={index} className="bg-gray5 border border-gray4 rounded-lg px-3 py-1 flex items-center">
                <span>{industry}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      usecase: {
                        ...prev.usecase,
                        industries: prev.usecase?.industries?.filter((_, i) => i !== index),
                      },
                    }));
                  }}
                  className="ml-2 text-level-5"
                >
                  <X className="size-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsecaseSection;