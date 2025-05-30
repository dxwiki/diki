'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Dropdown,
  DropdownTrigger,
  DropdownList,
  DropdownItem,
} from '@/components/ui/Dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { checkAuth, logout } from '@/store/authSlice';

export default function AuthStatus() {
  const dispatch = useDispatch();
  const { user, loading, isLoggedIn } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 인증 상태 확인
    dispatch(checkAuth());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        // Redux 상태 업데이트
        dispatch(logout());
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <div className="w-[80px] h-[36px]" />; // 로딩 중에는 같은 크기의 빈 공간 유지
  }

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="relative flex">
      <Dropdown>
        <DropdownTrigger>
          <div className="flex items-center space-x-2 focus:outline-none cursor-pointer">
            <Image src={user.thumbnail} alt="User Thumbnail" className="rounded-full" width={32} height={32} />
            <span className="hidden sm:block">{user.name}</span>
          </div>
        </DropdownTrigger>

        <DropdownList>
          <DropdownItem>
            <Link href={`/profiles/${ user.username }`} className="p-2 block w-full">
              {'내가 쓴 글'}
            </Link>
          </DropdownItem>

          <DropdownItem>
            <Link href={`/profiles/${ user.username }/edit`} className="p-2 block w-full">
              {'프로필 편집'}
            </Link>
          </DropdownItem>

          <DropdownItem onClick={handleLogout}>
            <span className="p-2 block w-full text-level-5">{'로그아웃'}</span>
          </DropdownItem>
        </DropdownList>
      </Dropdown>
    </div>
  );
}