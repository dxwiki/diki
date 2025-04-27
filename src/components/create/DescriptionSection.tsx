import { TermData } from '@/types/database';
import React from 'react';

interface DescriptionSectionProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
}

const DescriptionSection = ({ formData, handleChange }: DescriptionSectionProps) => {
  return (
    <div className="p-2 md:p-6 border-b border-gray4">
      <h2 className="flex items-center text-xl font-semibold mb-4">
        <span className="text-primary mr-1">{'#'}</span>
        {'전체 설명'}
      </h2>
      <div className="mb-4">
        <textarea
          name="description.full"
          value={formData.description?.full || ''}
          onChange={handleChange}
          className="w-full p-2 border border-gray4 rounded-md h-52"
          placeholder="마크다운 형식으로 작성해주세요"
          required
        />
        <p className="text-xs text-gray2 mt-2">{'수식은 $...$ 또는 $$...$$ 형식으로 작성할 수 있습니다.'}</p>
      </div>
    </div>
  );
};

export default DescriptionSection;