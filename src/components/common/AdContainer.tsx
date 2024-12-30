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
}

const AdContainer = ({ slot, format, className }: AdContainerProps) => {
  useEffect(() => {
    if (!window.adsbygoogle) {
      window.adsbygoogle = [];
    }
    // 광고가 이미 로드된 경우 push 호출을 하지 않음
    if (!document.querySelector(`.adsbygoogle[data-ad-slot="${ slot }"]`)) {
      window.adsbygoogle.push({});
    }
  }, [slot]);

  return (
    <div className="googleAd-container">
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        strategy="afterInteractive"
      />
      <ins
        className={`adsbygoogle block min-h-[100px] ${ className }`}
        data-ad-client="ca-pub-1278038564950020"
        data-ad-slot={slot}
        data-auto-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdContainer;