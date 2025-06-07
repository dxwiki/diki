import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { TermData } from '@/types/database';
import { X } from 'lucide-react';
import InternalLinkSearch from './InternalLinkSearch';

interface TagsSectionProps {
  formData: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
}

const TagsSection = ({ formData, setFormData }: TagsSectionProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showValidationMessage, setShowValidationMessage] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // 포스트 개수에 따라 validation 메시지 표시 여부 결정
  useEffect(() => {
    if (formData.tags && formData.tags.length > 0) {
      setShowValidationMessage(false);
    } else {
      setShowValidationMessage(true);
    }
  }, [formData.tags]);

  const handleLinkSelect = (url: string, title: string) => {
    const tagToAdd = {
      name: title,
      internal_link: url,
    };

    setFormData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), tagToAdd],
    }));
  };

  return (
    <div className="p-2">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {formData.tags?.map((tag, index) => (
          <div key={index} className="bg-gray5 border border-gray4 rounded-lg px-3 py-1 flex flex-col items-center mb-2">
            <div className="w-full flex justify-between items-start">
              <span className="font-medium truncate">{tag.name}</span>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    tags: prev.tags?.filter((_, i) => i !== index),
                  }));
                }}
                className="ml-2 text-level-5"
              >
                <X className="size-5" />
              </button>
            </div>
            {tag.internal_link && (
              <Link href={tag.internal_link} target="_blank" rel="noopener noreferrer" className="w-full text-sm text-primary hover:underline truncate">
                {`${ tag.internal_link }`}
              </Link>
            )}
          </div>
        ))}
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1 text-gray0">{'관련 포스트 검색'}</label>
        <div className="relative">
          <InternalLinkSearch onSelect={handleLinkSelect} refocus inputRef={searchInputRef} />
        </div>
        {showValidationMessage && (
          <p className="text-sm text-level-5 mt-1">{'관련 포스트를 1개 이상 선택해주세요.'}</p>
        )}
      </div>
      <p className="text-sm text-gray2 mt-1">{'Diki 내 포스트를 검색하여 선택하면, 관련 포스트가 자동으로 추가됩니다.\n 추가된 포스트의 링크를 눌러 확인할 수 있습니다.'}</p>
    </div>
  );
};

export default TagsSection;