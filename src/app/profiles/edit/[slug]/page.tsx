'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, SocialType } from '@/types';
import { ConfirmModal } from '@/components/ui/Modal';
import Footer from '@/components/common/Footer';
import Link from 'next/link';

// 클라이언트 컴포넌트용 쿠키에서 프로필 정보 가져오는 함수
function getClientProfileFromCookie(username: string) {
  const userInfoCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('user-info='));
  
  if (!userInfoCookie) return { cookieProfile: undefined, isOwnProfile: false, userInfo: null };
  
  try {
    const userInfo = JSON.parse(decodeURIComponent(userInfoCookie.split('=')[1]));
    const isOwnProfile = userInfo && userInfo.username === username;
    
    if (!isOwnProfile) return { cookieProfile: undefined, isOwnProfile: false, userInfo };
    
    // 쿠키에서 프로필 생성
    const social: SocialType = {
      github: '',
      linkedin: '',
      twitter: ''
    };
    
    // GitHub URL 설정
    if (userInfo.username && !userInfo.username.includes('@')) {
      social.github = `${userInfo.username}`;
    }
    
    const cookieProfile: Profile = {
      id: userInfo.id,
      username: userInfo.username,
      name: userInfo.name,
      thumbnail: userInfo.thumbnail,
      email: userInfo.email || '',
      role: 'contributor',
      social: social,
      updatedAt: new Date().toISOString()
    };
    
    return { cookieProfile, isOwnProfile, userInfo };
  } catch (error) {
    console.error('쿠키 파싱 오류:', error);
    return { cookieProfile: undefined, isOwnProfile: false, userInfo: null };
  }
}

export default function ProfileEditPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    social: {
      github: '',
      linkedin: '',
      twitter: '',
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // 프로필 데이터 가져오기 및 사용자 인증 확인
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // 쿠키에서 사용자 정보 확인
        const { cookieProfile, isOwnProfile, userInfo } = getClientProfileFromCookie(params.slug);
        
        // 로그인 여부 및 본인 프로필 확인
        if (userInfo) {
          setIsCurrentUser(isOwnProfile);
        }
        
        // profiles 컬렉션에서 사용자 데이터 가져오기 시도
        const response = await fetch(`/api/profiles/${params.slug}`);
        
        if (response.ok) {
          // API에서 데이터 가져오기 성공한 경우
          const profileData = await response.json();
          setProfile(profileData);
          setFormData({
            name: profileData.name,
            role: profileData.role,
            email: profileData.email,
            social: {
              github: profileData.social.github || '',
              linkedin: profileData.social.linkedin || '',
              twitter: profileData.social.twitter || '',
            },
          });
        } else {
          // API 데이터가 없고, 본인 프로필이며 쿠키에 정보가 있는 경우
          if (isOwnProfile && cookieProfile) {
            setProfile(cookieProfile);
            setFormData({
              name: cookieProfile.name,
              role: cookieProfile.role,
              email: cookieProfile.email,
              social: {
                github: cookieProfile.social.github || '',
                linkedin: cookieProfile.social.linkedin || '',
                twitter: cookieProfile.social.twitter || '',
              },
            });
          } else {
            throw new Error('프로필을 찾을 수 없습니다.');
          }
        }
      } catch (error) {
        console.error('프로필 데이터 로드 오류:', error);
        setError('프로필 데이터를 가져오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [params.slug]);

  // 권한 없는 사용자는 리다이렉트
  useEffect(() => {
    if (!loading && !isCurrentUser) {
      router.push('/login?error=login_required');
    }
  }, [loading, isCurrentUser, router]);

  // 입력 필드 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as Record<string, string>),
            [child]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmModalOpen(true); // 모달 열기
  };

  const submitToGithub = async () => {
    setSubmitting(true);
    setError(null);

    try {
      if (!profile) throw new Error('프로필 정보를 찾을 수 없습니다.');

      // 수정된 프로필 데이터
      const updatedProfile = {
        ...profile,
        name: formData.name,
        role: formData.role,
        email: formData.email,
        social: formData.social,
      };

      // GitHub 이슈 생성 API 호출
      const response = await fetch('/api/edit-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: {
            ko: `${profile.name} 프로필 수정 요청`,
            en: `${profile.name} Profile Edit Request`,
          },
          description: {
            short: `${profile.name} 사용자의 프로필 정보 수정 요청입니다.`,
            full: `${profile.name} 사용자의 프로필 정보가 수정되었습니다. 수정된 정보를 반영해주세요.`,
          },
          metadata: {
            profile_edit: true,
            profile_data: updatedProfile,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '프로필 수정 요청 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      alert('프로필 수정 요청이 성공적으로 GitHub 이슈로 등록되었습니다!');
      router.push(`/thank-you?issue=${result.issue_number}`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '프로필 수정 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[70vh]">{'로딩 중...'}</div>;
  }

  if (!isCurrentUser) {
    return null; // useEffect에서 리다이렉트 처리
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-2xl font-bold mb-4">{'프로필을 찾을 수 없습니다'}</h1>
        <Link href="/" className="text-primary hover:underline">
          {'홈으로 돌아가기'}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="w-full mb-4">
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold">{'프로필 편집'}</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="h-[65vh] sm:h-[73vh] overflow-y-auto overflow-x-hidden border border-gray3 rounded-lg p-6">
          <div className="mb-6">
            <label className="block text-main font-medium mb-2">
              {'이름'}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-light rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-main font-medium mb-2">
              {'직무'}
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-light rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-main font-medium mb-2">
              {'이메일'}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-light rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              required
            />
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-medium mb-4">{'소셜 미디어'}</h3>

            <div className="mb-4">
              <label className="block text-main font-medium mb-2">
                {'GitHub 사용자 이름'}
              </label>
              <input
                type="text"
                name="social.github"
                value={formData.social.github}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-light rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              />
            </div>

            <div className="mb-4">
              <label className="block text-main font-medium mb-2">
                {'LinkedIn 사용자 이름'}
              </label>
              <input
                type="text"
                name="social.linkedin"
                value={formData.social.linkedin}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-light rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              />
            </div>

            <div className="mb-4">
              <label className="block text-main font-medium mb-2">
                {'Twitter 사용자 이름'}
              </label>
              <input
                type="text"
                name="social.twitter"
                value={formData.social.twitter}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-light rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="text-end text-level-5 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4 py-4">
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="px-4 py-2 text-gray2 rounded-md hover:text-main"
          >
            {'취소'}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-white bg-primary dark:bg-secondary hover:bg-accent dark:hover:bg-background-secondary rounded-md border-gray4 disabled:opacity-50"
          >
            {submitting ? '제출 중...' : 'GitHub 이슈 등록하기'}
          </button>
        </div>
      </form>

      {/* 확인 모달 */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={submitToGithub}
        title="GitHub 이슈 등록"
        message="프로필 정보 수정 내용을 GitHub 이슈로 등록하시겠습니까?"
        confirmText="등록하기"
        cancelText="취소"
      />

      {/* 취소 확인 모달 */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => router.push(`/profiles/${params.slug}`)}
        title="편집 취소"
        message="정말 프로필 편집을 취소하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
      />

      <div className="sm:hidden">
        <Footer />
      </div>
    </div>
  );
}