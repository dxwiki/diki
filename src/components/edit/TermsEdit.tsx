import Link from 'next/link';
import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Terms, TermData } from '@/types/database';
import { X } from 'lucide-react';
import InternalLinkSearch from './InternalLinkSearch';

interface TermsSectionProps {
  formData: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
}

const TermsSection = ({ formData, setFormData }: TermsSectionProps) => {
  const [newTerm, setNewTerm] = useState<Terms>({});
  const [showGuidance, setShowGuidance] = useState(true);
  const [termError, setTermError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [enterKeyError, setEnterKeyError] = useState<boolean>(false);

  const termInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const linkSearchRef = useRef<HTMLDivElement>(null);

  // 관련 용어 추가 여부에 따라 안내 메시지 표시 상태 업데이트
  useEffect(() => {
    if (formData.terms && formData.terms.length > 0) {
      setShowGuidance(false);
    } else {
      setShowGuidance(true);
    }
  }, [formData.terms]);

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, nextRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  // 설명 입력란에서 Enter 키 입력 방지
  const handleDescriptionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      setEnterKeyError(true);
    }
  };

  const validateInputs = (): boolean => {
    let isValid = true;

    // 용어 입력 검증
    if (!newTerm.term) {
      setTermError('관련 용어를 추가하려면 용어 제목을 작성해야 합니다.');
      isValid = false;
      termInputRef.current?.focus();
    } else {
      setTermError(null);
    }

    // 설명 입력 검증
    if (!newTerm.description) {
      setDescriptionError('관련 용어를 추가하려면 용어 설명을 작성해야 합니다.');
      isValid = false;
      if (newTerm.term) {
        descriptionRef.current?.focus();
      }
    } else {
      setDescriptionError(null);
    }

    return isValid;
  };

  const handleAddTerm = () => {
    // 입력 검증
    if (!validateInputs()) return;

    setFormData((prev) => ({
      ...prev,
      terms: [...(prev.terms || []), { ...newTerm }],
    }));

    // 입력 필드 초기화
    setNewTerm({ term: '', description: '', internal_link: undefined });
    setTermError(null);
    setDescriptionError(null);
    termInputRef.current?.focus();
  };

  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!newTerm.internal_link) {
      setNewTerm({ ...newTerm, term: e.target.value });
    }

    // 입력 시 에러 메시지 제거
    if (e.target.value.trim()) {
      setTermError(null);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewTerm({ ...newTerm, description: e.target.value });

    // 입력 시 에러 메시지 제거
    if (e.target.value.trim()) {
      setDescriptionError(null);
    }

    // Enter 키 에러 메시지 초기화
    setEnterKeyError(false);

    e.target.style.height = 'auto';
    e.target.style.height = `calc(${ e.target.scrollHeight }px + 1rem)`;
  };

  const handleLinkSelect = (url: string, title: string) => {
    setNewTerm((prev) => ({ ...prev, internal_link: url, term: title }));
    setTermError(null); // 링크 선택 시 용어 에러 초기화
  };

  // 버튼 활성화 여부 확인
  const isButtonActive = (): boolean => {
    return !!(newTerm.term && newTerm.description);
  };

  return (
    <div className="p-2">
      {formData.terms && formData.terms.length > 0 && (
        <div className="my-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {formData.terms.map((term, index) => (
              <div key={index} className="bg-gray5 border border-gray4 rounded-lg p-3 flex flex-col">
                <div className="flex justify-between items-start">
                  <span className="font-medium truncate">{term.term}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        terms: prev.terms?.filter((_, i) => i !== index),
                      }));
                    }}
                    className="ml-2 text-level-5"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <p className="text-sm">{term.description}</p>
                {term.internal_link && (
                  <Link href={term.internal_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                    {`링크: ${ term.internal_link }`}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="w-full flex flex-col items-end space-y-4 mb-4">
        <div className="w-full">
          <label className="block text-sm font-medium mb-1 text-gray0">{'용어'}</label>
          <input
            ref={termInputRef}
            type="text"
            value={newTerm.term}
            onChange={handleTermChange}
            onKeyDown={(e) => handleInputKeyDown(e, descriptionRef)}
            className={`w-full p-2 border ${ termError ? 'border-primary' : 'border-gray4' } text-main rounded-md ${ newTerm.internal_link ? 'bg-gray5 cursor-not-allowed' : '' }`}
            placeholder="각주 또는 포스트와 관련된 용어를 작성하세요."
            readOnly={!!newTerm.internal_link}
          />
          {termError && <p className="text-sm text-primary mt-1">{termError}</p>}
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}</label>
          <textarea
            ref={descriptionRef}
            value={newTerm.description}
            onChange={handleDescriptionChange}
            onKeyDown={handleDescriptionKeyDown}
            className={`w-full p-2 border ${ descriptionError ? 'border-primary' : 'border-gray4' } text-main rounded-md h-[88px]`}
            placeholder="용어에 대한 설명을 작성하세요."
          />
          {enterKeyError && (
            <p className="text-sm text-primary mt-1">{'관련 용어 설명에 줄바꿈을 추가할 수 없습니다.'}</p>
          )}
          {descriptionError && !enterKeyError && (
            <p className="text-sm text-primary mt-1">{descriptionError}</p>
          )}
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium mb-1 text-gray0">{'내부 링크 (선택)'}</label>
          <div ref={linkSearchRef} className="relative">
            <InternalLinkSearch onSelect={handleLinkSelect} />
          </div>
          {newTerm.internal_link ? (
            <div className="flex items-center gap-1 mt-2 text-sm text-primary">
              {'선택된 Diki 내부 링크:'}
              <Link href={newTerm.internal_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                {newTerm.internal_link}
              </Link>
              <button
                type="button"
                onClick={() => setNewTerm((prev) => ({ ...prev, internal_link: undefined }))}
                className="ml-1 text-level-5 hover:opacity-80"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray2">
              {'내부 링크를 선택하면 용어는 링크 제목으로 자동 변경됩니다.'}
            </div>
          )}
        </div>
        <div className="w-full flex justify-between items-center">
          <p className={`text-sm text-level-5 ${ showGuidance ? 'opacity-100' : 'opacity-0' }`}>{'관련 용어를 1개 이상 작성해주세요.'}</p>
          <button
            type="button"
            onClick={handleAddTerm}
            className={`px-4 py-2 rounded-md ${
              isButtonActive()
                ? 'bg-primary dark:bg-secondary text-white hover:opacity-90'
                : 'text-main bg-gray4 hover:text-white hover:bg-gray3'
            }`}
          >
            {'용어 추가'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default TermsSection;