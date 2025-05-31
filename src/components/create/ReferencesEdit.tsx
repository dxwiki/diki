import Link from 'next/link';
import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { TermData, References } from '@/types/database';
import { X } from 'lucide-react';

interface ReferencesSectionProps {
  formData?: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
}

type ReferenceTab = 'tutorial' | 'book' | 'academic' | 'opensource';

const ReferencesSection = ({ formData, setFormData }: ReferencesSectionProps) => {
  const [activeTab, setActiveTab] = useState<ReferenceTab>('tutorial');
  const containerRef = useRef<HTMLDivElement>(null);

  const tutorialCallbackRef = useRef(false);
  const bookCallbackRef = useRef(false);
  const academicCallbackRef = useRef(false);
  const opensourceCallbackRef = useRef(false);

  const [tutorial, setTutorial] = useState<{
    title?: string;
    platform?: string;
    external_link?: string;
  }>({});

  const [book, setBook] = useState<{
    title?: string;
    authors?: string[];
    publisher?: string;
    year?: string;
    isbn?: string;
    external_link?: string;
  }>({});

  const [academic, setAcademic] = useState<{
    title?: string;
    authors?: string[];
    year?: string;
    doi?: string;
    external_link?: string;
  }>({});

  const [opensource, setOpensource] = useState<{
    name?: string;
    license?: string;
    description?: string;
    external_link?: string;
  }>({});

  // CSS의 transitions와 animations이 탭 변경 시 스크롤 위치에 영향을 미치는 것을 방지
  useEffect(() => {
    const currentContainer = containerRef.current;

    return () => {
      if (currentContainer) {
        const parentElement = currentContainer.closest('.prose');
        if (parentElement && parentElement.scrollTop) {
          requestAnimationFrame(() => {
            parentElement.scrollTo({
              top: parentElement.scrollTop,
              behavior: 'auto',
            });
          });
        }
      }
    };
  }, [activeTab]);

  const tutorialTitleRef = useRef<HTMLInputElement>(null);
  const tutorialPlatformRef = useRef<HTMLInputElement>(null);
  const tutorialLinkRef = useRef<HTMLInputElement>(null);

  const bookTitleRef = useRef<HTMLInputElement>(null);
  const bookAuthorsRef = useRef<HTMLInputElement>(null);
  const bookPublisherRef = useRef<HTMLInputElement>(null);
  const bookYearRef = useRef<HTMLInputElement>(null);
  const bookIsbnRef = useRef<HTMLInputElement>(null);
  const bookLinkRef = useRef<HTMLInputElement>(null);

  const academicTitleRef = useRef<HTMLInputElement>(null);
  const academicAuthorsRef = useRef<HTMLInputElement>(null);
  const academicYearRef = useRef<HTMLInputElement>(null);
  const academicDoiRef = useRef<HTMLInputElement>(null);
  const academicLinkRef = useRef<HTMLInputElement>(null);

  const opensourceNameRef = useRef<HTMLInputElement>(null);
  const opensourceLicenseRef = useRef<HTMLInputElement>(null);
  const opensourceDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const opensourceLinkRef = useRef<HTMLInputElement>(null);

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, nextRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  const handleAddTutorial = (e: React.MouseEvent) => {
    e.preventDefault();

    if (tutorial.title?.trim() && tutorial.external_link?.trim()) {
      const newTutorial = { ...tutorial };
      tutorialCallbackRef.current = false;

      setFormData((prev) => {
        if (tutorialCallbackRef.current) return prev;
        tutorialCallbackRef.current = true;

        const newRefs = {
          ...(prev.references || { tutorials: [], books: [], academic: [], opensource: [] }),
        } as References;

        if (!newRefs.tutorials) newRefs.tutorials = [];
        newRefs.tutorials.push(newTutorial);

        return { ...prev, references: newRefs };
      });

      setTutorial({ title: '', platform: '', external_link: '' });
    }
  };

  const handleAddBook = (e: React.MouseEvent) => {
    e.preventDefault();

    if (book.title?.trim() && book.external_link?.trim()) {
      const newBook = { ...book };
      bookCallbackRef.current = false;

      setFormData((prev) => {
        if (bookCallbackRef.current) return prev;
        bookCallbackRef.current = true;

        const newRefs = {
          ...(prev.references || { tutorials: [], books: [], academic: [], opensource: [] }),
        } as References;

        if (!newRefs.books) newRefs.books = [];
        newRefs.books.push(newBook);

        return { ...prev, references: newRefs };
      });

      setBook({ title: '', authors: [], publisher: '', year: '', isbn: '', external_link: '' });
    }
  };

  const handleAddAcademic = (e: React.MouseEvent) => {
    e.preventDefault();

    if (academic.title?.trim() && academic.external_link?.trim()) {
      const newAcademic = { ...academic };
      academicCallbackRef.current = false;

      setFormData((prev) => {
        if (academicCallbackRef.current) return prev;
        academicCallbackRef.current = true;

        const newRefs = {
          ...(prev.references || { tutorials: [], books: [], academic: [], opensource: [] }),
        } as References;

        if (!newRefs.academic) newRefs.academic = [];
        newRefs.academic.push(newAcademic);

        return { ...prev, references: newRefs };
      });

      setAcademic({ title: '', authors: [], year: '', doi: '', external_link: '' });
    }
  };

  const handleAddOpensource = (e: React.MouseEvent) => {
    e.preventDefault();

    if (opensource.name?.trim() && opensource.external_link?.trim()) {
      const newOpensource = { ...opensource };
      opensourceCallbackRef.current = false;

      setFormData((prev) => {
        if (opensourceCallbackRef.current) return prev;
        opensourceCallbackRef.current = true;

        const newRefs = {
          ...(prev.references || { tutorials: [], books: [], academic: [], opensource: [] }),
        } as References;

        if (!newRefs.opensource) newRefs.opensource = [];
        newRefs.opensource.push(newOpensource);

        return { ...prev, references: newRefs };
      });

      setOpensource({ name: '', license: '', description: '', external_link: '' });
    }
  };

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

  const handleTabChange = (e: React.MouseEvent, tab: ReferenceTab) => {
    e.preventDefault();
    setActiveTab(tab);
  };

  return (
    <div className="p-2" ref={containerRef}>
      {/* 탭 내비게이션 */}
      <div className="flex border-b border-gray4 mb-4">
        <button
          onClick={(e) => handleTabChange(e, 'tutorial')}
          className={`px-4 py-2 ${ activeTab === 'tutorial' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray0' }`}
        >
          {'튜토리얼'}
        </button>
        <button
          onClick={(e) => handleTabChange(e, 'book')}
          className={`px-4 py-2 ${ activeTab === 'book' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray0' }`}
        >
          {'참고서적'}
        </button>
        <button
          onClick={(e) => handleTabChange(e, 'academic')}
          className={`px-4 py-2 ${ activeTab === 'academic' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray0' }`}
        >
          {'연구논문'}
        </button>
        <button
          onClick={(e) => handleTabChange(e, 'opensource')}
          className={`px-4 py-2 ${ activeTab === 'opensource' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray0' }`}
        >
          {'오픈소스'}
        </button>
      </div>

      {/* 각 탭 컨텐츠를 감싸는 컨테이너 */}
      <div className="tab-content-container relative">
        {/* 튜토리얼 탭 컨텐츠 */}
        {activeTab === 'tutorial' && (
          <div className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {formData?.references?.tutorials?.map((item, index) => (
                <div key={index} className="bg-gray5 rounded-lg p-3 flex flex-col border border-gray4 mb-2">
                  <div className="flex justify-between items-start">
                    <span className="font-medium truncate">{item.title}</span>
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
                      ref={tutorialTitleRef}
                      type="text"
                      placeholder="튜토리얼 제목"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={tutorial.title || ''}
                      onChange={(e) => setTutorial({ ...tutorial, title: e.target.value })}
                      onKeyDown={(e) => handleInputKeyDown(e, tutorialPlatformRef)}
                    />
                    <p className="text-sm text-primary ml-1">{'관련자료 추가를 위한 제목은 필숫값입니다.'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'플랫폼'}</label>
                    <input
                      ref={tutorialPlatformRef}
                      type="text"
                      placeholder="플랫폼 (ex. TensorFlow, PyTorch, OpenCV)"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={tutorial.platform || ''}
                      onChange={(e) => setTutorial({ ...tutorial, platform: e.target.value })}
                      onKeyDown={(e) => handleInputKeyDown(e, tutorialLinkRef)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray0">{'링크'}</label>
                    <input
                      ref={tutorialLinkRef}
                      type="url"
                      placeholder="https://..."
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={tutorial.external_link || ''}
                      onChange={(e) => setTutorial({ ...tutorial, external_link: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          handleAddTutorial(e as unknown as React.MouseEvent<Element, MouseEvent>);
                        }
                      }}
                    />
                    <p className="text-sm text-primary ml-1">{'관련 자료 추가를 위한 링크는 필숫값입니다.'}</p>
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
        )}

        {/* 참고서적 탭 컨텐츠 */}
        {activeTab === 'book' && (
          <div className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {formData?.references?.books?.map((item, index) => (
                <div key={index} className="bg-gray5 rounded-lg p-3 flex flex-col border border-gray4 mb-2">
                  <div className="flex justify-between items-start">
                    <span className="font-medium truncate">{item.title}</span>
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
                      ref={bookTitleRef}
                      type="text"
                      placeholder="책 제목"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={book.title || ''}
                      onChange={(e) => setBook({ ...book, title: e.target.value })}
                      onKeyDown={(e) => handleInputKeyDown(e, bookAuthorsRef)}
                    />
                    <p className="text-sm text-primary ml-1">{'관련 자료 추가를 위한 제목은 필숫값입니다.'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'저자'}</label>
                    <input
                      ref={bookAuthorsRef}
                      type="text"
                      placeholder="저자 (여러 명인 경우, 콤마로 구분)"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={book.authors?.join(', ') || ''}
                      onChange={(e) => setBook({ ...book, authors: e.target.value.split(',').map((a) => a.trim()) })}
                      onKeyDown={(e) => handleInputKeyDown(e, bookPublisherRef)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'출판사'}</label>
                    <input
                      ref={bookPublisherRef}
                      type="text"
                      placeholder="출판사"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={book.publisher || ''}
                      onChange={(e) => setBook({ ...book, publisher: e.target.value })}
                      onKeyDown={(e) => handleInputKeyDown(e, bookYearRef)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'출판년도'}</label>
                    <input
                      ref={bookYearRef}
                      type="text"
                      placeholder="YYYY"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={book.year || ''}
                      onChange={(e) => setBook({ ...book, year: e.target.value })}
                      onKeyDown={(e) => handleInputKeyDown(e, bookIsbnRef)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'ISBN'}</label>
                    <input
                      ref={bookIsbnRef}
                      type="text"
                      placeholder="ISBN"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={book.isbn || ''}
                      onChange={(e) => setBook({ ...book, isbn: e.target.value })}
                      onKeyDown={(e) => handleInputKeyDown(e, bookLinkRef)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'링크'}</label>
                    <input
                      ref={bookLinkRef}
                      type="url"
                      placeholder="https://..."
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={book.external_link || ''}
                      onChange={(e) => setBook({ ...book, external_link: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          handleAddBook(e as unknown as React.MouseEvent<Element, MouseEvent>);
                        }
                      }}
                    />
                    <p className="text-sm text-primary ml-1">{'관련 자료 추가를 위한 링크는 필숫값입니다.'}</p>
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
        )}

        {/* 연구논문 탭 컨텐츠 */}
        {activeTab === 'academic' && (
          <div className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {formData?.references?.academic?.map((item, index) => (
                <div key={index} className="bg-gray5 rounded-lg p-3 flex flex-col border border-gray4 mb-2">
                  <div className="flex justify-between items-start">
                    <span className="font-medium truncate">{item.title}</span>
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
                      ref={academicTitleRef}
                      type="text"
                      placeholder="논문 제목"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={academic.title || ''}
                      onChange={(e) => setAcademic({ ...academic, title: e.target.value })}
                      onKeyDown={(e) => handleInputKeyDown(e, academicAuthorsRef)}
                    />
                    <p className="text-sm text-primary ml-1">{'관련 자료 추가를 위한 제목은 필숫값입니다.'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'저자'}</label>
                    <input
                      ref={academicAuthorsRef}
                      type="text"
                      placeholder="저자 (여러 명인 경우, 콤마로 구분)"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={academic.authors?.join(', ') || ''}
                      onChange={(e) => setAcademic({ ...academic, authors: e.target.value.split(',').map((a) => a.trim()) })}
                      onKeyDown={(e) => handleInputKeyDown(e, academicYearRef)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'출판년도'}</label>
                    <input
                      ref={academicYearRef}
                      type="text"
                      placeholder="YYYY"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={academic.year || ''}
                      onChange={(e) => setAcademic({ ...academic, year: e.target.value })}
                      onKeyDown={(e) => handleInputKeyDown(e, academicDoiRef)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'DOI'}</label>
                    <input
                      ref={academicDoiRef}
                      type="text"
                      placeholder="DOI"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={academic.doi || ''}
                      onChange={(e) => setAcademic({ ...academic, doi: e.target.value })}
                      onKeyDown={(e) => handleInputKeyDown(e, academicLinkRef)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray0">{'링크'}</label>
                    <input
                      ref={academicLinkRef}
                      type="url"
                      placeholder="https://..."
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={academic.external_link || ''}
                      onChange={(e) => setAcademic({ ...academic, external_link: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          handleAddAcademic(e as unknown as React.MouseEvent<Element, MouseEvent>);
                        }
                      }}
                    />
                    <p className="text-sm text-primary ml-1">{'관련 자료 추가를 위한 링크는 필숫값입니다.'}</p>
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
        )}

        {/* 오픈소스 탭 컨텐츠 */}
        {activeTab === 'opensource' && (
          <div className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {formData?.references?.opensource?.map((item, index) => (
                <div key={index} className="bg-gray5 rounded-lg p-3 flex flex-col border border-gray4 mb-2">
                  <div className="flex justify-between items-start">
                    <span className="font-medium truncate">{item.name}</span>
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
                      ref={opensourceNameRef}
                      type="text"
                      placeholder="오픈소스 프로젝트 이름"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={opensource.name || ''}
                      onChange={(e) => setOpensource({ ...opensource, name: e.target.value })}
                      onKeyDown={(e) => handleInputKeyDown(e, opensourceLicenseRef)}
                    />
                    <p className="text-sm text-primary ml-1">{'관련 자료 추가를 위한 이름은 필숫값입니다.'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'라이센스'}</label>
                    <input
                      ref={opensourceLicenseRef}
                      type="text"
                      placeholder="라이센스 (ex. MIT, GPL)"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={opensource.license || ''}
                      onChange={(e) => setOpensource({ ...opensource, license: e.target.value })}
                      onKeyDown={(e) => handleInputKeyDown(e, opensourceDescriptionRef)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray0">{'설명'}</label>
                    <textarea
                      ref={opensourceDescriptionRef}
                      placeholder="간략한 설명"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={opensource.description || ''}
                      onChange={(e) => setOpensource({ ...opensource, description: e.target.value })}
                      onKeyDown={(e) => handleInputKeyDown(e, opensourceLinkRef)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray0">{'링크'}</label>
                    <input
                      ref={opensourceLinkRef}
                      type="url"
                      placeholder="https://..."
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={opensource.external_link || ''}
                      onChange={(e) => setOpensource({ ...opensource, external_link: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          handleAddOpensource(e as unknown as React.MouseEvent<Element, MouseEvent>);
                        }
                      }}
                    />
                    <p className="text-sm text-primary ml-1">{'관련 자료 추가를 위한 링크는 필숫값입니다.'}</p>
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
        )}
      </div>
    </div>
  );
};

export default ReferencesSection;