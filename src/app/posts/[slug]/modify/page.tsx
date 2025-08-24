import { getTermData } from '@/utils/fetchData';
import { Metadata } from 'next';
import ModifyClient from './ModifyClient';

interface ModifyPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ModifyPageProps): Promise<Metadata> {
  const { slug } = params;

  try {
    const term = await getTermData(slug);

    return {
      title: `${ term?.title?.ko || '포스트' } 수정하기 - Diki`,
      description: `${ term?.title?.ko || '포스트' } 내용을 수정하고 GitHub 이슈로 등록하세요.`,
      robots: {
        index: false,
        follow: false,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      title: '포스트 수정하기 - Diki',
      description: '데이터 용어사전 포스트를 수정하고 GitHub 이슈로 등록하세요.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function ModifyPage({ params }: ModifyPageProps) {
  const { slug } = params;

  try {
    // 서버 컴포넌트에서 데이터 가져오기
    const termData = await getTermData(slug);

    // 클라이언트 컴포넌트로 데이터 전달
    return <ModifyClient slug={slug} initialData={termData} />;
  } catch (error) {
    console.error('포스트 데이터 가져오기 오류:', error);
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <p className="text-main">{'포스트를 찾을 수 없습니다.'}</p>
      </div>
    );
  }
}