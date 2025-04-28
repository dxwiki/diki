import Link from 'next/link';
import React, { useState } from 'react';
import { TermData } from '@/types/database';
import { X } from 'lucide-react';
import InternalLinkSearch from './InternalLinkSearch';

interface TermsSectionProps {
  formData: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
}

const TermsSection = ({ formData, setFormData }: TermsSectionProps) => {
  const [newTerm, setNewTerm] = useState({ term: '', description: '', internal_link: undefined as string | undefined, link_title: '' });

  const handleAddTerm = () => {
    if (newTerm.term.trim() && newTerm.description.trim()) {
      setFormData((prev) => ({
        ...prev,
        terms: [...(prev.terms || []), { ...newTerm }],
      }));
      setNewTerm({ term: '', description: '', internal_link: undefined, link_title: '' });
    }
  };

  const handleLinkSelect = (url: string, title: string) => {
    setNewTerm((prev) => ({ ...prev, internal_link: url, link_title: title }));
  };

  return (
    <div className="p-2 md:p-6 border-b border-gray3">
      <h2 className="flex items-center text-xl font-semibold mb-2">
        <span className="text-primary mr-1">{'#'}</span>
        {'관련 용어 (선택)'}
      </h2>
      {formData.terms && formData.terms.length > 0 && (
        <div className="my-2">
          <div className="flex flex-wrap gap-2">
            {formData.terms.map((term, index) => (
              <div key={index} className="bg-gray5 border border-gray4 rounded-lg p-3 flex flex-col">
                <div className="flex justify-between items-start">
                  <span className="font-medium">{term.term}</span>
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
            type="text"
            value={newTerm.term}
            onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
            className="w-full p-2 border border-gray4 rounded-md"
            placeholder="각주 또는 Diki 포스트 등 관련 용어"
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}</label>
          <textarea
            value={newTerm.description}
            onChange={(e) => {
              setNewTerm({ ...newTerm, description: e.target.value });
              e.target.style.height = 'auto';
              e.target.style.height = `calc(${ e.target.scrollHeight }px + 1rem)`;
            }}
            className="w-full p-2 border border-gray4 rounded-md h-20"
            placeholder="용어에 대한 설명"
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium mb-1 text-gray0">{'내부 링크 (선택)'}</label>
          <div className="relative">
            <InternalLinkSearch onSelect={handleLinkSelect} />
          </div>
          {newTerm.internal_link ? (
            <div className="mt-2 text-sm text-primary">
              {`선택된 Diki 내부 링크: ${ newTerm.link_title || newTerm.internal_link }`}
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray2">
              {'링크를 선택하지 않으면 용어 설명에 링크가 표시되지 않습니다. (미리보기 참고)'}
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