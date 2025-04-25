import { TermData } from '@/types/database';
import React, { useState } from 'react';

interface TagsSectionProps {
  formData: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
}

const TagsSection = ({ formData, setFormData }: TagsSectionProps) => {
  const [newTag, setNewTag] = useState({ name: '', internal_link: '' });

  const handleAddTag = () => {
    if (newTag.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), { ...newTag }],
      }));
      setNewTag({ name: '', internal_link: '' });
    }
  };

  return (
    <div className="bg-gray5 border-gray4 p-6 rounded-lg shadow-xl">
      <h2 className="text-xl font-semibold mb-4">{'태그'}</h2>
      <div className="flex items-end space-x-2 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">{'태그 이름'}</label>
          <input
            type="text"
            value={newTag.name}
            onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
            className="w-full p-2 border border-gray4 rounded-md"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">{'내부 링크'}</label>
          <input
            type="text"
            value={newTag.internal_link}
            onChange={(e) => setNewTag({ ...newTag, internal_link: e.target.value })}
            className="w-full p-2 border border-gray4 rounded-md"
          />
        </div>
        <button
          type="button"
          onClick={handleAddTag}
          className="px-4 py-2 text-main hover:bg-gray4 rounded-md border-gray4"
        >
          {'추가'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {formData.tags?.map((tag, index) => (
          <div key={index} className="bg-gray5 rounded-lg px-3 py-1 flex items-center">
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
              {'×'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagsSection;