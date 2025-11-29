import { TermData } from '@/types/database';
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { X } from 'lucide-react';

export interface EtcTitleEditHandle {
  focus: () => void;
}

interface EtcTitleEditProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  onTabToNext?: () => void;
  autoFocus?: boolean;
}

const EtcTitleEdit = forwardRef<EtcTitleEditHandle, EtcTitleEditProps>(({ formData, handleChange, onTabToNext, autoFocus }, ref) => {
  const [newKeyword, setNewKeyword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      const currentEtcArray = Array.isArray(formData.title?.etc) ? formData.title.etc : [];

      // formData 업데이트를 위한 가짜 이벤트 생성
      const fakeEvent = {
        target: {
          name: 'title.etc',
          value: [...currentEtcArray, newKeyword.trim()],
        },
      } as unknown as React.ChangeEvent<HTMLTextAreaElement>;

      handleChange(fakeEvent);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    const currentEtcArray = Array.isArray(formData.title?.etc) ? formData.title.etc : [];

    // formData 업데이트를 위한 가짜 이벤트 생성
    const fakeEvent = {
      target: {
        name: 'title.etc',
        value: currentEtcArray.filter((_, i) => i !== index),
      },
    } as unknown as React.ChangeEvent<HTMLTextAreaElement>;

    handleChange(fakeEvent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
    if (e.key === 'Tab' && !e.shiftKey && onTabToNext) {
      e.preventDefault();
      onTabToNext();
    }
  };

  const currentEtcArray = Array.isArray(formData.title?.etc) ? formData.title.etc : [];

  return (
    <div className="p-2">
      <label className="block text-sm font-medium mb-1 text-gray0">
        {'검색 키워드'}
      </label>
      <div className="flex items-end space-x-2 mb-2">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 border border-gray4 rounded-md text-main"
            placeholder="검색 결과의 정확도를 높이기 위해 주제를 잘 나타내는 키워드를 작성하세요."
          />
        </div>
        <button
          type="button"
          onClick={handleAddKeyword}
          className="px-4 py-2 text-main border border-gray4 bg-gray4 hover:text-white hover:bg-gray3 rounded-md"
        >
          {'추가'}
        </button>
      </div>
      <p className="text-sm text-gray2 mb-2">
        {'Enter 키 또는 [추가] 버튼을 눌러 키워드를 추가할 수 있습니다. 이 키워드들은 포스트에 표시되지 않지만 검색에 사용됩니다.'}
      </p>

      <div className="flex flex-wrap gap-2 mt-4">
        {currentEtcArray.map((keyword, index) => (
          <div key={index} className="bg-gray5 border border-gray4 rounded-lg px-3 py-1 flex items-center text-main">
            <span>{keyword}</span>
            <button
              type="button"
              onClick={() => handleRemoveKeyword(index)}
              className="ml-2 text-level-5"
            >
              <X className="size-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

EtcTitleEdit.displayName = 'EtcTitleEdit';

export default EtcTitleEdit;