import { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/common/Footer';
import { dikiMetadata } from '@/constants';
import {
  APP_PRIVACY_CONTACT,
  APP_PRIVACY_EFFECTIVE_DATE as EFFECTIVE_DATE,
  APP_PRIVACY_INTRO,
  APP_PRIVACY_SECTIONS as sections,
  APP_PRIVACY_TITLE as TITLE,
} from '@diki/core';

const DESCRIPTION = 'Diki 모바일 앱(iOS·Android)이 처리하는 정보와 보관 방식을 안내합니다.';

export function generateMetadata(): Metadata {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${ dikiMetadata.url }/privacy/app` },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: `${ dikiMetadata.url }/privacy/app`,
      siteName: dikiMetadata.title,
      locale: 'ko_KR',
      type: 'website',
    },
  };
}

export default function AppPrivacyPage() {
  return (
    <>
      <article className="mx-auto max-w-3xl py-10">
        <h1 className="text-2xl font-bold text-main">{TITLE}</h1>
        <p className="mt-2 text-sm text-gray1">{`시행일: ${ EFFECTIVE_DATE }`}</p>
        <p className="mt-6 leading-relaxed text-sub">
          {APP_PRIVACY_INTRO}
        </p>
        {sections.map((section) => (
          <section key={section.title} className="mt-8">
            <h2 className="text-lg font-bold text-main">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-2 leading-relaxed text-sub">{paragraph}</p>
            ))}
          </section>
        ))}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-main">{APP_PRIVACY_CONTACT.title}</h2>
          <p className="mt-2 leading-relaxed text-sub">
            {`${ APP_PRIVACY_CONTACT.owner } · 연락: `}
            <Link href="/contact" className="text-primary hover:underline">{'문의하기 페이지'}</Link>
          </p>
        </section>
      </article>
      <div className="block sm:hidden">
        <Footer />
      </div>
    </>
  );
}
