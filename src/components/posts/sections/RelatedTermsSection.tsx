'use client';

import Link from 'next/link';
// import { Link as LinkIcon } from 'lucide-react';
import { transformToSlug } from '@/utils/filters';
import { Fragment } from 'react';
import { Terms } from '@/types';
import MarkdownContent from '../MarkdownContent';
interface RelatedTerm {
  terms: Terms[];
  isMobilePreview?: boolean;
}

const RelatedTermsSection = ({ terms, isMobilePreview = false }: RelatedTerm) => {
  if(terms.length === 0) return null;
  return(
    <section className="group-section">
      <h2>
        <span className={`text-primary mr-2.5 transition-opacity ${ isMobilePreview ? '' : 'sm:ml-[-20px] sm:opacity-0 group-section-title' }`}>{'#'}</span>
        {'관련 용어'}
      </h2>
      <div className="grid grid-cols-[auto_1fr] items-start gap-1">
        {terms.map((item, index) => (
          item.internal_link ? (
            <Fragment key={index}>
              <Link
                href={transformToSlug(item.internal_link)}
                className='group flex shrink-0 justify-center items-center gap-1 tag-button rounded-3xl text-sm hover:no-underline hover:border-primary mt-px pl-2.5 pr-[9px]'
              >
                <span className='text-primary'>{item.term}</span>
                {/* <LinkIcon size={16} /> */}
              </Link>
              <MarkdownContent content={item.description ?? ''} />
            </Fragment>
          ) : (
            <Fragment key={index}>
              <span className='tag-button-no-link flex justify-center shrink-0 rounded-lg text-sm text-sub mt-px pl-2.5 pr-[9px] bg-gray5'>
                {item.term}
              </span>
              <MarkdownContent content={item.description ?? ''} />
            </Fragment>
          )
        ))}
      </div>
    </section>
  );
};

export default RelatedTermsSection;