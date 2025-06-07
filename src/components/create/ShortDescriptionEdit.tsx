import { TermData } from '@/types/database';
import React from 'react';

interface ShortDescriptionEditProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  onEnterPress?: ()=> void;
}

const ShortDescriptionEdit = ({ formData, handleChange, onEnterPress }: ShortDescriptionEditProps) => {
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // 원래 이벤트 핸들러 호출
    handleChange(e);

    // 높이 자동 조절
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey && onEnterPress) {
      e.preventDefault();
      onEnterPress();
    }
  };

  return (
    <div className="p-2">
      <label className="block text-sm font-medium mb-1 text-gray0">{'짧은 설명'}</label>
      <div className="relative">
        <textarea
          name="description.short"
          value={formData.description?.short || ''}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          className="w-full p-2 border border-gray4 text-main rounded-md resize-none overflow-hidden focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="포스트에 대한 간단한 설명을 작성하세요."
          maxLength={100}
          rows={2}
          style={{ minHeight: '60px' }}
        />
        <div className="absolute right-2 bottom-2 text-xs text-gray2">
          {`${ formData.description?.short?.length || 0 }/100`}
        </div>
      </div>
    </div>
  );
};

export default ShortDescriptionEdit;