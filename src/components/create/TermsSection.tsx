import { TermData } from '@/types/database';
import React, { useState } from 'react';

interface TermsSectionProps {
  formData: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
}

const TermsSection = ({ formData, setFormData }: TermsSectionProps) => {
  const [newTerm, setNewTerm] = useState({ term: '', description: '', internal_link: undefined as string | undefined });

  const handleAddTerm = () => {
    if (newTerm.term.trim() && newTerm.description.trim()) {
      setFormData((prev) => ({
        ...prev,
        terms: [...(prev.terms || []), { ...newTerm }],
      }));
      setNewTerm({ term: '', description: '', internal_link: undefined });
    }
  };

  return (
    <div className="p-2 md:p-6 border-b border-gray4">
      <h2 className="flex items-center text-xl font-semibold mb-4">
        <span className="text-primary mr-1">{'#'}</span>
        {'관련 용어'}
      </h2>
      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">{'용어'}</label>
          <input
            type="text"
            value={newTerm.term}
            onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
            className="w-full p-2 border border-gray4 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{'설명'}</label>
          <textarea
            value={newTerm.description}
            onChange={(e) => setNewTerm({ ...newTerm, description: e.target.value })}
            className="w-full p-2 border border-gray4 rounded-md"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{'내부 링크 (선택사항)'}</label>
          <input
            type="text"
            value={newTerm.internal_link || ''}
            onChange={(e) => setNewTerm({ ...newTerm, internal_link: e.target.value || undefined })}
            className="w-full p-2 border border-gray4 rounded-md"
          />
        </div>
        <button
          type="button"
          onClick={handleAddTerm}
          className="px-4 py-2 text-main hover:bg-gray4 rounded-md border-gray4"
        >
          {'용어 추가'}
        </button>
      </div>

      {formData.terms && formData.terms.length > 0 && (
        <div className="mt-4 border p-4 rounded-lg">
          <h3 className="font-medium mb-2">{'추가된 용어'}</h3>
          {formData.terms.map((term, index) => (
            <div key={index} className="mb-2 pb-2 border-b last:border-b-0">
              <div className="flex justify-between">
                <strong>{term.term}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      terms: prev.terms?.filter((_, i) => i !== index),
                    }));
                  }}
                  className="text-level-5"
                >
                  {'삭제'}
                </button>
              </div>
              <p className="text-sm">{term.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TermsSection;