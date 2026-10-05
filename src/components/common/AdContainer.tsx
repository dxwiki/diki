'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adsbygoogle: any;
  }
}

interface AdContainerProps {
  slot: string;
  format: string;
  className?: string;
  containerClassName?: string;
}

// 프리뷰·로컬 개발에서는 광고 대신 같은 크기의 빈 영역만 남긴다(Vercel 값이 없으면 NODE_ENV로 판단)
const isProduction = (process.env.NEXT_PUBLIC_VERCEL_ENV ?? (process.env.NODE_ENV === 'production' ? 'production' : 'development')) === 'production';

const AdContainer = ({ slot, format, className, containerClassName }: AdContainerProps) => {
  useEffect(() => {
    if (!isProduction) return;
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  if (!isProduction) {
    return (
      <div className={`googleAd-container ${ containerClassName ?? '' }`}>
        <div className={className} />
      </div>
    );
  }

  return (
    <div className={`googleAd-container ${ containerClassName ?? '' }`}>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        strategy="afterInteractive"
      />
      <ins
        className={`adsbygoogle block ${ className ?? '' }`}
        data-ad-client="ca-pub-1278038564950020"
        data-ad-slot={slot}
        data-auto-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdContainer;