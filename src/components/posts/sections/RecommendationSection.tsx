import PostCard from '@/components/posts/PostCard';
import { fetchTermsData } from '@/utils/termsData';

const RecommendationSection = async () => {
  const terms = await fetchTermsData();

  const recentTerms = [...terms]
    .sort((a, b) => new Date(b.metadata?.created_at ?? '').getTime() - new Date(a.metadata?.created_at ?? '').getTime())
    .slice(0, 6);

  if(recentTerms.length < 6) return null;

  return (
    <section className='w-full group-section flex flex-col gap-2'>
      <h2 className='flex items-center'>
        <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-section-title transition-opacity">{'#'}</span>
        {'추천 포스트'}
      </h2>
      <div className="flex justify-center">
        <div className="w-full grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentTerms.map((term) => (
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
