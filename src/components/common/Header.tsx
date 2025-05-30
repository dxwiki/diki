'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ScrollDirectionHandler from '@/components/common/ScrollDirectionHandler';
import ThemeSwitch from '@/components/theme/ThemeSwitch';
import { Send, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedTerms } from '@/store/termsSlice';
import { checkAuth } from '@/store/authSlice';
import { RootState } from '@/store';
import TooltipButton from '../ui/TooltipButton';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import AuthStatus from '@/components/auth/AuthStatus';

const Header = () => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isContactPage = pathname === '/contact';
  const dispatch = useDispatch();
  const { theme, resolvedTheme } = useTheme();
  const [isThemeChanging, setIsThemeChanging] = useState(false);
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleThemeChange = () => {
      setIsThemeChanging(true);
      setTimeout(() => setIsThemeChanging(false), 100);
    };

    handleThemeChange();
  }, [theme, resolvedTheme]);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 인증 상태 확인
    dispatch(checkAuth());
  }, [dispatch]);

  const handleClickHome = () => {
    dispatch(setSearchedTerms([]));
  };

  return (
    <>
      <ScrollDirectionHandler />
      <header
        className={`fixed left-0 top-0 z-50 w-full bg-background-opacity ${ !isThemeChanging ? 'duration-1000' : '' }`}
        style={{ transform: 'translateY(var(--header-transform, 0))' }}
      >
        <div className='flex justify-between items-center max-w-6xl mx-auto px-4 py-3 md:px-6 lg:px-8'>
          <div className='flex items-center gap-3 opacity-0'>
            <AuthStatus />
            <Link
              href={isLoggedIn ? '/create' : '/login'}
              className='rounded-full px-3 py-1 text-white bg-primary hover:bg-accent dark:bg-secondary dark:hover:bg-background-secondary'
              aria-label='새 포스트 작성하기'
            >
              {'새 포스트\r'}
            </Link>
          </div>

          <div className='flex items-center gap-3'>
            <div className='w-full flex justify-end items-center gap-3'>
              {!isHomePage && (
                <Link href='/' onClick={handleClickHome} aria-label='홈으로 이동'>
                  <span className='h-8 flex items-center text-3xl font-bold'>
                    <span className='text-primary'>{'D'}</span>
                    {'iki'}
                  </span>
                </Link>
              )}
            </div>
            <div className={`flex items-center gap-1 ${ isHomePage || isContactPage ? 'windows:pr-[5px]' : '' }`}>
              <TooltipButton
                isLink={true}
                href='/posts'
                tooltip='검색'
                className='rounded-md p-2 hover:bg-background-secondary'
                ariaLabel='검색하기'
              >
                <Search className='size-4' />
              </TooltipButton>
              <TooltipButton
                isLink={true}
                href='/contact'
                tooltip='문의'
                className='rounded-md p-2 hover:bg-background-secondary'
                ariaLabel='문의하기'
              >
                <Send className='size-4' />
              </TooltipButton>
              <ThemeSwitch />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
