import { TermData } from '@/types/database';
import React from 'react';

interface DifficultySectionProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
}

const DifficultySection = ({ formData, handleChange }: DifficultySectionProps) => {
  return (
    <div className="bg-gray5 border-gray4 p-6 rounded-lg shadow-xl">
      <h2 className="text-xl font-semibold mb-4">{'난이도'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">{'레벨 (1-5)'}</label>
          <input
            type="number"
            name="difficulty.level"
            value={formData.difficulty?.level || 1}
            onChange={handleChange}
            min={1}
            max={5}
            className="w-full p-2 border border-gray4 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{'설명'}</label>
          <textarea
            name="difficulty.description"
            value={formData.difficulty?.description || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray4 rounded-md"
            rows={2}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default DifficultySection;