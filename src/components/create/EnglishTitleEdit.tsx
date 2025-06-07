import { TermData } from '@/types/database';
import React, { useState } from 'react';

interface EnglishTitleEditProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  onEnterPress?: ()=> void;
}

const EnglishTitleEdit = ({ formData, handleChange, onEnterPress }: EnglishTitleEditProps) => {
  const [enTitleGuidance, setEnTitleGuidance] = useState<string | null>(null);

  const handleEnglishTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // 영어만 허용
    const englishOnly = value.replace(/[^a-zA-Z\s]/g, '');

    if (value !== englishOnly) {
      setEnTitleGuidance('영어 외의 문자는 사용할 수 없습니다');
    } else {
      setEnTitleGuidance(null);
    }

    const filteredEvent = {
      target: {
        name: e.target.name,
        value: englishOnly,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    handleChange(filteredEvent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && onEnterPress) {
      e.preventDefault();
      onEnterPress();
    }
  };

  return (
    <div className="p-2">
      <label className="block text-sm font-medium mb-1 text-gray0">{'영문 제목'}</label>
      <input
        type="text"
        name="title.en"
        value={formData.title?.en || ''}
        onChange={handleEnglishTitleChange}
        onKeyDown={handleKeyDown}
        className="w-full p-2 border border-gray4 text-main rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
        placeholder="포스트 영문 제목 (ex. Artificial Intelligence)"
      />
      {enTitleGuidance && (
        <p className="text-sm text-primary ml-1">{enTitleGuidance}</p>
      )}
    </div>
  );
};

export default EnglishTitleEdit;