// /post/[slug]/page.tsx
import PostDetail from '@/components/posts/PostDetail';
import { notFound } from 'next/navigation';
import { dikiMetadata } from '@/constants';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { TermData } from '@/types';
import { transformToSlug } from '@/utils/filters';
import JsonLdSchema, { generateArticleSchema } from '@/components/meta/JsonLdSchema';
import { fetchProfilesData } from '@/utils/fetchData';

interface Props {
  params: { slug: string };
}

export const dynamicParams = false;

// 직접 terms.json 파일을 읽어오는 함수
function readTermsData(): TermData[] {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'terms.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents) as TermData[];
  } catch (error) {
    console.error('Error reading terms data:', error);
    return [];
  }
}

// slug로 특정 term 데이터 찾기
function findTermBySlug(slug: string): TermData | undefined {
  const termsData = readTermsData();
  return termsData.find((term) => {
    const termSlug = transformToSlug(term.title?.en || '');
    return termSlug === slug;
  });
}

export async function generateStaticParams() {
  const termsData = readTermsData();
  return termsData.map((term) => ({
    slug: transformToSlug(term.title?.en ?? 'not-found'),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const term = findTermBySlug(params.slug);

  if (!term) {
    return {};
  }

  const title = `${ term.title?.ko }${ term.title?.en ? ` (${ term.title.en })` : '' }`;
  const description = term.description?.short;

  return {
    title: title,
    description: description,
    alternates: {
      canonical: `${ dikiMetadata.url }/posts/${ params.slug }`,
    },
    openGraph: {
      title: title,
      description: description ?? '',
      url: `${ dikiMetadata.url }/posts/${ params.slug }`,
      siteName: dikiMetadata.title,
      locale: 'ko_KR',
      type: 'article',
      images: [
        {
          url: dikiMetadata.thumbnailURL,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description ?? '',
      images: [dikiMetadata.thumbnailURL],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const term = findTermBySlug(params.slug);
  const termsData = readTermsData();
  const lastTermId = termsData.length > 0 ? termsData[termsData.length - 1].id ?? 1 : 1;

  if (!term) {
    notFound();
  }

  // 프로필 데이터 가져오기
  const profiles = await fetchProfilesData();

  const title = `${ term.title?.ko }${ term.title?.en ? ` (${ term.title.en })` : '' }`;
  const description = term.description?.short || '';
  const url = `${ dikiMetadata.url }/posts/${ params.slug }`;

  const author = profiles.find((p) => p.username === term.metadata?.authors?.[0])?.name;

  const datePublished = term.metadata?.created_at || '';
  const dateModified = term.metadata?.updated_at || term.metadata?.created_at || '';

  return (
    <>
      <JsonLdSchema
        id="article-schema"
        schema={generateArticleSchema(
          title,
          description,
          url,
          author,
          datePublished,
          dateModified
        )}
      />
      <PostDetail term={term} slug={params.slug} lastTermId={lastTermId} />
    </>
  );
}
