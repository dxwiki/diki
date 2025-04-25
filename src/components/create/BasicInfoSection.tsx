import { TermData } from '@/types/database';
import React from 'react';

interface BasicInfoSectionProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
}

const BasicInfoSection = ({ formData, handleChange }: BasicInfoSectionProps) => {
  return (
    <div className="bg-gray5 border-gray4 p-6 rounded-lg shadow-xl">
      <h2 className="text-xl font-semibold mb-4">{'기본 정보'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">{'한글 제목'}</label>
          <input
            type="text"
            name="title.ko"
            value={formData.title?.ko || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray4 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{'영문 제목'}</label>
          <input
            type="text"
            name="title.en"
            value={formData.title?.en || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray4 rounded-md"
            required
          />
        </div>

        <div className='md:col-span-2'>
          <label className="block text-sm font-medium mb-1">{'짧은 설명'}</label>
          <div className="relative">
            <textarea
              name="description.short"
              value={formData.description?.short || ''}
              onChange={(e) => {
                handleChange(e);
                // 높이 자동 조절
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              className="w-full p-2 border border-gray4 rounded-md resize-none overflow-hidden"
              required
              placeholder="100자 이내로 간략히 설명해주세요"
              maxLength={100}
              rows={1}
              style={{ minHeight: '42px' }}
            />
            <div className="absolute right-2 text-xs text-gray2">
              {`${ formData.description?.short?.length || 0 }/100`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;