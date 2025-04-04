import React from 'react';
import { References } from '@/types';
import { colorConfig as defaultColorConfig } from './ReferencesSection';

const tagLayout = 'flex items-start mt-1 gap-1 sm:mt-1.5 sm:gap-1.5';
const tagStyle = 'text-xs pt-[2px] pr-[5px] pb-[3px] pl-[6px]  border rounded-lg shrink-0 w-14 text-center';

// 참조 항목 세부 정보 포맷팅 함수들
export const formatTutorialDetails = (tutorial: NonNullable<References['tutorials']>[number], colorConfig = defaultColorConfig) => {
  return tutorial.platform ? [
    <div key="platform" className={tagLayout}>
      <span className={`${ tagStyle } ${ colorConfig['튜토리얼'].border } ${ colorConfig['튜토리얼'].text }`}>
        {'플랫폼'}
      </span>
      <span className='text-sm font-medium mt-px'>{tutorial.platform}</span>
    </div>,
  ] : [];
};

export const formatBookDetails = (book: NonNullable<References['books']>[number], colorConfig = defaultColorConfig) => {
  const parts = [];

  if (book.authors?.length) {
    parts.push(
      <div key="authors" className={tagLayout}>
        <span className={`${ tagStyle } ${ colorConfig['참고서적'].border } ${ colorConfig['참고서적'].text }`}>
          {'저자'}
        </span>
        <span className='text-sm font-medium mt-px'>
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
      <div key="isbn" className={tagLayout}>
        <span className={`${ tagStyle } ${ colorConfig['참고서적'].border } ${ colorConfig['참고서적'].text }`}>
          {'ISBN'}
        </span>
        <span className='text-sm font-medium mt-px'>{book.isbn}</span>
      </div>
    );
  }

  return parts;
};

export const formatAcademicDetails = (paper: NonNullable<References['academic']>[number], colorConfig = defaultColorConfig) => {
  const parts = [];

  if (paper.authors?.length) {
    parts.push(
      <div key="authors" className={tagLayout}>
        <span className={`${ tagStyle } ${ colorConfig['연구논문'].border } ${ colorConfig['연구논문'].text }`}>
          {'저자'}
        </span>
        <span className='text-sm font-medium mt-px'>{paper.authors.join(', ')}{paper.year && <span>{'('}{paper.year}{')'}</span>}</span>
      </div>
    );
  }

  if (paper.doi) {
    parts.push(
      <div key="doi" className={tagLayout}>
        <span className={`${ tagStyle } ${ colorConfig['연구논문'].border } ${ colorConfig['연구논문'].text }`}>
          {'DOI'}
        </span>
        <span className='text-sm font-medium mt-px'>{paper.doi}</span>
      </div>
    );
  }

  return parts;
};

export const formatOpenSourceDetails = (project: NonNullable<References['opensource']>[number], colorConfig = defaultColorConfig) => {
  const parts = [];

  if (project.description) {
    parts.push(
      <div key="description" className={tagLayout}>
        <span className={`${ tagStyle } ${ colorConfig['오픈소스'].border } ${ colorConfig['오픈소스'].text }`}>
          {'개념'}
        </span>
        <span className='text-sm font-medium mt-px'>{project.description}</span>
      </div>
    );
  }

  if (project.license) {
    parts.push(
      <div key="license" className={tagLayout}>
        <span className={`${ tagStyle } ${ colorConfig['오픈소스'].border } ${ colorConfig['오픈소스'].text }`}>
          {'라이선스'}
        </span>
        <span className='text-sm font-medium mt-px'>{project.license}</span>
      </div>
    );
  }

  return parts;
};

// 참조 항목 통합 함수
export const getAllReferences = (references: References, colorConfig = defaultColorConfig) => [
  ...(references.tutorials?.map((item) => ({
    type: '튜토리얼',
    details: formatTutorialDetails(item, colorConfig),
    ...item,
  })) || []),
  ...(references.books?.map((item) => ({
    type: '참고서적',
    details: formatBookDetails(item, colorConfig),
    ...item,
  })) || []),
  ...(references.academic?.map((item) => ({
    type: '연구논문',
    details: formatAcademicDetails(item, colorConfig),
    ...item,
  })) || []),
  ...(references.opensource?.map((item) => ({
    type: '오픈소스',
    details: formatOpenSourceDetails(item, colorConfig),
    title: item.name,
    ...item,
  })) || []),
];