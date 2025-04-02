import ContactClient from '@/components/common/ContactClient';
import Footer from '@/components/common/Footer';
import { dikiMetadata } from '@/constants';
import { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    title: '문의하기',
    description: '문의사항이나 피드백을 보내실 수 있는 페이지입니다.',
    openGraph: {
      title: '문의하기',
      description: '문의사항이나 피드백을 보내실 수 있는 페이지입니다.',
      url: `${ dikiMetadata.url }/contact`,
      siteName: dikiMetadata.title,
      locale: 'ko_KR',
      type: 'website',
      images: [
        {
          url: dikiMetadata.thumbnailURL,
          width: 1200,
          height: 630,
          alt: '문의하기',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: '문의하기',
      description: '문의사항이나 피드백을 보내실 수 있는 페이지입니다.',
      images: [dikiMetadata.thumbnailURL],
    },
  };
}

export function generateStaticParams() {
  return [];
}

const ContactPage = async () => {
  return (
    <>
      <ContactClient />
      <div className='block sm:hidden'>
        <Footer />
      </div>
    </>
  );
};

export default ContactPage;
