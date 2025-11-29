import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setFieldTouched, setFieldValid } from '@/store/formValidationSlice';
import { isFieldEmpty, getFieldGuidance } from '@/utils/formValidation';
import { TermData } from '@/types/database';
import { X } from 'lucide-react';
import InternalLinkSearch from './InternalLinkSearch';

interface TagsSectionProps {
  formData: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
}

const TagsSection = ({ formData, setFormData }: TagsSectionProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const fieldValid = useSelector((state: RootState) => state.formValidation.fieldValid['tags']);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const isEmpty = isFieldEmpty(formData, 'tags');
  const guidance = getFieldGuidance('tags');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // tags가 변경될 때마다 유효성 체크
  useEffect(() => {
    const hasTags = Array.isArray(formData.tags) && formData.tags.length > 0;
    dispatch(setFieldValid({ field: 'tags', valid: hasTags }));

    if (hasTags) {
      dispatch(setFieldTouched({ field: 'tags', touched: true }));
    }
  }, [formData.tags, dispatch]);

  const handleLinkSelect = (url: string, title: string) => {
    // URL에서 /posts/ 접두사 제거
    const cleanUrl = url.replace(/^\/posts\//, '');

    const tagToAdd = {
      name: title,
      internal_link: cleanUrl,
    };

    setFormData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), tagToAdd],
    }));
  };

  // guidance 표시 조건
  const showGuidance = isEmpty;

  return (
    <div className="p-2">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {formData.tags?.map((tag, index) => (
          <div key={index} className={`bg-gray5 border ${ fieldValid ? 'border-primary' : 'border-gray4' } rounded-lg px-3 py-1 flex flex-col items-center mb-2 transition-colors duration-200`}>
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
              <Link href={`/posts/${ tag.internal_link }`} target="_blank" rel="noopener noreferrer" className="w-full text-sm text-primary hover:underline truncate">
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
        {showGuidance && (
          <p className="text-sm text-level-5 mt-1">{guidance}</p>
        )}
      </div>
      <p className="text-sm text-gray2 mt-1">{'Diki 내 포스트를 검색하여 선택하면, 관련 포스트가 자동으로 추가됩니다.\n 추가된 포스트의 링크를 눌러 확인할 수 있습니다.'}</p>
    </div>
  );
};

export default TagsSection;
