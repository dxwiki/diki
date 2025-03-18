'use client';

import { References } from '@/types';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { colorConfig as defaultColorConfig } from './ReferencesSection';

interface ReferencesSectionProps {
  references: References;
  colorConfig?: typeof defaultColorConfig;
}

// 그리드 아이템 타입 정의
interface GridItem {
  id: string;
  title: string;
  type: string;
  details: string | React.ReactNode;
  external_link?: string;
  colSpan: number;
  rowIndex?: number;
  titleLength: number;
}

// 입력 아이템 타입 정의
interface ReferenceItem {
  title?: string;
  type: string;
  details?: string | React.ReactNode;
  external_link?: string;
}

// 그리드 레이아웃 생성 함수
const createGridLayout = (items: ReferenceItem[], maxCols: number) => {
  if (items.length === 0) return [];
  if (items.length === 1) return [{
    ...items[0],
    id: '0-0',
    colSpan: maxCols,
    titleLength: items[0].title?.length || 0,
    title: items[0].title || '',
    details: items[0].details || '',
  }];

  // 텍스트 길이에 따라 colSpan 결정 및 기본 속성 설정
  const gridItems: GridItem[] = items.map((item, index) => {
    const titleLength = item.title?.length || 0;

    // 텍스트 길이에 따라 colSpan 결정
    let colSpan = 1;
    if (titleLength > 14) colSpan = 2;
    if (titleLength > 30) colSpan = Math.min(3, maxCols);
    if (titleLength > 45) colSpan = maxCols;

    return {
      ...item,
      id: `${ index }`,
      colSpan,
      titleLength,
      title: item.title || '',
      details: item.details || '',
    };
  });

  // 모든 아이템을 colSpan이 큰 순서대로 정렬
  gridItems.sort((a, b) => b.colSpan - a.colSpan || b.titleLength - a.titleLength);

  // 각 행에 배치된 아이템의 colSpan 합계를 추적
  const rows: number[] = [0];
  const rowItems: { [key: number]: GridItem[] } = { 0: [] };

  // 각 아이템에 행 번호 할당
  gridItems.forEach((item) => {
    // 현재 아이템이 들어갈 수 있는 행 찾기
    let rowIndex = rows.findIndex((sum) => sum + item.colSpan <= maxCols);

    // 적합한 행이 없으면 새 행 추가
    if (rowIndex === -1) {
      rowIndex = rows.length;
      rows.push(0);
      rowItems[rowIndex] = [];
    }

    // 해당 행에 아이템 추가
    rows[rowIndex] += item.colSpan;
    item.rowIndex = rowIndex;
    rowItems[rowIndex].push(item);
  });

  // 각 행의 아이템을 제목 길이에 따라 정렬하고 남은 공간 채우기
  Object.keys(rowItems).forEach((rowIndexStr) => {
    const rowIndex = parseInt(rowIndexStr);
    const itemsInRow = rowItems[rowIndex];

    // 각 행의 아이템을 제목 길이에 따라 정렬 (가장 긴 제목이 마지막에 오도록)
    itemsInRow.sort((a, b) => a.titleLength - b.titleLength);

    // 행의 남은 공간 채우기
    const rowSpace = maxCols - rows[rowIndex];
    if (itemsInRow.length > 0 && rowSpace > 0) {
      // 해당 행의 마지막 아이템의 colSpan을 남은 공간만큼 증가
      const lastItem = itemsInRow[itemsInRow.length - 1];
      lastItem.colSpan += rowSpace;
      rows[rowIndex] += rowSpace;
    }
  });

  // 행 번호 순서대로 아이템 정렬
  const sortedItems: GridItem[] = [];
  Object.keys(rowItems)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((rowIndex) => {
      sortedItems.push(...rowItems[rowIndex]);
    });

  return sortedItems;
};

const ReferencesGrid = ({ references, colorConfig = defaultColorConfig }: ReferencesSectionProps) => {
  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);
  const [isLargeScreen, setIsLargeScreen] = React.useState(false);
  const tooltipRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 타입에 따른 색상 설정 가져오기
  const getColorConfig = React.useCallback((type: string) => {
    return colorConfig[type as keyof typeof colorConfig];
  }, [colorConfig]);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 모든 참고자료를 하나의 배열로 통합
  const allReferences = useMemo(() => [
    ...(references.tutorials?.map((item) => ({
      type: '튜토리얼',
      details: (
        <div className="flex flex-wrap items-start gap-1.5">
          {item.platform && (
            <div className="flex items-start gap-1.5">
              <span className={`text-xs px-1.5 py-0.5 border rounded-full shrink-0 ${ getColorConfig('튜토리얼').border } ${ getColorConfig('튜토리얼').text }`}>
                {'플랫폼'}
              </span>
              <span>{item.platform}</span>
            </div>
          )}
        </div>
      ),
      ...item,
    })) || []),
    ...(references.books?.map((item) => ({
      type: '참고서적',
      details: (
        <div className="flex-col flex-wrap items-center space-y-1.5">
          {item.authors && (
            <div className="flex items-start gap-1.5">
              <span className={`text-xs px-1.5 py-0.5 border rounded-full shrink-0 ${ getColorConfig('참고서적').border } ${ getColorConfig('참고서적').text }`}>
                {'저자'}
              </span>
              <span>
                {item.authors.join(', ')}
                {item.publisher && <span>{'('}{item.publisher}</span>}
                {item.year && !item.publisher && <span>{'('}{item.year}{')'}</span>}
                {item.year && item.publisher && <span>{', '}{item.year}{')'}</span>}
                {!item.year && item.publisher && <span>{')'}</span>}
              </span>
            </div>
          )}
          {item.isbn && (
            <div className="flex items-start gap-1.5">
              <span className={`text-xs px-1.5 py-0.5 border rounded-full shrink-0 ${ getColorConfig('참고서적').border } ${ getColorConfig('참고서적').text }`}>
                {'ISBN'}
              </span>
              <span>{item.isbn}</span>
            </div>
          )}
        </div>
      ),
      ...item,
    })) || []),
    ...(references.academic?.map((item) => ({
      type: '연구논문',
      details: (
        <div className="flex flex-wrap items-center gap-1.5">
          {item.authors && (
            <div className="flex items-start gap-1.5">
              <span className={`text-xs px-1.5 py-0.5 border rounded-full shrink-0 ${ getColorConfig('연구논문').border } ${ getColorConfig('연구논문').text }`}>
                {'저자'}
              </span>
              <span>{item.authors.join(', ')}{item.year && <span>{'('}{item.year}{')'}</span>}</span>
            </div>
          )}
          {item.doi && (
            <div className="flex items-start gap-1.5">
              <span className={`text-xs px-1.5 py-0.5 border rounded-full shrink-0 ${ getColorConfig('연구논문').border } ${ getColorConfig('연구논문').text }`}>
                {'DOI'}
              </span>
              <span>{item.doi}</span>
            </div>
          )}
        </div>
      ),
      ...item,
    })) || []),
    ...(references.opensource?.map((item) => ({
      type: '오픈소스',
      details: (
        <div className="flex-col flex-wrap items-center space-y-1.5">
          {item.description && (
            <div className="flex items-start gap-1.5">
              <span className={`text-xs px-1.5 py-0.5 border rounded-full shrink-0 ${ getColorConfig('오픈소스').border } ${ getColorConfig('오픈소스').text }`}>
                {'설명'}
              </span>
              <span>{item.description}</span>
            </div>
          )}
          {item.license && (
            <div className="flex items-start gap-1.5">
              <span className={`text-xs px-1.5 py-0.5 border rounded-full shrink-0 ${ getColorConfig('오픈소스').border } ${ getColorConfig('오픈소스').text }`}>
                {'라이선스'}
              </span>
              <span>{item.license}</span>
            </div>
          )}
        </div>
      ),
      title: item.name,
      ...item,
    })) || []),
  ], [references, getColorConfig]);

  // 그리드 아이템 생성 - 화면 크기에 따라 최대 열 수 조정
  const gridItems = useMemo(() =>
    createGridLayout(allReferences, isLargeScreen ? 4 : 3),
  [allReferences, isLargeScreen]
  );

  if (allReferences.length === 0) return null;

  return (
    <div className="group-section break-all">
      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-px bg-light border border-light auto-rows-auto">
        {gridItems.map((item) => {
          const tooltipId = `${ item.type }-${ item.id }`;
          const colors = getColorConfig(item.type);

          return (
            <div
              key={tooltipId}
              className="group relative bg-background hover:bg-gray5"
              style={{
                gridColumn: `span ${ item.colSpan } / span ${ item.colSpan }`,
              }}
              onMouseEnter={() => setActiveTooltip(tooltipId)}
              onMouseLeave={() => setActiveTooltip(null)}
              ref={(el) => {
                if (el) tooltipRefs.current[tooltipId] = el;
              }}
            >
              <Link
                href={item.external_link || '#'}
                target={item.external_link ? '_blank' : undefined}
                rel={item.external_link ? 'noopener noreferrer' : undefined}
                onClick={!item.external_link ? (e) => e.preventDefault() : undefined}
                className={`
                  block size-full p-2.5 text-center transition-colors duration-200
                  ${ item.external_link ? '' : 'cursor-default' }
                  hover:no-underline group-hover:outline group-hover:outline-1 ${ colors.outline }
                `}
              >
                <span
                  className={`
                    text-sm font-medium break-words ${ colors.text } 
                    group-hover:underline group-hover:underline-offset-4 ${ colors.decoration }
                  `}
                >
                  {item.title}
                </span>
              </Link>

              {activeTooltip === tooltipId && item.details && (
                <div
                  className={`animate-slideDown absolute w-[calc(100%+2px)] -left-px border ${ colors.border }
                  bg-gray5 text-main p-2 shadow-md z-50`}
                >
                  <div className="flex flex-col gap-1.5">
                    <span className={`text-sm font-medium ${ colors.text }`}>{item.type}</span>
                    <p className="whitespace-pre-line text-sm break-words m-0">{item.details}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReferencesGrid;