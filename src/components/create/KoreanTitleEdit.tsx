import { TermData } from '@/types/database';
import React, { useState, useEffect } from 'react';

interface KoreanTitleEditProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  onEnterPress?: ()=> void;
}

const KoreanTitleEdit = ({ formData, handleChange, onEnterPress }: KoreanTitleEditProps) => {
  const [koTitleGuidance, setKoTitleGuidance] = useState<string | null>(null);
  const [showDefaultGuidance, setShowDefaultGuidance] = useState<boolean>(true);

  // 사용자가 입력한 값이 있으면 기본 안내 메시지를 숨김
  useEffect(() => {
    if (formData.title?.ko && formData.title.ko.trim() !== '') {
      setShowDefaultGuidance(false);
    } else {
      setShowDefaultGuidance(true);
    }
  }, [formData.title?.ko]);

  const handleKoreanTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // 입력 시작하면 기본 안내 메시지 숨김
    if (value.trim() !== '') {
      setShowDefaultGuidance(false);
    } else {
      setShowDefaultGuidance(true);
    }

    // 한글, 영어, 별(*), 하이픈(-) 문자만 허용
    const allowedCharsOnly = value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s\*\-]/g, '');

    if (value !== allowedCharsOnly) {
      setKoTitleGuidance('한국어, 영어, 별(*), 하이픈(-) 외의 문자는 사용할 수 없습니다.');
    } else {
      setKoTitleGuidance(null);
    }

    const filteredEvent = {
      target: {
        name: e.target.name,
        value: allowedCharsOnly,
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
      {koTitleGuidance ? (
        <p className="text-sm text-primary ml-1">{koTitleGuidance}</p>
      ) : showDefaultGuidance ? (
        <p className="text-sm text-level-5 ml-1 mt-1">{'한글 제목을 작성해주세요.'}</p>
      ) : null}
    </div>
  );
};

export default KoreanTitleEdit;