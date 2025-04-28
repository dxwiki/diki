import Link from 'next/link';
import React, { useState, useRef } from 'react';
import { TermData, References } from '@/types/database';
import { X } from 'lucide-react';

interface ReferencesSectionProps {
  formData?: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
}

const ReferencesSection = ({ formData, setFormData }: ReferencesSectionProps) => {
  // 콜백 실행 여부를 추적하기 위한 ref 추가
  const tutorialCallbackRef = useRef(false);
  const bookCallbackRef = useRef(false);
  const academicCallbackRef = useRef(false);
  const opensourceCallbackRef = useRef(false);

  // 튜토리얼 상태
  const [tutorial, setTutorial] = useState<{
    title?: string;
    platform?: string;
    external_link?: string;
  }>({});

  // 책 상태
  const [book, setBook] = useState<{
    title?: string;
    authors?: string[];
    publisher?: string;
    year?: string;
    isbn?: string;
    external_link?: string;
  }>({});

  // 연구논문 상태
  const [academic, setAcademic] = useState<{
    title?: string;
    authors?: string[];
    year?: string;
    doi?: string;
    external_link?: string;
  }>({});

  // 오픈소스 상태
  const [opensource, setOpensource] = useState<{
    name?: string;
    license?: string;
    description?: string;
    external_link?: string;
  }>({});

  // 튜토리얼 추가 함수 - 수정된 버전
  const handleAddTutorial = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('handleAddTutorial called with:', tutorial);

    if (tutorial.title?.trim()) {
      // 현재 튜토리얼 객체 복사
      const newTutorial = { ...tutorial };

      // 콜백 실행 여부 초기화
      tutorialCallbackRef.current = false;

      // 상태 업데이트
      setFormData((prev) => {
        // 이미 콜백이 실행되었으면 이전 상태 그대로 반환
        if (tutorialCallbackRef.current) {
          console.log('Preventing duplicate tutorial callback execution');
          return prev;
        }

        // 콜백 실행 여부 표시
        tutorialCallbackRef.current = true;

        console.log('setFormData (tutorials) - prev:', prev.references?.tutorials);

        // 이전 references 복사 또는 초기화
        const newRefs = {
          ...(prev.references || { tutorials: [], books: [], academic: [], opensource: [] }),
        } as References;

        // tutorials 배열 초기화
        if (!newRefs.tutorials) newRefs.tutorials = [];

        // 새 튜토리얼 추가
        newRefs.tutorials.push(newTutorial);

        console.log('setFormData (tutorials) - new:', newRefs.tutorials);

        // 새 상태 반환
        return { ...prev, references: newRefs };
      });

      // 입력 필드 초기화
      setTutorial({ title: '', platform: '', external_link: '' });
    }
  };

  // 책 추가 함수 - 수정된 버전
  const handleAddBook = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('handleAddBook called with:', book);

    if (book.title?.trim()) {
      // 현재 책 객체 복사
      const newBook = { ...book };

      // 콜백 실행 여부 초기화
      bookCallbackRef.current = false;

      // 상태 업데이트
      setFormData((prev) => {
        // 이미 콜백이 실행되었으면 이전 상태 그대로 반환
        if (bookCallbackRef.current) {
          console.log('Preventing duplicate book callback execution');
          return prev;
        }

        // 콜백 실행 여부 표시
        bookCallbackRef.current = true;

        console.log('setFormData (books) - prev:', prev.references?.books);

        // 이전 references 복사 또는 초기화
        const newRefs = {
          ...(prev.references || { tutorials: [], books: [], academic: [], opensource: [] }),
        } as References;

        // books 배열 초기화
        if (!newRefs.books) newRefs.books = [];

        // 새 책 추가
        newRefs.books.push(newBook);

        console.log('setFormData (books) - new:', newRefs.books);

        // 새 상태 반환
        return { ...prev, references: newRefs };
      });

      // 입력 필드 초기화
      setBook({ title: '', authors: [], publisher: '', year: '', isbn: '', external_link: '' });
    }
  };

  // 연구논문 추가 함수 - 수정된 버전
  const handleAddAcademic = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('handleAddAcademic called with:', academic);

    if (academic.title?.trim()) {
      // 현재 논문 객체 복사
      const newAcademic = { ...academic };

      // 콜백 실행 여부 초기화
      academicCallbackRef.current = false;

      // 상태 업데이트
      setFormData((prev) => {
        // 이미 콜백이 실행되었으면 이전 상태 그대로 반환
        if (academicCallbackRef.current) {
          console.log('Preventing duplicate academic callback execution');
          return prev;
        }

        // 콜백 실행 여부 표시
        academicCallbackRef.current = true;

        console.log('setFormData (academic) - prev:', prev.references?.academic);

        // 이전 references 복사 또는 초기화
        const newRefs = {
          ...(prev.references || { tutorials: [], books: [], academic: [], opensource: [] }),
        } as References;

        // academic 배열 초기화
        if (!newRefs.academic) newRefs.academic = [];

        // 새 논문 추가
        newRefs.academic.push(newAcademic);

        console.log('setFormData (academic) - new:', newRefs.academic);

        // 새 상태 반환
        return { ...prev, references: newRefs };
      });

      // 입력 필드 초기화
      setAcademic({ title: '', authors: [], year: '', doi: '', external_link: '' });
    }
  };

  // 오픈소스 추가 함수 - 수정된 버전
  const handleAddOpensource = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('handleAddOpensource called with:', opensource);

    if (opensource.name?.trim()) {
      // 현재 오픈소스 객체 복사
      const newOpensource = { ...opensource };

      // 콜백 실행 여부 초기화
      opensourceCallbackRef.current = false;

      // 상태 업데이트
      setFormData((prev) => {
        // 이미 콜백이 실행되었으면 이전 상태 그대로 반환
        if (opensourceCallbackRef.current) {
          console.log('Preventing duplicate opensource callback execution');
          return prev;
        }

        // 콜백 실행 여부 표시
        opensourceCallbackRef.current = true;

        console.log('setFormData (opensource) - prev:', prev.references?.opensource);

        // 이전 references 복사 또는 초기화
        const newRefs = {
          ...(prev.references || { tutorials: [], books: [], academic: [], opensource: [] }),
        } as References;

        // opensource 배열 초기화
        if (!newRefs.opensource) newRefs.opensource = [];

        // 새 오픈소스 추가
        newRefs.opensource.push(newOpensource);

        console.log('setFormData (opensource) - new:', newRefs.opensource);

        // 새 상태 반환
        return { ...prev, references: newRefs };
      });

      // 입력 필드 초기화
      setOpensource({ name: '', license: '', description: '', external_link: '' });
    }
  };

  // 참고자료 제거 함수
  const handleRemoveTutorial = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setFormData((prev) => {
      const newRefs = { ...prev.references } as References;
      if (newRefs.tutorials) {
        newRefs.tutorials = newRefs.tutorials.filter((_, i) => i !== index);
      }
      return { ...prev, references: newRefs };
    });
  };

  const handleRemoveBook = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setFormData((prev) => {
      const newRefs = { ...prev.references } as References;
      if (newRefs.books) {
        newRefs.books = newRefs.books.filter((_, i) => i !== index);
      }
      return { ...prev, references: newRefs };
    });
  };

  const handleRemoveAcademic = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setFormData((prev) => {
      const newRefs = { ...prev.references } as References;
      if (newRefs.academic) {
        newRefs.academic = newRefs.academic.filter((_, i) => i !== index);
      }
      return { ...prev, references: newRefs };
    });
  };

  const handleRemoveOpensource = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setFormData((prev) => {
      const newRefs = { ...prev.references } as References;
      if (newRefs.opensource) {
        newRefs.opensource = newRefs.opensource.filter((_, i) => i !== index);
      }
      return { ...prev, references: newRefs };
    });
  };

  return (
    <div className="p-2 md:p-6">
      <h2 className="flex items-center text-xl font-semibold mb-4">
        <span className="text-primary mr-1">{'#'}</span>
        {'참고 자료 (선택)'}
      </h2>

      {/* 튜토리얼 섹션 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium">
          <span className="text-primary mr-1">{'##'}</span>
          {'튜토리얼'}
        </h3>
        {/* 추가된 튜토리얼 목록 */}
        <div className="flex flex-wrap gap-2 my-2">
          {formData?.references?.tutorials?.map((item, index) => (
            <div key={index} className="bg-gray5 rounded-lg p-3 flex flex-col border border-gray4">
              <div className="flex justify-between items-start">
                <span className="font-medium">{item.title}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveTutorial(index, e)}
                  className="ml-2 text-level-5"
                >
                  <X className="size-5" />
                </button>
              </div>
              {item.platform && <span className="text-sm">{`플랫폼: ${ item.platform }`}</span>}
              {item.external_link && (
                <Link href={item.external_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                  {`링크: ${ item.external_link }`}
                </Link>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="border border-gray4 p-3 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray0">{'제목'}</label>
                <input
                  type="text"
                  placeholder="튜토리얼 제목"
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={tutorial.title || ''}
                  onChange={(e) => setTutorial({ ...tutorial, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray0">{'플랫폼'}</label>
                <input
                  type="text"
                  placeholder="플랫폼 (ex. TensorFlow, PyTorch, OpenCV)"
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={tutorial.platform || ''}
                  onChange={(e) => setTutorial({ ...tutorial, platform: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray0">{'링크'}</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={tutorial.external_link || ''}
                  onChange={(e) => setTutorial({ ...tutorial, external_link: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddTutorial}
                  className="px-4 py-2 text-main border border-gray4 bg-gray4 hover:text-white hover:bg-gray3 rounded-md"
                >
                  {'추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 책 섹션 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium">
          <span className="text-primary mr-1">{'##'}</span>
          {'참고서적'}
        </h3>
        {/* 추가된 책 목록 */}
        <div className="flex flex-wrap gap-2 my-2">
          {formData?.references?.books?.map((item, index) => (
            <div key={index} className="bg-gray5 rounded-lg p-3 flex flex-col border border-gray4">
              <div className="flex justify-between items-start">
                <span className="font-medium">{item.title}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveBook(index, e)}
                  className="ml-2 text-level-5"
                >
                  <X className="size-5" />
                </button>
              </div>
              {item.authors && item.authors.length > 0 && <span className="text-sm">{`저자: ${ item.authors.join(', ') }`}</span>}
              {item.publisher && <span className="text-sm">{`출판사: ${ item.publisher }`}</span>}
              {item.year && <span className="text-sm">{`출판년도: ${ item.year }`}</span>}
              {item.isbn && <span className="text-sm">{`ISBN: ${ item.isbn }`}</span>}
              {item.external_link && (
                <Link href={item.external_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                  {`링크: ${ item.external_link }`}
                </Link>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="border border-gray4 p-3 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray0">{'제목'}</label>
                <input
                  type="text"
                  placeholder="책 제목"
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={book.title || ''}
                  onChange={(e) => setBook({ ...book, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray0">{'저자'}</label>
                <input
                  type="text"
                  placeholder="저자 (여러 명인 경우, 콤마로 구분)"
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={book.authors?.join(', ') || ''}
                  onChange={(e) => setBook({ ...book, authors: e.target.value.split(',').map((a) => a.trim()) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray0">{'출판사'}</label>
                <input
                  type="text"
                  placeholder="출판사"
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={book.publisher || ''}
                  onChange={(e) => setBook({ ...book, publisher: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray0">{'출판년도'}</label>
                <input
                  type="text"
                  placeholder="YYYY"
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={book.year || ''}
                  onChange={(e) => setBook({ ...book, year: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray0">{'ISBN'}</label>
                <input
                  type="text"
                  placeholder="ISBN"
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={book.isbn || ''}
                  onChange={(e) => setBook({ ...book, isbn: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray0">{'링크'}</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={book.external_link || ''}
                  onChange={(e) => setBook({ ...book, external_link: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddBook}
                  className="px-4 py-2 text-main border border-gray4 bg-gray4 hover:text-white hover:bg-gray3 rounded-md"
                >
                  {'추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 연구논문 섹션 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium">
          <span className="text-primary mr-1">{'##'}</span>
          {'연구논문'}
        </h3>
        {/* 추가된 연구논문 목록 */}
        <div className="flex flex-wrap gap-2 my-2">
          {formData?.references?.academic?.map((item, index) => (
            <div key={index} className="bg-gray5 rounded-lg p-3 flex flex-col border border-gray4">
              <div className="flex justify-between items-start">
                <span className="font-medium">{item.title}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveAcademic(index, e)}
                  className="ml-2 text-level-5"
                >
                  <X className="size-5" />
                </button>
              </div>
              {item.authors && item.authors.length > 0 && <span className="text-sm">{`저자: ${ item.authors.join(', ') }`}</span>}
              {item.year && <span className="text-sm">{`출판년도: ${ item.year }`}</span>}
              {item.doi && <span className="text-sm">{`DOI: ${ item.doi }`}</span>}
              {item.external_link && (
                <Link href={item.external_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                  {`링크: ${ item.external_link }`}
                </Link>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="border border-gray4 p-3 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray0">{'제목'}</label>
                <input
                  type="text"
                  placeholder="논문 제목"
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={academic.title || ''}
                  onChange={(e) => setAcademic({ ...academic, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray0">{'저자'}</label>
                <input
                  type="text"
                  placeholder="저자 (여러 명인 경우, 콤마로 구분)"
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={academic.authors?.join(', ') || ''}
                  onChange={(e) => setAcademic({ ...academic, authors: e.target.value.split(',').map((a) => a.trim()) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray0">{'출판년도'}</label>
                <input
                  type="text"
                  placeholder="YYYY"
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={academic.year || ''}
                  onChange={(e) => setAcademic({ ...academic, year: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray0">{'DOI'}</label>
                <input
                  type="text"
                  placeholder="DOI"
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={academic.doi || ''}
                  onChange={(e) => setAcademic({ ...academic, doi: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray0">{'링크'}</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={academic.external_link || ''}
                  onChange={(e) => setAcademic({ ...academic, external_link: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddAcademic}
                  className="px-4 py-2 text-main border border-gray4 bg-gray4 hover:text-white hover:bg-gray3 rounded-md"
                >
                  {'추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 오픈소스 섹션 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium">
          <span className="text-primary mr-1">{'##'}</span>
          {'오픈소스'}
        </h3>
        {/* 추가된 오픈소스 목록 */}
        <div className="flex flex-wrap gap-2 my-2">
          {formData?.references?.opensource?.map((item, index) => (
            <div key={index} className="bg-gray5 rounded-lg p-3 flex flex-col border border-gray4">
              <div className="flex justify-between items-start">
                <span className="font-medium">{item.name}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveOpensource(index, e)}
                  className="ml-2 text-level-5"
                >
                  <X className="size-5" />
                </button>
              </div>
              {item.license && <span className="text-sm">{`라이센스: ${ item.license }`}</span>}
              {item.description && <span className="text-sm">{`설명: ${ item.description }`}</span>}
              {item.external_link && (
                <Link href={item.external_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                  {`링크: ${ item.external_link }`}
                </Link>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="border border-gray4 p-3 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray0">{'이름'}</label>
                <input
                  type="text"
                  placeholder="오픈소스 프로젝트 이름"
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={opensource.name || ''}
                  onChange={(e) => setOpensource({ ...opensource, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray0">{'라이센스'}</label>
                <input
                  type="text"
                  placeholder="라이센스 (ex. MIT, GPL)"
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={opensource.license || ''}
                  onChange={(e) => setOpensource({ ...opensource, license: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}</label>
                <textarea
                  placeholder="간략한 설명"
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={opensource.description || ''}
                  onChange={(e) => setOpensource({ ...opensource, description: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray0">{'링크'}</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full p-2 border border-gray4 rounded-md"
                  value={opensource.external_link || ''}
                  onChange={(e) => setOpensource({ ...opensource, external_link: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddOpensource}
                  className="px-4 py-2 text-main border border-gray4 bg-gray4 hover:text-white hover:bg-gray3 rounded-md"
                >
                  {'추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferencesSection;