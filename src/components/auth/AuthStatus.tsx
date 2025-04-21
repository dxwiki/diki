'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface UserInfo {
  id: number;
  username: string;
  name: string;
  thumbnail: string;
}

export default function AuthStatus() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  if (!user) {
    return (
      <Link href="/login" className="px-4 py-2 text-sm font-medium rounded-md bg-accent dark:bg-secondary text-white hover:bg-opacity-90">
        {'로그인'}
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <Image
          src={user.thumbnail}
          alt={user.name}
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="hidden md:inline-block">{user.name}</span>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
          <Link href={`/profiles/${ user.username }`} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
            {'내 프로필'}
          </Link>
          <Link href="/create" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
            {'글 작성하기'}
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {'로그아웃'}
          </button>
        </div>
      )}
    </div>
  );
}