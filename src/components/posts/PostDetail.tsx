import PostDetailClient from './PostDetailClient';
import PostHeader from './sections/PostHeader';
import DescriptionSection from './sections/DescriptionSection';
import RelevanceSection from './sections/RelevanceSection';
import RelatedTermsSection from './sections/RelatedTermsSection';
import UsecaseSection from './sections/UsecaseSection';
import ReferencesSection from './sections/ReferencesSection';
import RecommendationSection from './sections/RecommendationSection';
import { TermData } from '@/types';
import AdContainer from '@/components/common/AdContainer';
interface Props {
  term: TermData
  slug: string
}

const PostDetail = async ({ term, slug }: Props) => {
  return (
    <PostDetailClient
      title={term.title?.ko ?? ''}
      term={term}
      slug={slug}
    >
      <PostHeader term={term} />
      <div className='animate-introSecond sm:ml-5'>
        <DescriptionSection description={term.description?.full ?? ''} />
        <RelatedTermsSection terms={term.terms ?? []} />
        <RelevanceSection
          analyst={term.relevance?.analyst ?? { score: 0, description: '' }}
          engineer={term.relevance?.engineer ?? { score: 0, description: '' }}
          scientist={term.relevance?.scientist ?? { score: 0, description: '' }}
        />
        <UsecaseSection usecase={term.usecase ?? { industries: [], example: '', description: '' }} />
        <ReferencesSection references={term.references ?? { tutorials: [], books: [], academic: [], opensource: [] }} />
        <AdContainer
          slot="5709016505"
          format="mcrspv"
          className="w-full min-h-[160px]"
        />
        <RecommendationSection />
        <AdContainer
          slot="6880591392"
          format="rspv"
          className="w-full min-h-[200px]"
        />
      </div>
    </PostDetailClient>
  );
};

export default PostDetail;