'use client';

import { References } from '@/types';
import React from 'react';
import ReferencesGrid from './ReferencesGrid';
import { ChevronDown } from 'lucide-react';
import {
  formatTutorialDetails,
  formatBookDetails,
  formatAcademicDetails,
  formatOpenSourceDetails,
} from './referenceUtils';

interface ReferencesSectionProps {
  references: References;
  isMobilePreview?: boolean;
}

// 색상 설정 정의
export const colorConfig = {
  '튜토리얼': {
    outline: 'group-hover:outline-[#08BE38] dark:group-hover:outline-[#32D84C]',
    text: 'text-[#08BE38] dark:text-[#32D84C]',
    border: 'border-[#08BE38] dark:border-[#32D84C]',
    decoration: 'decoration-[#08BE38] dark:decoration-[#32D84C]',
  },
  '참고서적': {
    outline: 'group-hover:outline-[#EE8C00] dark:group-hover:outline-[#FF9F0A]',
    text: 'text-[#EE8C00] dark:text-[#FF9F0A]',
    border: 'border-[#EE8C00] dark:border-[#FF9F0A]',
    decoration: 'decoration-[#EE8C00] dark:decoration-[#FF9F0A]',
  },
  '연구논문': {
    outline: 'group-hover:outline-[#017AFF] dark:group-hover:outline-[#64D3FF]',
    text: 'text-[#017AFF] dark:text-[#64D3FF]',
    border: 'border-[#017AFF] dark:border-[#64D3FF]',
    decoration: 'decoration-[#017AFF] dark:decoration-[#64D3FF]',
  },
  '오픈소스': {
    outline: 'group-hover:outline-[#AF52DF] dark:group-hover:outline-[#CD7BF8]',
    text: 'text-[#AF52DF] dark:text-[#CD7BF8]',
    border: 'border-[#AF52DF] dark:border-[#CD7BF8]',
    decoration: 'decoration-[#AF52DF] dark:decoration-[#CD7BF8]',
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

const ReferencesSection = ({ references, isMobilePreview = false }: ReferencesSectionProps) => {
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
    formatDetails: (item: T)=> (string | null | React.ReactElement)[];
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
              <span className={`text-sm ${ colors.text } ${ expandedItems[section][index] ? '-ml-px' : 'line-clamp-1' }`}>
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
                className={`block px-2 py-1 hover:bg-background-secondary no-underline ${
                  !getExternalLink(item) ? 'cursor-default' : ''
                }`}
              >
                <div className="flex flex-col">
                  {formatDetails(item).map((detail, i) => (
                    detail && <React.Fragment key={i}>{detail}</React.Fragment>
                  ))}
                </div>
                <span className="flex justify-end">
                  {getExternalLink(item) && (
                    <span className="text-xs text-gray3 font-normal p-1.5">
                      {'바로가기 →'}
                    </span>
                  )}
                </span>
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
        <span className={`text-primary mr-2.5 transition-opacity ${ isMobilePreview ? '' : 'sm:ml-[-20px] sm:opacity-0 group-section-title' }`}>{'#'}</span>
        {'참고 자료'}
      </h2>

      {(isSmallScreen || isMobilePreview) ? (
        <div className='flex flex-col gap-4 sm:mt-[-4px]'>
          <ReferenceList
            title="튜토리얼"
            items={references.tutorials}
            section="tutorials"
            getTitle={(item) => item.title || ''}
            formatDetails={(item) => formatTutorialDetails(item, colorConfig)}
            getExternalLink={(item) => item.external_link}
          />
          <ReferenceList
            title="참고서적"
            items={references.books}
            section="books"
            getTitle={(item) => item.title || ''}
            formatDetails={(item) => formatBookDetails(item, colorConfig)}
            getExternalLink={(item) => item.external_link}
          />
          <ReferenceList
            title="연구논문"
            items={references.academic}
            section="academic"
            getTitle={(item) => item.title || ''}
            formatDetails={(item) => formatAcademicDetails(item, colorConfig)}
            getExternalLink={(item) => item.external_link}
          />
          <ReferenceList
            title="오픈소스"
            items={references.opensource}
            section="opensource"
            getTitle={(item) => item.name || ''}
            formatDetails={(item) => formatOpenSourceDetails(item, colorConfig)}
            getExternalLink={(item) => item.external_link}
          />
        </div>
      ) : (
        <ReferencesGrid references={references} colorConfig={colorConfig} />
      )}
    </section>
  );
};

export default ReferencesSection;
