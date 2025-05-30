'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';
import Footer from '@/components/common/Footer';

export default function GoodByePage() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(logout());
  }, [dispatch, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-lg text-center space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-main">
          <span className="text-primary">{'D'}</span>{'iki를 이용해 주셔서 감사합니다'}
        </h1>

        <div className="bg-background border border-gray4 rounded-xl p-6 md:p-8 space-y-4">
          <p className="text-main text-lg">
            {'회원님의 계정이 성공적으로 삭제되었습니다.'}
          </p>

          <p className="text-gray1">
            {'그동안 Diki에 기여해 주셔서 진심으로 감사드립니다. '}
            {'회원님의 소중한 기여는 많은 사람들에게 도움이 되었습니다.'}
          </p>

          <p className="text-gray1">
            {'언제든지 다시 방문해 주시기 바랍니다.'}
          </p>

          <div className="pt-4">
            <Link
              href="/"
              className="text-primary hover:underline font-medium"
            >
              {'홈으로 돌아가기'}
            </Link>
          </div>
        </div>
      </div>

      <div className="sm:hidden mt-8">
        <Footer />
      </div>
    </div>
  );
}