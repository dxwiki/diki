import { TermData } from '@/types/database';
import React, { useState, useEffect } from 'react';

interface ShortDescriptionEditProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  onEnterPress?: ()=> void;
}

const ShortDescriptionEdit = ({ formData, handleChange, onEnterPress }: ShortDescriptionEditProps) => {
  const [shortDescGuidance, setShortDescGuidance] = useState<string | null>(null);
  const [showDefaultGuidance, setShowDefaultGuidance] = useState<boolean>(true);
  const [enterKeyError, setEnterKeyError] = useState<boolean>(false);

  // 사용자가 입력한 값이 있으면 기본 안내 메시지를 숨김
  useEffect(() => {
    if (formData.description?.short && formData.description.short.trim() !== '') {
      setShowDefaultGuidance(false);
    } else {
      setShowDefaultGuidance(true);
    }
  }, [formData.description?.short]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;

    if (value.trim() !== '') {
      setShowDefaultGuidance(false);
    } else {
      setShowDefaultGuidance(true);
    }

    // 100자 초과 시 경고 메시지
    if (value.length > 100) {
      setShortDescGuidance('짧은 설명은 100자를 초과할 수 없습니다.');
    } else {
      setShortDescGuidance(null);
    }

    setEnterKeyError(false);

    handleChange(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;

    // Enter 키와 Shift+Enter 모두 방지
    if (e.key === 'Enter') {
      e.preventDefault();

      // onEnterPress가 있고 Shift 키가 없을 때만 다음 필드로 이동
      if (!e.shiftKey && onEnterPress) {
        onEnterPress();
      } else {
        setEnterKeyError(true);
      }
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
          style={{ height: '80px', minHeight: '80px', maxHeight: '80px', overflowY: 'auto' }}
        />
        <div className="absolute right-2 bottom-2 text-xs text-gray2">
          {`${ formData.description?.short?.length || 0 }/100`}
        </div>
      </div>
      {shortDescGuidance ? (
        <p className="text-sm text-primary ml-1">{shortDescGuidance}</p>
      ) : enterKeyError ? (
        <p className="text-sm text-primary ml-1">{'짧은 설명에 줄바꿈을 추가할 수 없습니다.'}</p>
      ) : showDefaultGuidance ? (
        <p className="text-sm text-level-5 ml-1">{'짧은 설명을 작성해주세요.'}</p>
      ) : null}
    </div>
  );
};

export default ShortDescriptionEdit;