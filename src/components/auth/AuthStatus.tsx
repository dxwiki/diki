'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Dropdown,
  DropdownTrigger,
  DropdownList,
  DropdownItem,
} from '@/components/ui/Dropdown';

interface UserInfo {
  id: number;
  username: string;
  name: string;
  thumbnail: string;
}

export default function AuthStatus() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 쿠키에서 사용자 정보 읽기
    const userInfoCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user-info='));

    if (userInfoCookie) {
      try {
        const userInfo = JSON.parse(decodeURIComponent(userInfoCookie.split('=')[1]));
        setUser(userInfo);
      } catch (error) {
        console.error('Failed to parse user info:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        // 쿠키 삭제 후 페이지 새로고침
        document.cookie = 'user-info=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        document.cookie = 'user-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <div className="w-[80px] h-[36px]" />; // 로딩 중에는 같은 크기의 빈 공간 유지
  }

  if (!user) {
    return (
      <Link href="/login" className="rounded-md text-sm text-gray1 hover:text-main">
        {'기여하기'}
      </Link>
    );
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
            <Link href={`/profiles/${ user.username }`} className="w-full block">
              {'내 프로필'}
            </Link>
          </DropdownItem>

          <DropdownItem>
            <Link href="/create" className="w-full block">
              {'글 작성하기'}
            </Link>
          </DropdownItem>

          <DropdownItem onClick={handleLogout}>
            <span className="text-red-500">{'로그아웃'}</span>
          </DropdownItem>
        </DropdownList>
      </Dropdown>
    </div>
  );
}