import { TermData } from '@/types/database';
import React, { useState } from 'react';

interface KoreanTitleEditProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  onEnterPress?: ()=> void;
}

const KoreanTitleEdit = ({ formData, handleChange, onEnterPress }: KoreanTitleEditProps) => {
  const [koTitleGuidance, setKoTitleGuidance] = useState<string | null>(null);

  const handleKoreanTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // 한글과 영어만 허용
    const koreanAndEnglishOnly = value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s]/g, '');

    if (value !== koreanAndEnglishOnly) {
      setKoTitleGuidance('한국어, 영어 외의 문자는 사용할 수 없습니다. (영어 일부 인정)');
    } else {
      setKoTitleGuidance(null);
    }

    const filteredEvent = {
      target: {
        name: e.target.name,
        value: koreanAndEnglishOnly,
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
      <label className="block text-sm font-medium mb-1 text-gray0">{'한글 제목'}</label>
      <input
        type="text"
        name="title.ko"
        value={formData.title?.ko || ''}
        onChange={handleKoreanTitleChange}
        onKeyDown={handleKeyDown}
        className="w-full p-2 border border-gray4 text-main rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
        placeholder="포스트 한글 제목 (ex. 인공지능)"
      />
      {koTitleGuidance && (
        <p className="text-sm text-primary ml-1">{koTitleGuidance}</p>
      )}
    </div>
  );
};

export default KoreanTitleEdit;