import { getTermData } from '@/utils/termsData';
import { notFound } from 'next/navigation';
import TableOfContents from '@/components/common/TableOfContents';
import Stars from '@/components/ui/Stars';
import PostHeader from './sections/PostHeader';
import DifficultyLevel from './sections/DifficultyLevel';
import DescriptionSection from './sections/DescriptionSection';
import RelevanceSection from './sections/RelevanceSection';
import RelatedTermsSection from './sections/RelatedTermsSection';
import UsecaseSection from './sections/UsecaseSection';
import ReferencesSection from './sections/ReferencesSection';

interface Props {
  slug: string
}

const PostDetail = async ({ slug }: Props) => {
  const term = await getTermData(slug);

  if (!term) {
    notFound();
  }

  return (
    <div className='prose block md:grid md:grid-cols-[1fr_5fr]'>
      <TableOfContents title={term.title.ko} />
      <div className='md:mr-40 text-justify'>
        <PostHeader term={term} slug={slug} />
        <div className='animate-introSecond sm:ml-5'>
          <DifficultyLevel
            level={term.difficulty.level}
            description={term.difficulty.description}
          />
          <DescriptionSection description={term.description.full} />
          <RelevanceSection
            analyst={term.relevance.analyst}
            engineer={term.relevance.engineer}
            scientist={term.relevance.scientist}
          />
          <RelatedTermsSection terms={term.terms} />
          <UsecaseSection usecase={term.usecase} />
          <ReferencesSection references={term.references} />
        </div>
      </div>
    </div>
  );
};

export default PostDetail;