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
  const [showGuidance, setShowGuidance] = useState<boolean>(true);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [yearError, setYearError] = useState<string | null>(null);
  const [isbnError, setIsbnError] = useState<string | null>(null);
  const [doiError, setDoiError] = useState<string | null>(null);

  const tutorialCallbackRef = useRef(false);
  const bookCallbackRef = useRef(false);
  const academicCallbackRef = useRef(false);
  const opensourceCallbackRef = useRef(false);

  // 탭 변경 시 첫 렌더링 여부를 추적하기 위한 ref
  const isFirstRender = useRef(true);

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
    authorsText?: string;
  }>({});

  const [academic, setAcademic] = useState<{
    title?: string;
    authors?: string[];
    year?: string;
    doi?: string;
    external_link?: string;
    authorsText?: string;
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

  // 참고 자료 추가 여부에 따라 안내 메시지 표시 여부 결정
  useEffect(() => {
    // 모든 참고 자료 타입에 대해 하나라도 추가되었는지 확인
    const hasTutorials = !!(formData?.references?.tutorials && formData.references.tutorials.length > 0);
    const hasBooks = !!(formData?.references?.books && formData.references.books.length > 0);
    const hasAcademic = !!(formData?.references?.academic && formData.references.academic.length > 0);
    const hasOpensource = !!(formData?.references?.opensource && formData.references.opensource.length > 0);

    // 하나라도 있으면 안내 메시지 숨김
    if (hasTutorials || hasBooks || hasAcademic || hasOpensource) {
      setShowGuidance(false);
    } else {
      setShowGuidance(true);
    }
  }, [
    formData,
    formData?.references,
    formData?.references?.tutorials,
    formData?.references?.books,
    formData?.references?.academic,
    formData?.references?.opensource,
  ]);

  // 빈 References 객체 생성 함수 - 타입을 사용하여 참조 에러 해결
  const createEmptyReferences = (): References => {
    return {
      tutorials: [],
      books: [],
      academic: [],
      opensource: [],
    };
  };

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

  // 링크 input focus 핸들러
  const handleLinkFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      e.target.value = 'https://';
    }
  };

  // 링크 유효성 검사 함수
  const isValidLink = (link: string | undefined): boolean => {
    if (!link) return false;
    return link.startsWith('https://');
  };

  const handleAddTutorial = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isValidLink(tutorial.external_link)) {
      setLinkError('링크는 https://로 시작되어야 합니다.');
      return;
    }

    if (tutorial.title?.trim() && tutorial.external_link?.trim()) {
      const newTutorial = { ...tutorial };
      tutorialCallbackRef.current = false;

      setFormData((prev) => {
        if (tutorialCallbackRef.current) return prev;
        tutorialCallbackRef.current = true;

        const currentReferences = prev.references || createEmptyReferences();
        const updatedTutorials = [...(currentReferences.tutorials || []), newTutorial];

        return {
          ...prev,
          references: {
            ...currentReferences,
            tutorials: updatedTutorials,
          },
        };
      });

      setTutorial({ title: '', platform: '', external_link: '' });
      setLinkError(null);
    }
  };

  const handleAddBook = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isValidLink(book.external_link)) {
      setLinkError('링크는 https://로 시작되어야 합니다.');
      return;
    }

    // 연도 입력값이 있을 경우에만 유효성 검사 실행
    if (book.year && !isValidYear(book.year)) {
      setYearError('숫자 4개만 입력 가능합니다.');
      return;
    }

    // ISBN 입력값이 있을 경우에만 유효성 검사 실행
    if (book.isbn && !isValidIsbn(book.isbn)) {
      setIsbnError('ISBN은 ISBN-10(10자리) 또는 ISBN-13(13자리) 형식이어야 합니다. (예: 0306406152 또는 9783161484100)');
      return;
    }

    if (book.title?.trim() && book.external_link?.trim()) {
      const newBook = { ...book };
      bookCallbackRef.current = false;

      setFormData((prev) => {
        if (bookCallbackRef.current) return prev;
        bookCallbackRef.current = true;

        const currentReferences = prev.references || createEmptyReferences();
        const updatedBooks = [...(currentReferences.books || []), newBook];

        return {
          ...prev,
          references: {
            ...currentReferences,
            books: updatedBooks,
          },
        };
      });

      setBook({ title: '', authors: [], publisher: '', year: '', isbn: '', external_link: '', authorsText: '' });
      setLinkError(null);
      setYearError(null);
      setIsbnError(null);
    }
  };

  const handleAddAcademic = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isValidLink(academic.external_link)) {
      setLinkError('링크는 https://로 시작되어야 합니다.');
      return;
    }

    // 연도 입력값이 있을 경우에만 유효성 검사 실행
    if (academic.year && !isValidYear(academic.year)) {
      setYearError('숫자 4개만 입력 가능합니다.');
      return;
    }

    // DOI 입력값이 있을 경우에만 유효성 검사 실행
    if (academic.doi && !isValidDoi(academic.doi)) {
      setDoiError('DOI는 10.으로 시작해야 합니다. (예: 10.1000/xyz123)');
      return;
    }

    if (academic.title?.trim() && academic.external_link?.trim()) {
      const newAcademic = { ...academic };
      academicCallbackRef.current = false;

      setFormData((prev) => {
        if (academicCallbackRef.current) return prev;
        academicCallbackRef.current = true;

        const currentReferences = prev.references || createEmptyReferences();
        const updatedAcademic = [...(currentReferences.academic || []), newAcademic];

        return {
          ...prev,
          references: {
            ...currentReferences,
            academic: updatedAcademic,
          },
        };
      });

      setAcademic({ title: '', authors: [], year: '', doi: '', external_link: '', authorsText: '' });
      setLinkError(null);
      setYearError(null);
      setDoiError(null);
    }
  };

  const handleAddOpensource = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isValidLink(opensource.external_link)) {
      setLinkError('링크는 https://로 시작되어야 합니다.');
      return;
    }

    if (opensource.name?.trim() && opensource.external_link?.trim()) {
      const newOpensource = { ...opensource };
      opensourceCallbackRef.current = false;

      setFormData((prev) => {
        if (opensourceCallbackRef.current) return prev;
        opensourceCallbackRef.current = true;

        const currentReferences = prev.references || createEmptyReferences();
        const updatedOpensource = [...(currentReferences.opensource || []), newOpensource];

        return {
          ...prev,
          references: {
            ...currentReferences,
            opensource: updatedOpensource,
          },
        };
      });

      setOpensource({ name: '', license: '', description: '', external_link: '' });
      setLinkError(null);
    }
  };

  const handleRemoveTutorial = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setFormData((prev) => {
      if (!prev.references?.tutorials) return prev;

      const currentReferences = { ...prev.references };
      const updatedTutorials = (currentReferences.tutorials || []).filter((_, i) => i !== index);

      return {
        ...prev,
        references: {
          ...currentReferences,
          tutorials: updatedTutorials,
        },
      };
    });
  };

  const handleRemoveBook = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setFormData((prev) => {
      if (!prev.references?.books) return prev;

      const currentReferences = { ...prev.references };
      const updatedBooks = (currentReferences.books || []).filter((_, i) => i !== index);

      return {
        ...prev,
        references: {
          ...currentReferences,
          books: updatedBooks,
        },
      };
    });
  };

  const handleRemoveAcademic = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setFormData((prev) => {
      if (!prev.references?.academic) return prev;

      const currentReferences = { ...prev.references };
      const updatedAcademic = (currentReferences.academic || []).filter((_, i) => i !== index);

      return {
        ...prev,
        references: {
          ...currentReferences,
          academic: updatedAcademic,
        },
      };
    });
  };

  const handleRemoveOpensource = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setFormData((prev) => {
      if (!prev.references?.opensource) return prev;

      const currentReferences = { ...prev.references };
      const updatedOpensource = (currentReferences.opensource || []).filter((_, i) => i !== index);

      return {
        ...prev,
        references: {
          ...currentReferences,
          opensource: updatedOpensource,
        },
      };
    });
  };

  const handleTabChange = (e: React.MouseEvent, tab: ReferenceTab) => {
    e.preventDefault();
    setActiveTab(tab);
    // 탭 변경 시 에러 메시지 초기화
    setLinkError(null);
    setYearError(null);
    setIsbnError(null);
    setDoiError(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      tutorialTitleRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      switch (activeTab) {
        case 'tutorial':
          tutorialTitleRef.current?.focus();
          break;
        case 'book':
          bookTitleRef.current?.focus();
          break;
        case 'academic':
          academicTitleRef.current?.focus();
          break;
        case 'opensource':
          opensourceNameRef.current?.focus();
          break;
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [activeTab]);

  // 링크 input 값 변경 핸들러 추가
  const handleTutorialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTutorial({ ...tutorial, external_link: value });

    // 값이 없거나 https://로 시작하면 에러 메시지 초기화
    if (!value || value.startsWith('https://')) {
      setLinkError(null);
    }
  };

  const handleBookLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBook({ ...book, external_link: value });

    // 값이 없거나 https://로 시작하면 에러 메시지 초기화
    if (!value || value.startsWith('https://')) {
      setLinkError(null);
    }
  };

  const handleAcademicLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAcademic({ ...academic, external_link: value });

    // 값이 없거나 https://로 시작하면 에러 메시지 초기화
    if (!value || value.startsWith('https://')) {
      setLinkError(null);
    }
  };

  const handleOpensourceLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOpensource({ ...opensource, external_link: value });

    // 값이 없거나 https://로 시작하면 에러 메시지 초기화
    if (!value || value.startsWith('https://')) {
      setLinkError(null);
    }
  };

  // 저자 입력 관련 함수 수정
  const handleBookAuthorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setBook({ ...book, authorsText: value });

    if (!value.endsWith(',')) {
      const authorsArray = value.split(',')
        .map((author) => author.trim())
        .filter((author) => author !== '');

      setBook((prev) => ({ ...prev, authors: authorsArray }));
    }
  };

  const handleAcademicAuthorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setAcademic({ ...academic, authorsText: value });

    if (!value.endsWith(',')) {
      const authorsArray = value.split(',')
        .map((author) => author.trim())
        .filter((author) => author !== '');

      setAcademic((prev) => ({ ...prev, authors: authorsArray }));
    }
  };

  // 저자 입력란 키 이벤트 핸들러 수정
  const handleBookAuthorsKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter') {
      e.preventDefault();

      if (book.authorsText) {
        const authorsArray = book.authorsText.split(',')
          .map((author) => author.trim())
          .filter((author) => author !== '');

        setBook((prev) => ({ ...prev, authors: authorsArray }));
      }

      bookPublisherRef.current?.focus();
      return;
    }
  };

  const handleAcademicAuthorsKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter') {
      e.preventDefault();

      if (academic.authorsText) {
        const authorsArray = academic.authorsText.split(',')
          .map((author) => author.trim())
          .filter((author) => author !== '');

        setAcademic((prev) => ({ ...prev, authors: authorsArray }));
      }

      academicYearRef.current?.focus();
      return;
    }
  };

  // 연도 유효성 검사 함수
  const isValidYear = (year: string | undefined): boolean => {
    if (!year) return true;
    return /^\d{4}$/.test(year);
  };

  const handleBookYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '' || /^\d{0,4}$/.test(value)) {
      setBook({ ...book, year: value });
      setYearError(null);
    }

    if (value !== '' && !/^\d{0,4}$/.test(value)) {
      setYearError('숫자 4개만 입력 가능합니다.');
    } else {
      setYearError(null);
    }
  };

  const handleAcademicYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '' || /^\d{0,4}$/.test(value)) {
      setAcademic({ ...academic, year: value });
      setYearError(null);
    }

    if (value !== '' && !/^\d{0,4}$/.test(value)) {
      setYearError('숫자 4개만 입력 가능합니다.');
    } else {
      setYearError(null);
    }
  };

  // ISBN 유효성 검사 함수
  const isValidIsbn = (isbn: string | undefined): boolean => {
    if (!isbn) return true;
    return /^(\d{9}[\dXx]|\d{13})$/.test(isbn);
  };

  // ISBN 입력 핸들러
  const handleBookIsbnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 입력된 값에 숫자나 X가 아닌 문자가 있는지 확인
    const hasInvalidChars = /[^0-9Xx]/.test(value);

    // 숫자와 X만 입력 허용
    const cleanedValue = value.replace(/[^0-9Xx]/g, '');

    // 값이 변경되었다면 변경된 값으로 업데이트
    if (cleanedValue !== value) {
      e.target.value = cleanedValue;
    }

    setBook({ ...book, isbn: cleanedValue });

    // 유효하지 않은 문자가 입력되었으면 즉시 에러 메시지 표시
    if (hasInvalidChars) {
      setIsbnError('ISBN은 숫자와 X만 입력 가능합니다.');
      return;
    }

    // 길이 검사
    if (cleanedValue !== '' && !isValidIsbn(cleanedValue)) {
      setIsbnError('ISBN은 ISBN-10(10자리) 또는 ISBN-13(13자리) 형식이어야 합니다. (예: 0306406152 또는 9783161484100)');
    } else {
      setIsbnError(null);
    }
  };

  // DOI 유효성 검사 함수
  const isValidDoi = (doi: string | undefined): boolean => {
    if (!doi) return true;
    return doi.startsWith('10.');
  };

  // DOI 입력 핸들러
  const handleAcademicDoiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAcademic({ ...academic, doi: value });

    if (value !== '' && !isValidDoi(value)) {
      setDoiError('DOI는 10.으로 시작해야 합니다. (예: 10.1000/xyz123)');
    } else {
      setDoiError(null);
    }
  };

  return (
    <div className="p-2" ref={containerRef}>
      {/* 탭 내비게이션 */}
      <div className="flex border-b border-gray4">
        <button
          onClick={(e) => handleTabChange(e, 'tutorial')}
          className={`px-4 py-2 text-sm sm:text-base ${ activeTab === 'tutorial' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray0' }`}
        >
          {'튜토리얼'}
        </button>
        <button
          onClick={(e) => handleTabChange(e, 'book')}
          className={`px-4 py-2 text-sm sm:text-base ${ activeTab === 'book' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray0' }`}
        >
          {'참고서적'}
        </button>
        <button
          onClick={(e) => handleTabChange(e, 'academic')}
          className={`px-4 py-2 text-sm sm:text-base ${ activeTab === 'academic' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray0' }`}
        >
          {'연구논문'}
        </button>
        <button
          onClick={(e) => handleTabChange(e, 'opensource')}
          className={`px-4 py-2 text-sm sm:text-base ${ activeTab === 'opensource' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray0' }`}
        >
          {'오픈소스'}
        </button>
      </div>

      {/* 각 탭 컨텐츠를 감싸는 컨테이너 */}
      <div className="tab-content-container relative my-2">
        {/* 튜토리얼 탭 컨텐츠 */}
        {activeTab === 'tutorial' && (
          <div>
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
                    <p className="text-sm text-primary ml-1 mt-1">{'튜토리얼을 추가하려면 반드시 제목을 작성해야 합니다.'}</p>
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
                      onChange={handleTutorialLinkChange}
                      onFocus={handleLinkFocus}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          handleAddTutorial(e as unknown as React.MouseEvent<Element, MouseEvent>);
                        }
                      }}
                    />
                    <p className={`text-sm ml-1 mt-1 ${ linkError && activeTab === 'tutorial' ? 'text-level-5' : 'text-primary' }`}>
                      {linkError && activeTab === 'tutorial' ? linkError : '튜토리얼을 추가하려면 반드시 링크를 작성해야 합니다.'}
                    </p>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddTutorial}
                      className={`px-4 py-2 rounded-md ${
                        tutorial.title?.trim() && tutorial.external_link?.trim()
                          ? 'bg-primary dark:bg-secondary text-white hover:opacity-90'
                          : 'text-main bg-gray4 hover:text-white hover:bg-gray3'
                      }`}
                    >
                      {'튜토리얼 추가'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 참고서적 탭 컨텐츠 */}
        {activeTab === 'book' && (
          <div>
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
                      placeholder="서적 제목"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={book.title || ''}
                      onChange={(e) => setBook({ ...book, title: e.target.value })}
                      onKeyDown={(e) => handleInputKeyDown(e, bookAuthorsRef)}
                    />
                    <p className="text-sm text-primary ml-1 mt-1">{'참고서적을 추가하려면 반드시 제목을 작성해야 합니다.'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'저자'}</label>
                    <input
                      ref={bookAuthorsRef}
                      type="text"
                      placeholder="저자 (여러 명인 경우, 콤마로 구분)"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={book.authorsText || ''}
                      onChange={handleBookAuthorsChange}
                      onKeyDown={handleBookAuthorsKeyDown}
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
                      onChange={handleBookYearChange}
                      onKeyDown={(e) => handleInputKeyDown(e, bookIsbnRef)}
                    />
                    <p className={`text-sm ml-1 mt-1 ${ yearError && activeTab === 'book' ? 'text-level-5' : 'text-gray2' }`}>
                      {yearError && activeTab === 'book' ? yearError : ''}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'ISBN'}</label>
                    <input
                      ref={bookIsbnRef}
                      type="text"
                      placeholder="ISBN(하이픈(-) 생략, 10자리 또는 13자리)"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={book.isbn || ''}
                      onChange={handleBookIsbnChange}
                      onKeyDown={(e) => handleInputKeyDown(e, bookLinkRef)}
                    />
                    <p className={`text-sm ml-1 mt-1 break-all ${ isbnError && activeTab === 'book' ? 'text-level-5' : 'text-gray2' }`}>
                      {isbnError && activeTab === 'book' ? isbnError : ''}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'링크'}</label>
                    <input
                      ref={bookLinkRef}
                      type="url"
                      placeholder="https://..."
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={book.external_link || ''}
                      onChange={handleBookLinkChange}
                      onFocus={handleLinkFocus}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          handleAddBook(e as unknown as React.MouseEvent<Element, MouseEvent>);
                        }
                      }}
                    />
                    <p className={`text-sm ml-1 mt-1 ${ linkError && activeTab === 'book' ? 'text-level-5' : 'text-primary' }`}>
                      {linkError && activeTab === 'book' ? linkError : '참고서적을 추가하려면 반드시 링크를 작성해야 합니다.'}
                    </p>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddBook}
                      className={`px-4 py-2 rounded-md ${
                        book.title?.trim() && book.external_link?.trim()
                          ? 'bg-primary dark:bg-secondary text-white hover:opacity-90'
                          : 'text-main bg-gray4 hover:text-white hover:bg-gray3'
                      }`}
                    >
                      {'참고서적 추가'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 연구논문 탭 컨텐츠 */}
        {activeTab === 'academic' && (
          <div>
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
                    <p className="text-sm text-primary ml-1 mt-1">{'연구논문을 추가하려면 반드시 제목을 작성해야 합니다.'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'저자'}</label>
                    <input
                      ref={academicAuthorsRef}
                      type="text"
                      placeholder="저자 (여러 명인 경우, 콤마로 구분)"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={academic.authorsText || ''}
                      onChange={handleAcademicAuthorsChange}
                      onKeyDown={handleAcademicAuthorsKeyDown}
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
                      onChange={handleAcademicYearChange}
                      onKeyDown={(e) => handleInputKeyDown(e, academicDoiRef)}
                    />
                    <p className={`text-sm ml-1 mt-1 ${ yearError && activeTab === 'academic' ? 'text-level-5' : 'text-gray2' }`}>
                      {yearError && activeTab === 'academic' ? yearError : ''}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray0">{'DOI'}</label>
                    <input
                      ref={academicDoiRef}
                      type="text"
                      placeholder="DOI (10. 으로 시작)"
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={academic.doi || ''}
                      onChange={handleAcademicDoiChange}
                      onKeyDown={(e) => handleInputKeyDown(e, academicLinkRef)}
                    />
                    <p className={`text-sm ml-1 mt-1 break-all ${ doiError && activeTab === 'academic' ? 'text-level-5' : 'text-gray2' }`}>
                      {doiError && activeTab === 'academic' ? doiError : ''}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray0">{'링크'}</label>
                    <input
                      ref={academicLinkRef}
                      type="url"
                      placeholder="https://..."
                      className="w-full p-2 border border-gray4 rounded-md text-main"
                      value={academic.external_link || ''}
                      onChange={handleAcademicLinkChange}
                      onFocus={handleLinkFocus}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          handleAddAcademic(e as unknown as React.MouseEvent<Element, MouseEvent>);
                        }
                      }}
                    />
                    <p className={`text-sm ml-1 mt-1 ${ linkError && activeTab === 'academic' ? 'text-level-5' : 'text-primary' }`}>
                      {linkError && activeTab === 'academic' ? linkError : '연구논문을 추가하려면 반드시 링크를 작성해야 합니다.'}
                    </p>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddAcademic}
                      className={`px-4 py-2 rounded-md ${
                        academic.title?.trim() && academic.external_link?.trim()
                          ? 'bg-primary dark:bg-secondary text-white hover:opacity-90'
                          : 'text-main bg-gray4 hover:text-white hover:bg-gray3'
                      }`}
                    >
                      {'연구논문 추가'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 오픈소스 탭 컨텐츠 */}
        {activeTab === 'opensource' && (
          <div>
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
                    <p className="text-sm text-primary ml-1 mt-1">{'오픈소스 프로젝트를 추가하려면 반드시 이름을 작성해야 합니다.'}</p>
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
                      onChange={handleOpensourceLinkChange}
                      onFocus={handleLinkFocus}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          handleAddOpensource(e as unknown as React.MouseEvent<Element, MouseEvent>);
                        }
                      }}
                    />
                    <p className={`text-sm ml-1 mt-1 ${ linkError && activeTab === 'opensource' ? 'text-level-5' : 'text-primary' }`}>
                      {linkError && activeTab === 'opensource' ? linkError : '오픈소스 프로젝트를 추가하려면 반드시 링크를 작성해야 합니다.'}
                    </p>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddOpensource}
                      className={`px-4 py-2 rounded-md ${
                        opensource.name?.trim() && opensource.external_link?.trim()
                          ? 'bg-primary dark:bg-secondary text-white hover:opacity-90'
                          : 'text-main bg-gray4 hover:text-white hover:bg-gray3'
                      }`}
                    >
                      {'오픈소스 추가'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* 안내 메시지 추가 */}
      {showGuidance && (
        <p className="text-sm text-level-5">{'참고 자료를 1개 이상 작성해주세요.'}</p>
      )}
    </div>
  );
};

export default ReferencesSection;