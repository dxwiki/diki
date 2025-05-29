import { TermData } from '@/types/database';
import React from 'react';
import { useFormValidation, InputFeedback } from './ValidatedInput';

interface DescriptionSectionProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  validationErrors?: string[];
}

const DescriptionSection = ({ formData, handleChange, validationErrors = [] }: DescriptionSectionProps) => {
  const { getInputClassName, showValidation } = useFormValidation();

  // 특정 필드에 대한 유효성 검사 오류 찾기
  const getFieldError = (fieldName: string) => {
    return validationErrors.find((err) => err.includes(fieldName));
  };

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
        <InputFeedback
          value={formData.description?.full}
          errorMessage={getFieldError('전체 설명') || '전체 설명을 입력해주세요.'}
          showValidation={showValidation}
        />
      </div>
    </div>
  );
};

export default DescriptionSection;