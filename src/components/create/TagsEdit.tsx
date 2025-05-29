import Link from 'next/link';
import React from 'react';
import { TermData } from '@/types/database';
import { X } from 'lucide-react';
import InternalLinkSearch from './InternalLinkSearch';

interface TagsSectionProps {
  formData: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
}

const TagsSection = ({ formData, setFormData }: TagsSectionProps) => {
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
    <div className="p-2 md:p-6 border-b border-gray3">
      <h2 className="flex items-center text-xl font-semibold mb-2">
        <span className="text-primary mr-1">{'#'}</span>
        {'관련 포스트 (선택)'}
      </h2>
      <div className="flex flex-wrap gap-2 my-2">
        {formData.tags?.map((tag, index) => (
          <div key={index} className="bg-gray5 border border-gray4 rounded-lg px-3 py-1 flex flex-col items-center mb-2">
            <div className="w-full flex justify-between items-start">
              <span>{tag.name}</span>
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
              <Link href={tag.internal_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                {`링크: ${ tag.internal_link }`}
              </Link>
            )}
          </div>
        ))}
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1 text-gray0">{'관련 포스트 검색'}</label>
        <div className="relative">
          <InternalLinkSearch onSelect={handleLinkSelect} refocus />
        </div>
      </div>
      <p className="text-sm text-gray2 mt-1">{'Diki 내 포스트를 검색하여 선택하면, 관련 포스트가 자동으로 추가됩니다.\n 추가된 포스트의 링크를 눌러 확인할 수 있습니다.'}</p>
    </div>
  );
};

export default TagsSection;