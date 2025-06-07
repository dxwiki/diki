import { TermData } from '@/types/database';
import React, { useState, KeyboardEvent, useRef } from 'react';
import { X } from 'lucide-react';

interface BasicInfoSectionProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  isModal?: boolean;
}

// 공통 인터페이스 정의
interface InputComponentProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  handleInputKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, nextRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>)=> void;
}

// 한글 제목 컴포넌트
interface KoreanTitleProps extends InputComponentProps {
  koTitleRef: React.RefObject<HTMLInputElement>;
  enTitleRef: React.RefObject<HTMLInputElement>;
}

const KoreanTitleInput = ({
  formData,
  handleChange,
  koTitleRef,
  enTitleRef,
  handleInputKeyDown,
}: KoreanTitleProps) => {
  const [koTitleGuidance, setKoTitleGuidance] = useState<string | null>(null);

  const handleKoreanTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

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

  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray0">{'한글 제목'}</label>
      <input
        ref={koTitleRef}
        type="text"
        name="title.ko"
        value={formData.title?.ko || ''}
        onChange={handleKoreanTitleChange}
        onKeyDown={(e) => handleInputKeyDown(e, enTitleRef)}
        className="w-full p-2 border border-gray4 text-main rounded-md"
        placeholder="포스트 한글 제목 (ex. 인공지능)"
      />
      {koTitleGuidance && (
        <p className="text-sm text-primary ml-1">{koTitleGuidance}</p>
      )}
    </div>
  );
};

// 영문 제목 컴포넌트
interface EnglishTitleProps extends InputComponentProps {
  enTitleRef: React.RefObject<HTMLInputElement>;
  shortDescRef: React.RefObject<HTMLTextAreaElement>;
}

const EnglishTitleInput = ({
  formData,
  handleChange,
  enTitleRef,
  shortDescRef,
  handleInputKeyDown,
}: EnglishTitleProps) => {
  const [enTitleGuidance, setEnTitleGuidance] = useState<string | null>(null);

  const handleEnglishTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
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

  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray0">{'영문 제목'}</label>
      <input
        ref={enTitleRef}
        type="text"
        name="title.en"
        value={formData.title?.en || ''}
        onChange={handleEnglishTitleChange}
        onKeyDown={(e) => handleInputKeyDown(e, shortDescRef)}
        className="w-full p-2 border border-gray4 text-main rounded-md"
        placeholder="포스트 영문 제목 (ex. Artificial Intelligence)"
      />
      {enTitleGuidance && (
        <p className="text-sm text-primary ml-1">{enTitleGuidance}</p>
      )}
    </div>
  );
};

// 짧은 설명 컴포넌트
interface ShortDescriptionProps extends InputComponentProps {
  shortDescRef: React.RefObject<HTMLTextAreaElement>;
  etcTitleRef: React.RefObject<HTMLInputElement>;
}

const ShortDescriptionInput = ({
  formData,
  handleChange,
  shortDescRef,
  etcTitleRef,
  handleInputKeyDown,
}: ShortDescriptionProps) => {
  return (
    <div className='md:col-span-2'>
      <label className="block text-sm font-medium mb-1 text-gray0">{'짧은 설명'}</label>
      <div className="relative">
        <textarea
          ref={shortDescRef}
          name="description.short"
          value={formData.description?.short || ''}
          onChange={(e) => {
            handleChange(e);
            // 높이 자동 조절
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          onKeyDown={(e) => handleInputKeyDown(e, etcTitleRef)}
          className="w-full p-2 border border-gray4 text-main rounded-md resize-none overflow-hidden"
          placeholder="포스트에 대한 1~2줄 짧은 설명 (100자 이내)"
          maxLength={100}
          rows={1}
          style={{ minHeight: '42px' }}
        />
        <div className="absolute right-2 text-xs text-gray2">
          {`${ formData.description?.short?.length || 0 }/100`}
        </div>
      </div>
    </div>
  );
};

// 추가 제목 컴포넌트
interface AdditionalTitleProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
  etcTitleRef: React.RefObject<HTMLInputElement>;
}

const AdditionalTitleInput = ({
  formData,
  handleChange,
  etcTitleRef,
}: AdditionalTitleProps) => {
  const [newEtcTitle, setNewEtcTitle] = useState('');

  const handleAddEtcTitle = () => {
    if (newEtcTitle.trim()) {
      const currentEtc = formData.title?.etc || [];
      const updatedEtc = [...currentEtc, newEtcTitle];

      const fakeEvent = {
        target: {
          name: 'title.etc',
          value: updatedEtc,
        },
      } as unknown as React.ChangeEvent<HTMLTextAreaElement>;

      handleChange(fakeEvent);
      setNewEtcTitle('');
      etcTitleRef.current?.focus();
    }
  };

  const handleEtcTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault(); // 폼 제출 방지
      handleAddEtcTitle();
    }
  };

  const handleRemoveEtcTitle = (index: number) => {
    if (!formData.title || !formData.title.etc) return;

    const updatedEtc = formData.title.etc.filter((_, i) => i !== index);

    const fakeEvent = {
      target: {
        name: 'title.etc',
        value: updatedEtc,
      },
    } as unknown as React.ChangeEvent<HTMLTextAreaElement>;

    handleChange(fakeEvent);
  };

  return (
    <div className='md:col-span-2'>
      <label className="block text-sm font-medium mb-1 text-gray0">{'추가 제목 (선택)'}</label>
      <div className="mb-2">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <input
              ref={etcTitleRef}
              type="text"
              value={newEtcTitle}
              onChange={(e) => setNewEtcTitle(e.target.value)}
              onKeyDown={handleEtcTitleKeyDown}
              className="w-full p-2 border border-gray4 rounded-md"
              placeholder="별칭 또는 줄임말 (ex. AI)"
            />
          </div>
          <button
            type="button"
            onClick={handleAddEtcTitle}
            className="px-4 py-2 text-main border border-gray4 bg-gray4 hover:text-white hover:bg-gray3 rounded-md"
          >
            {'추가'}
          </button>
        </div>
        <p className="text-sm text-gray2 m-1">
          {'추가 제목을 입력하면, 검색 시 추가 제목으로도 검색됩니다.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {formData.title?.etc?.map((title, index) => (
          <div key={index} className="bg-gray5 border border-gray4 rounded-lg px-3 py-1 flex items-center">
            <span>{title}</span>
            <button
              type="button"
              onClick={() => handleRemoveEtcTitle(index)}
              className="ml-2 text-level-5"
            >
              <X className="size-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const BasicInfoSection = ({ formData, handleChange, isModal = false }: BasicInfoSectionProps) => {
  // 각 입력 필드에 대한 ref 생성
  const koTitleRef = useRef<HTMLInputElement>(null);
  const enTitleRef = useRef<HTMLInputElement>(null);
  const shortDescRef = useRef<HTMLTextAreaElement>(null);
  const etcTitleRef = useRef<HTMLInputElement>(null);

  // 엔터 키 처리 - 다음 필드로 이동
  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, nextRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault(); // 폼 제출 방지
      nextRef.current?.focus();
    }
  };

  const containerClasses = isModal
    ? 'p-2'
    : 'p-2';

  return (
    <div className={containerClasses}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KoreanTitleInput
          formData={formData}
          handleChange={handleChange}
          koTitleRef={koTitleRef}
          enTitleRef={enTitleRef}
          handleInputKeyDown={handleInputKeyDown}
        />

        <EnglishTitleInput
          formData={formData}
          handleChange={handleChange}
          enTitleRef={enTitleRef}
          shortDescRef={shortDescRef}
          handleInputKeyDown={handleInputKeyDown}
        />

        <ShortDescriptionInput
          formData={formData}
          handleChange={handleChange}
          shortDescRef={shortDescRef}
          etcTitleRef={etcTitleRef}
          handleInputKeyDown={handleInputKeyDown}
        />

        {!isModal && (
          <AdditionalTitleInput
            formData={formData}
            handleChange={handleChange}
            etcTitleRef={etcTitleRef}
          />
        )}
      </div>
    </div>
  );
};

export default BasicInfoSection;