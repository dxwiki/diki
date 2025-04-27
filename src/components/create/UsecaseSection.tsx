import { TermData } from '@/types/database';
import React, { useState } from 'react';
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

  return (
    <div className="p-2 md:p-6 border-b border-gray4">
      <h2 className="flex items-center text-xl font-semibold mb-4">
        <span className="text-primary mr-1">{'#'}</span>
        {'사용 사례'}
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{'설명'}</label>
          <textarea
            name="usecase.description"
            value={formData.usecase?.description || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray4 rounded-md"
            rows={2}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{'예시'}</label>
          <textarea
            name="usecase.example"
            value={formData.usecase?.example || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray4 rounded-md"
            rows={2}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{'산업 분야'}</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              className="flex-1 p-2 border border-gray4 rounded-md"
              placeholder="산업 분야 추가"
              required
            />
            <button
              type="button"
              onClick={handleAddIndustry}
              className="px-4 py-2 text-main hover:bg-gray4 rounded-md border-gray4"
            >
              {'추가'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {formData.usecase?.industries?.map((industry, index) => (
              <div key={index} className="bg-gray5 rounded-lg px-3 py-1 flex items-center">
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
                  <X className="size-4" />
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