import { TermData } from '@/types/database';
import React from 'react';
import { useFormValidation } from './ValidatedInput';

interface DescriptionSectionProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
}

const DescriptionSection = ({ formData, handleChange }: DescriptionSectionProps) => {
  const { getInputClassName } = useFormValidation();

  return (
    <div className="p-2 md:p-6 border-b border-gray3">
      <h2 className="flex items-center text-xl font-semibold mb-4">
        <span className="text-primary mr-1">{'#'}</span>
        {'전체 설명'}
      </h2>
      <div className="mb-4">
        <textarea
          name="description.full"
          value={formData.description?.full || ''}
          onChange={(e) => {
            handleChange(e);
            e.target.style.height = 'auto';
            e.target.style.height = `calc(${ e.target.scrollHeight }px + 1rem)`;
          }}
          className={getInputClassName(formData.description?.full)}
          placeholder="마크다운 형식으로 작성"
          required
        />
        <p className="text-sm text-gray2">{'수식은 $...$ 또는 $$...$$ 형식으로 작성할 수 있습니다.'}</p>
      </div>
    </div>
  );
};

export default DescriptionSection;