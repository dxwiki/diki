'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const MobileCreatePost = dynamic(() => import('./MobileCreatePost'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const DesktopCreatePost = dynamic(() => import('./DesktopCreatePost'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

export default function ResponsiveCreatePost() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // 초기 체크
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
    };

    checkMobile();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 초기 로딩 중
  if (isMobile === null) {
    return <LoadingSpinner />;
  }

  return isMobile ? <MobileCreatePost /> : <DesktopCreatePost />;
}
