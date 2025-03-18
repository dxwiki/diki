'use client';

import { References } from '@/types';
import React from 'react';
import ReferencesGrid from './ReferencesGrid';
import { ChevronDown } from 'lucide-react';
interface ReferencesSectionProps {
  references: References;
}

// 색상 설정 정의
export const colorConfig = {
  '튜토리얼': {
    outline: 'group-hover:outline-emerald-600 dark:group-hover:outline-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-600 dark:border-emerald-400',
    decoration: 'decoration-emerald-600 dark:decoration-emerald-400',
  },
  '참고서적': {
    outline: 'group-hover:outline-orange-600 dark:group-hover:outline-orange-400',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-600 dark:border-orange-400',
    decoration: 'decoration-orange-600 dark:decoration-orange-400',
  },
  '연구논문': {
    outline: 'group-hover:outline-rose-600 dark:group-hover:outline-rose-400',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-600 dark:border-rose-400',
    decoration: 'decoration-rose-600 dark:decoration-rose-400',
  },
  '오픈소스': {
    outline: 'group-hover:outline-violet-600 dark:group-hover:outline-violet-400',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-600 dark:border-violet-400',
    decoration: 'decoration-violet-600 dark:decoration-violet-400',
  },
};

// 아코디언 확장 상태 관리
const useAccordionState = () => {
  const [expandedItems, setExpandedItems] = React.useState<Record<string, Record<number, boolean>>>({
    tutorials: {},
    books: {},
    academic: {},
    opensource: {},
  });

  const toggleExpand = (section: string, index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [index]: !prev[section][index],
      },
    }));
  };

  return { expandedItems, toggleExpand };
};

const ReferencesSection = ({ references }: ReferencesSectionProps) => {
  const { expandedItems, toggleExpand } = useAccordionState();
  const [isSmallScreen, setIsSmallScreen] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 빈 데이터 처리
  const isEmpty
    = !references.tutorials?.length
    && !references.books?.length
    && !references.academic?.length
    && !references.opensource?.length;

  if (isEmpty) return null;

  // 아코디언 전용 링크 프로퍼티 설정
  const getLinkProps = (external_link: string | undefined) => {
    if (!external_link || external_link === '#') {
      return {
        href: '#',
        onClick: (e: React.MouseEvent) => e.preventDefault(),
      };
    }

    return {
      href: external_link,
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  };

  // 상세 정보 포맷팅 함수들
  const formatTutorialDetails = (tutorial: NonNullable<References['tutorials']>[number]) => {
    return tutorial.platform ? [
      <div key="platform" className="flex items-start gap-1.5">
        <span className={`text-xs px-1.5 py-0.5 border rounded-full shrink-0 ${ colorConfig['튜토리얼'].border } ${ colorConfig['튜토리얼'].text }`}>
          {'플랫폼'}
        </span>
        <span className='text-sm font-medium'>{tutorial.platform}</span>
      </div>,
    ] : [];
  };

  const formatBookDetails = (book: NonNullable<References['books']>[number]) => {
    const parts = [];

    if (book.authors?.length) {
      parts.push(
        <div key="authors" className="flex items-start gap-1.5">
          <span className={`text-xs px-1.5 py-0.5 border rounded-full shrink-0 ${ colorConfig['참고서적'].border } ${ colorConfig['참고서적'].text }`}>
            {'저자'}
          </span>
          <span className='text-sm font-medium'>
            {book.authors.join(', ')}
            {book.publisher && <span>{'('}{book.publisher}</span>}
            {book.year && !book.publisher && <span>{'('}{book.year}{')'}</span>}
            {book.year && book.publisher && <span>{', '}{book.year}{')'}</span>}
            {!book.year && book.publisher && <span>{')'}</span>}
          </span>
        </div>
      );
    }

    if (book.isbn) {
      parts.push(
        <div key="isbn" className="flex items-start gap-1.5">
          <span className={`text-xs px-1.5 py-0.5 border rounded-full shrink-0 ${ colorConfig['참고서적'].border } ${ colorConfig['참고서적'].text }`}>
            {'ISBN'}
          </span>
          <span className='text-sm font-medium'>{book.isbn}</span>
        </div>
      );
    }

    return parts;
  };

  const formatAcademicDetails = (paper: NonNullable<References['academic']>[number]) => {
    const parts = [];

    if (paper.authors?.length) {
      parts.push(
        <div key="authors" className="flex items-start gap-1.5">
          <span className={`text-xs px-1.5 py-0.5 border rounded-full shrink-0 ${ colorConfig['연구논문'].border } ${ colorConfig['연구논문'].text }`}>
            {'저자'}
          </span>
          <span className='text-sm font-medium'>{paper.authors.join(', ')}{paper.year && <span>{'('}{paper.year}{')'}</span>}</span>
        </div>
      );
    }

    if (paper.doi) {
      parts.push(
        <div key="doi" className="flex items-start gap-1.5">
          <span className={`text-xs px-1.5 py-0.5 border rounded-full shrink-0 ${ colorConfig['연구논문'].border } ${ colorConfig['연구논문'].text }`}>
            {'DOI'}
          </span>
          <span className='text-sm font-medium'>{paper.doi}</span>
        </div>
      );
    }

    return parts;
  };

  const formatOpenSourceDetails = (project: NonNullable<References['opensource']>[number]) => {
    const parts = [];

    if (project.description) {
      parts.push(
        <div key="description" className="flex items-start gap-1.5">
          <span className={`text-xs px-1.5 py-0.5 border rounded-full shrink-0 ${ colorConfig['오픈소스'].border } ${ colorConfig['오픈소스'].text }`}>
            {'설명'}
          </span>
          <span className='text-sm font-medium'>{project.description}</span>
        </div>
      );
    }

    if (project.license) {
      parts.push(
        <div key="license" className="flex items-start gap-1.5">
          <span className={`text-xs px-1.5 py-0.5 border rounded-full shrink-0 ${ colorConfig['오픈소스'].border } ${ colorConfig['오픈소스'].text }`}>
            {'라이선스'}
          </span>
          <span className='text-sm font-medium'>{project.license}</span>
        </div>
      );
    }

    return parts;
  };

  const ReferenceList = <T,>({
    title,
    items,
    section,
    getTitle,
    formatDetails,
    getExternalLink,
  }: {
    title: string;
    items: T[] | undefined;
    section: string;
    getTitle: (item: T)=> string;
    formatDetails: (item: T)=> (string | null)[];
    getExternalLink: (item: T)=> string | undefined;
  }) => {
    if (!items?.length) return null;

    // 섹션에 따른 색상 설정 가져오기
    const getColorBySection = () => {
      if (section === 'tutorials') return colorConfig['튜토리얼'];
      if (section === 'books') return colorConfig['참고서적'];
      if (section === 'academic') return colorConfig['연구논문'];
      if (section === 'opensource') return colorConfig['오픈소스'];
      return colorConfig['튜토리얼']; // 기본값
    };

    const colors = getColorBySection();

    return (
      <div className='flex flex-col'>
        <strong className={`ml-1 mb-1.5 ${ colors.text }`}>{title}</strong>
        {items.map((item, index) => (
          <div key={index} className={`ml-1 overflow-hidden ${ index === 0 ? 'border-t border-light' : '' }`}>
            <div
              onClick={() => toggleExpand(section, index)}
              className={`group flex justify-between items-center border-b border-light px-3 py-2.5 cursor-pointer ${
                expandedItems[section][index] ? 'border-x bg-gray5' : ''
              }`}
            >
              <span className={`text-sm ${ colors.text } ${ expandedItems[section][index] ? '-ml-px' : 'text-main line-clamp-1' }`}>
                {getTitle(item)}
              </span>
              <span className='size-5'>
                <ChevronDown
                  className={`size-5 transition-transform ${ colors.text } ${
                    expandedItems[section][index] ? 'rotate-180' : ''
                  }`}
                />
              </span>
            </div>
            <div
              className={`transition-all duration-400 ease-in-out overflow-hidden bg-gray5 ${
                expandedItems[section][index] ? 'max-h-80 border-b border-x border-light' : 'max-h-0'
              }`}
            >
              <a
                {...getLinkProps(getExternalLink(item))}
                className={`block px-3 py-2.5 hover:bg-background-secondary no-underline ${
                  !getExternalLink(item) ? 'cursor-default' : ''
                }`}
              >
                <span className="flex justify-between mb-2">
                  <span className={`text-[13px] ${ colors.text } font-medium block`}>
                    {section === 'tutorials' && '튜토리얼'}
                    {section === 'books' && '참고서적'}
                    {section === 'academic' && '연구논문'}
                    {section === 'opensource' && '오픈소스'}
                  </span>
                  {getExternalLink(item) && (
                    <span className={`flex justify-center text-[13px] ${ colors.text } font-normal`}>
                      {'바로가기 →'}
                    </span>
                  )}
                </span>
                <div className="flex flex-col gap-1.5">
                  {formatDetails(item).map((detail, i) => (
                    detail && <React.Fragment key={i}>{detail}</React.Fragment>
                  ))}
                </div>
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="group-section break-all">
      <h2>
        <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-section-title transition-opacity">{'#'}</span>
        {'참고 자료'}
      </h2>

      {isSmallScreen ? (
        <div className='flex flex-col gap-4 sm:mt-[-4px]'>
          <ReferenceList title="튜토리얼" items={references.tutorials} section="tutorials" getTitle={(item) => item.title || ''} formatDetails={formatTutorialDetails} getExternalLink={(item) => item.external_link} />
          <ReferenceList title="참고서적" items={references.books} section="books" getTitle={(item) => item.title || ''} formatDetails={formatBookDetails} getExternalLink={(item) => item.external_link} />
          <ReferenceList title="연구논문" items={references.academic} section="academic" getTitle={(item) => item.title || ''} formatDetails={formatAcademicDetails} getExternalLink={(item) => item.external_link} />
          <ReferenceList title="오픈소스" items={references.opensource} section="opensource" getTitle={(item) => item.name || ''} formatDetails={formatOpenSourceDetails} getExternalLink={(item) => item.external_link} />
        </div>
      ) : (
        <ReferencesGrid references={references} colorConfig={colorConfig} />
      )}
    </section>
  );
};

export default ReferencesSection;
