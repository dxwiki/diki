import Link from 'next/link';
import React, { useState, KeyboardEvent, useRef } from 'react';
import { TermData } from '@/types/database';
import { X } from 'lucide-react';
import InternalLinkSearch from './InternalLinkSearch';
import { useFormValidation, IsolatedGuidanceMessage } from './ValidatedInput';

interface TermsSectionProps {
  formData: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
}

const TermsSection = ({ formData, setFormData }: TermsSectionProps) => {
  const [newTerm, setNewTerm] = useState({ term: '', description: '', internal_link: undefined as string | undefined, link_title: '' });
  const { showValidation, setShowValidation } = useFormValidation();

  const termInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const linkSearchRef = useRef<HTMLDivElement>(null);

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, nextRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  const handleAddTerm = () => {
    setShowValidation(true);
    if (newTerm.term.trim() && newTerm.description.trim()) {
      setFormData((prev) => ({
        ...prev,
        terms: [...(prev.terms || []), { ...newTerm }],
      }));
      setNewTerm({ term: '', description: '', internal_link: undefined, link_title: '' });
      termInputRef.current?.focus();
      setShowValidation(false);
    }
  };

  const handleLinkSelect = (url: string, title: string) => {
    setNewTerm((prev) => ({ ...prev, internal_link: url, link_title: title }));
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
            onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
            onKeyDown={(e) => handleInputKeyDown(e, descriptionRef)}
            className="w-full p-2 border border-gray4 text-main rounded-md"
            placeholder="각주 또는 Diki 포스트 등 관련 용어"
          />
          <IsolatedGuidanceMessage
            value={newTerm.term}
            guidanceMessage="용어는 필수값입니다."
            showValidation={showValidation}
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}</label>
          <textarea
            ref={descriptionRef}
            value={newTerm.description}
            onChange={(e) => {
              setNewTerm({ ...newTerm, description: e.target.value });
              e.target.style.height = 'auto';
              e.target.style.height = `calc(${ e.target.scrollHeight }px + 1rem)`;
            }}
            onKeyDown={(e) => handleInputKeyDown(e, linkSearchRef)}
            className="w-full p-2 border border-gray4 text-main rounded-md h-20"
            placeholder="용어에 대한 설명"
          />
          <IsolatedGuidanceMessage
            value={newTerm.description}
            guidanceMessage="설명은 필수값입니다."
            showValidation={showValidation}
          />
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
                {newTerm.link_title}
              </Link>
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray2">
              {'링크를 선택하면, 독자가 해당 용어 클릭 시 링크로 이동할 수 있습니다.'}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleAddTerm}
          className="px-4 py-2 text-main border border-gray4 bg-gray4 hover:text-white hover:bg-gray3 rounded-md"
        >
          {'용어 추가'}
        </button>
      </div>

    </div>
  );
};

export default TermsSection;