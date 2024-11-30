import Link from 'next/link';
import { Link as LinkIcon } from 'lucide-react';
import { transformToSlug } from '@/utils/filters';

interface RelatedTerm {
  terms: Array<{
    internal_link: string | null;
    description: string;
    term: string;
  }>;
}

const RelatedTermsSection = ({ terms }: RelatedTerm) => {
  return(
    <section className="group">
      <h2>
        <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
        {'관련용어'}
      </h2>
      {terms.map((item, index) => (
        item.internal_link ? (
          <div key={index} className='flex gap-1 items-center mb-2'>
            <Link
              href={transformToSlug(item.internal_link)}
              className='group flex items-center gap-1 tag-button rounded-3xl text-sm hover:no-underline'
            >
              <span>{item.term}</span>
              <LinkIcon size={16} />
            </Link>
            <span>{item.description}</span>
          </div>
        ) : (
          <div className='flex items-center mb-2' key={index}>
            <span key={index} className='tag-button-no-link rounded-3xl text-sm bg-extreme-light'>
              {item.term}
            </span>
            <span>{item.description}</span>
          </div>
        )
      ))}
    </section>
  );
};

export default RelatedTermsSection;