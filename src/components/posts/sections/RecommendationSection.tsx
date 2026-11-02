import PostCard from '@/components/posts/PostCard';
import PrevNextSection from '../sections/PrevNextSection';
import { fetchTermsData } from '@/utils/fetchData';
import { TermData } from '@/types';
import { getRecommendedTerms } from '@diki/core';

interface RecommendationSectionProps {
  term: TermData
  lastTermId: number
}

const RecommendationSection = async ({ term, lastTermId }: RecommendationSectionProps) => {
  const terms = await fetchTermsData();
  const filteredTerms = getRecommendedTerms(term, terms);

  return (
    <section className='w-full group-section flex flex-col gap-4'>
      <h2 className='flex items-center'>
        <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-section-title transition-opacity">{'#'}</span>
        {'추천 포스트'}
      </h2>
      {term.id && <PrevNextSection id={term.id} lastTermId={lastTermId} />}
      <div className="flex justify-center mt-4">
        <div className="w-full grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTerms.map((term) => (
            <div
              key={term.id}
              className="transition-transform duration-300 hover:-translate-y-2"
            >
              <PostCard
                key={term.url}
                term={term}
                size='sm'
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendationSection;
