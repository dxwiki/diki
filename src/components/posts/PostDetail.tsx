import { getTermData } from '@/utils/termsData';
import { notFound } from 'next/navigation';
import MarkdownContent from './MarkdownContent';
import TableOfContents from '@/components/common/TableOfContents';
import RadarChart from '@/components/GLRadarChart';
import Stars from '@/components/ui/Stars';
import Link from 'next/link';
import PostHeader from './sections/PostHeader';
import { transformToSlug } from '@/utils/filters';
import { Link as LinkIcon } from 'lucide-react';

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
      <div className='flex flex-col'>
        <div className='h-[293px] hidden md:block' />
        <div className='sticky top-[132px] h-32 hidden md:block'>
          <TableOfContents title={term.title.ko} />
        </div>
      </div>
      <div className='md:mr-40 text-justify'>
        <div className='sm:ml-5'>
          <PostHeader term={term} slug={slug} />
        </div>
        <div className='sm:ml-5'>
          <div className='mt-5'>
            <MarkdownContent content={term.description.full} />
          </div>

          <section className="group">
            <h2 className='flex items-center'>
              <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
              {'난이도'}
            </h2>
            <div className='flex items-center mb-4'>
              <Stars rating={term.difficulty.level} />
            </div>
            <MarkdownContent content={term.difficulty.description} />
          </section>

          <section className="group">
            <h2>
              <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
              {'직무 연관도'}
            </h2>
            <div className='block sm:flex items-start gap-10'>
              <div className='w-[100vw-8px] sm:w-[300px] flex justify-center items-center sm:mb-0 sm:mr-2'>
                <RadarChart
                  className="mt-6"
                  targetData={[term.relevance.analyst.score,term.relevance.scientist.score,term.relevance.engineer.score]}
                  labelData={['Analyst', 'Scientist', 'Engineer']}
                  init
                />
              </div>
              <div className='grid grid-cols-[1fr_3fr] h-full mt-4'>
                <span className="text-main text-center sm:m-0">{'직무'}</span>
                <span className="text-main pl-4 sm:m-0">{'설명'}</span>

                <div className="grid grid-rows-3">
                  <h3 className="text-center self-center m-0">{'Analyst'}</h3>
                  <h3 className="text-center self-center m-0">{'Engineer'}</h3>
                  <h3 className="text-center self-center m-0">{'Scientist'}</h3>
                </div>

                <div className="pl-3 grid grid-rows-3">
                  <span className="self-center p-1">{term.relevance.analyst.description}</span>
                  <span className="self-center p-1">{term.relevance.engineer.description}</span>
                  <span className="self-center p-1">{term.relevance.scientist.description}</span>
                </div>

              </div>
            </div>
          </section>

          <section className="group">
            <h2>
              <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
              {'관련용어'}
            </h2>
            {term.terms.map((item, index) => (
              item.internal_link ? (
                <div key={index} className='flex gap-1 items-center mb-2'>
                  <Link
                    href={transformToSlug(item.internal_link)}
                    className='group flex items-center tag-button rounded-3xl text-sm hover:no-underline'
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
            {/* {term.terms.map((item, index) => (
                <li key={index} className='flex items-center gap-3 mb-2'>
                  <span >
                    {item.term} {item.internal_link && <a href={item.internal_link}>{'🔗'}</a>}
                  </span>
                  </li>
                  ))} */}
          </section>

          <section className="group">
            <h2>
              <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
              {'사용사례'}
            </h2>
            <div className="flex flex-wrap gap-1 mb-4">
              {term.usecase.industries.map((tag, index) => (
                <span
                  key={index}
                  className="tag-button-no-link bg-extreme-light text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <MarkdownContent content={term.usecase.example} />
            <MarkdownContent content={term.usecase.description} />
          </section>

          <section className="group">
            <h2>
              <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
              {'레퍼런스'}
            </h2>
            <div>
              <h3>{'1. Tutorials'}</h3>
              <ul>
                {term.references.tutorials.map((tutorial, index) => (
                  <li key={index}>
                    <Link href={tutorial.external_link ?? '#'} target="_blank" rel="noopener noreferrer">{tutorial.title}</Link>
                    <div className=''>{tutorial.platform}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{'2. Books'}</h3>
              <ul>
                {term.references.books.map((book, index) => (
                  <li key={index}>
                    <div>
                      <Link href={book.external_link ?? '#'} target="_blank" rel="noopener noreferrer">{book.title}</Link>
                    </div>
                    <div className=''>{' by '}{book.authors.join(', ')}{'('}{book.year}{', '}{book.publisher}{')'}</div>
                    <div className=''>{'ISBN: '}{book.isbn}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{'3. Academic'}</h3>
              <ul>
                {term.references.academic.map((paper, index) => (
                  <li key={index}>
                    <Link href={paper.external_link ?? '#'} target="_blank" rel="noopener noreferrer">{paper.title}</Link>
                    <div className=''>{paper.authors.join(', ')}{' ('}{paper.year}{') '}</div>
                    <div className=''>{'DOI: '}{paper.doi}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{'4. Open Source'}</h3>
              <ul>
                {term.references.opensource.map((project, index) => (
                  <li key={index}>
                    <Link href={project.external_link ?? '#'} target="_blank" rel="noopener noreferrer">{project.name}</Link>
                    <div className=''>{project.description}</div>
                    <div className=''>{'(License: '}{project.license}{')'}</div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;