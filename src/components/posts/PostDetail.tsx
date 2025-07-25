import PostDetailClient from './PostDetailClient';
import DescriptionSection from './sections/DescriptionSection';
import RelevanceSection from './sections/RelevanceSection';
import RelatedTermsSection from './sections/RelatedTermsSection';
import UsecaseSection from './sections/UsecaseSection';
import ReferencesSection from './sections/ReferencesSection';
import RecommendationSection from './sections/RecommendationSection';
import { TermData } from '@/types';
// import AdContainer from '@/components/common/AdContainer';
import Footer from '@/components/common/Footer';
interface Props {
  term: TermData
  slug: string
  lastTermId: number
}

const PostDetail = async ({ term, slug, lastTermId }: Props) => {
  return (
    <PostDetailClient
      title={term.title?.ko ?? ''}
      term={term}
      slug={slug}
    >
      <div className='mt-10'>
        <DescriptionSection description={term.description?.full ?? ''} />
      </div>
      <RelatedTermsSection terms={term.terms ?? []} />
      <RelevanceSection
        analyst={term.relevance?.analyst ?? { score: 0, description: '' }}
        engineer={term.relevance?.engineer ?? { score: 0, description: '' }}
        scientist={term.relevance?.scientist ?? { score: 0, description: '' }}
      />
      <UsecaseSection usecase={term.usecase ?? { industries: [], example: '', description: '' }} />
      <ReferencesSection references={term.references ?? { tutorials: [], books: [], academic: [], opensource: [] }} />
      {/* <div className='block lg:hidden'>
        <AdContainer
          slot="7024538925"
          format="auto"
          className=" w-full h-[160px]"
        />
      </div> */}
      <RecommendationSection term={term} lastTermId={lastTermId} />
      {/* <AdContainer
        slot="5711457255"
        format="auto"
        className="w-full h-[160px]"
      /> */}
      <div className='hidden sm:block h-[80px]' />

      <div className='block sm:hidden'>
        <Footer />
      </div>
    </PostDetailClient>
  );
};

export default PostDetail;