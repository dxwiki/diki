import { TermData } from '@/types/database';
import React from 'react';

interface RelevanceSectionProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
}

const RelevanceSection = ({ formData, handleChange }: RelevanceSectionProps) => {
  return (
    <div className="bg-gray5 border-gray4 p-6 rounded-lg shadow-xl">
      <h2 className="text-xl font-semibold mb-4">{'관련성'}</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">{'데이터 분석가 점수 (1-5)'}</label>
            <input
              type="number"
              name="relevance.analyst.score"
              value={formData.relevance?.analyst?.score || 0}
              onChange={handleChange}
              min={0}
              max={5}
              className="w-full p-2 border border-gray4 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{'데이터 분석가 설명'}</label>
            <textarea
              name="relevance.analyst.description"
              value={formData.relevance?.analyst?.description || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray4 rounded-md"
              rows={2}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">{'데이터 엔지니어 점수 (1-5)'}</label>
            <input
              type="number"
              name="relevance.engineer.score"
              value={formData.relevance?.engineer?.score || 0}
              onChange={handleChange}
              min={0}
              max={5}
              className="w-full p-2 border border-gray4 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{'데이터 엔지니어 설명'}</label>
            <textarea
              name="relevance.engineer.description"
              value={formData.relevance?.engineer?.description || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray4 rounded-md"
              rows={2}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">{'데이터 과학자 점수 (1-5)'}</label>
            <input
              type="number"
              name="relevance.scientist.score"
              value={formData.relevance?.scientist?.score || 0}
              onChange={handleChange}
              min={0}
              max={5}
              className="w-full p-2 border border-gray4 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{'데이터 과학자 설명'}</label>
            <textarea
              name="relevance.scientist.description"
              value={formData.relevance?.scientist?.description || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray4 rounded-md"
              rows={2}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelevanceSection;