import { TermData, References } from '@/types/database';
import React from 'react';

interface ReferencesSectionProps {
  formData?: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
}

const ReferencesSection = ({ setFormData }: ReferencesSectionProps) => {
  return (
    <div className="p-2 md:p-6">
      <h2 className="flex items-center text-xl font-semibold mb-4">
        <span className="text-primary mr-1">{'#'}</span>
        {'참고 자료'}
      </h2>

      {/* 튜토리얼 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">
          <span className="text-primary mr-1">{'##'}</span>
          {'튜토리얼'}
        </h3>
        <div className="space-y-2">
          <div className="border border-gray4 p-3 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">{'제목'}</label>
                <input
                  type="text"
                  placeholder="튜토리얼 제목"
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.tutorials) newRefs.tutorials = [];
                      if (!newRefs.tutorials[0]) newRefs.tutorials[0] = {};
                      newRefs.tutorials[0].title = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{'플랫폼'}</label>
                <input
                  type="text"
                  placeholder="플랫폼 (ex: YouTube, Coursera)"
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.tutorials) newRefs.tutorials = [];
                      if (!newRefs.tutorials[0]) newRefs.tutorials[0] = {};
                      newRefs.tutorials[0].platform = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{'링크'}</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.tutorials) newRefs.tutorials = [];
                      if (!newRefs.tutorials[0]) newRefs.tutorials[0] = {};
                      newRefs.tutorials[0].external_link = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 책 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">
          <span className="text-primary mr-1">{'##'}</span>
          {'참고서적'}
        </h3>
        <div className="space-y-2">
          <div className="border border-gray4 p-3 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">{'제목'}</label>
                <input
                  type="text"
                  placeholder="책 제목"
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.books) newRefs.books = [];
                      if (!newRefs.books[0]) newRefs.books[0] = {};
                      newRefs.books[0].title = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{'저자'}</label>
                <input
                  type="text"
                  placeholder="저자 (콤마로 구분)"
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.books) newRefs.books = [];
                      if (!newRefs.books[0]) newRefs.books[0] = {};
                      newRefs.books[0].authors = value.split(',').map((a) => a.trim());
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{'출판사'}</label>
                <input
                  type="text"
                  placeholder="출판사"
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.books) newRefs.books = [];
                      if (!newRefs.books[0]) newRefs.books[0] = {};
                      newRefs.books[0].publisher = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{'출판년도'}</label>
                <input
                  type="text"
                  placeholder="YYYY"
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.books) newRefs.books = [];
                      if (!newRefs.books[0]) newRefs.books[0] = {};
                      newRefs.books[0].year = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{'ISBN'}</label>
                <input
                  type="text"
                  placeholder="ISBN"
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.books) newRefs.books = [];
                      if (!newRefs.books[0]) newRefs.books[0] = {};
                      newRefs.books[0].isbn = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{'링크'}</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.books) newRefs.books = [];
                      if (!newRefs.books[0]) newRefs.books[0] = {};
                      newRefs.books[0].external_link = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 연구논문 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">
          <span className="text-primary mr-1">{'##'}</span>
          {'연구논문'}
        </h3>
        <div className="space-y-2">
          <div className="border border-gray4 p-3 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">{'제목'}</label>
                <input
                  type="text"
                  placeholder="논문 제목"
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.academic) newRefs.academic = [];
                      if (!newRefs.academic[0]) newRefs.academic[0] = {};
                      newRefs.academic[0].title = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{'저자'}</label>
                <input
                  type="text"
                  placeholder="저자 (콤마로 구분)"
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.academic) newRefs.academic = [];
                      if (!newRefs.academic[0]) newRefs.academic[0] = {};
                      newRefs.academic[0].authors = value.split(',').map((a) => a.trim());
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{'발행년도'}</label>
                <input
                  type="text"
                  placeholder="YYYY"
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.academic) newRefs.academic = [];
                      if (!newRefs.academic[0]) newRefs.academic[0] = {};
                      newRefs.academic[0].year = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{'DOI'}</label>
                <input
                  type="text"
                  placeholder="DOI"
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.academic) newRefs.academic = [];
                      if (!newRefs.academic[0]) newRefs.academic[0] = {};
                      newRefs.academic[0].doi = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{'링크'}</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.academic) newRefs.academic = [];
                      if (!newRefs.academic[0]) newRefs.academic[0] = {};
                      newRefs.academic[0].external_link = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 오픈소스 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">
          <span className="text-primary mr-1">{'##'}</span>
          {'오픈소스'}
        </h3>
        <div className="space-y-2">
          <div className="border border-gray4 p-3 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">{'이름'}</label>
                <input
                  type="text"
                  placeholder="오픈소스 이름"
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.opensource) newRefs.opensource = [];
                      if (!newRefs.opensource[0]) newRefs.opensource[0] = {};
                      newRefs.opensource[0].name = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{'라이센스'}</label>
                <input
                  type="text"
                  placeholder="라이센스 (ex: MIT, Apache 2.0)"
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.opensource) newRefs.opensource = [];
                      if (!newRefs.opensource[0]) newRefs.opensource[0] = {};
                      newRefs.opensource[0].license = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{'설명'}</label>
                <textarea
                  placeholder="오픈소스 프로젝트에 대한 간략한 설명"
                  rows={2}
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.opensource) newRefs.opensource = [];
                      if (!newRefs.opensource[0]) newRefs.opensource[0] = {};
                      newRefs.opensource[0].description = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{'링크'}</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full p-2 border border-gray4 rounded-md"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const newRefs = { ...prev.references } as References;
                      if (!newRefs.opensource) newRefs.opensource = [];
                      if (!newRefs.opensource[0]) newRefs.opensource[0] = {};
                      newRefs.opensource[0].external_link = value;
                      return { ...prev, references: newRefs };
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferencesSection;