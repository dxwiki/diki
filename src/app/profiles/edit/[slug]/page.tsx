'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, SocialType } from '@/types';
import { ConfirmModal } from '@/components/ui/Modal';
import Footer from '@/components/common/Footer';

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
      twitter: '',
    };

    // GitHub URL 설정
    if (userInfo.username && !userInfo.username.includes('@')) {
      social.github = `${ userInfo.username }`;
    }

    if (userInfo.social && userInfo.social.linkedin) {
      social.linkedin = userInfo.social.linkedin;
    }

    const cookieProfile: Profile = {
      id: userInfo.id,
      username: userInfo.username,
      name: userInfo.name,
      thumbnail: userInfo.thumbnail,
      email: userInfo.email || '',
      role: 'contributor',
      social: social,
      updatedAt: new Date().toISOString(),
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
    username: '',
    email: '',
    thumbnail: '',
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
        const response = await fetch(`/api/profiles/${ params.slug }`);

        if (response.ok) {
          // API에서 데이터 가져오기 성공한 경우
          const profileData = await response.json();
          setProfile(profileData);
          setFormData({
            name: profileData.name,
            username: profileData.username,
            email: profileData.email,
            thumbnail: profileData.thumbnail,
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
              username: cookieProfile.username,
              email: cookieProfile.email,
              thumbnail: cookieProfile.thumbnail,
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

  const updateProfile = async () => {
    setSubmitting(true);
    setError(null);

    try {
      if (!profile) throw new Error('프로필 정보를 찾을 수 없습니다.');

      // 수정된 프로필 데이터
      const updatedProfile = {
        ...profile,
        name: formData.name,
        email: profile.email, // 이메일은 원래 값 사용
        username: profile.username, // 사용자명은 원래 값 사용
        social: formData.social,
      };

      // Firebase 프로필 업데이트 API 호출
      const response = await fetch('/api/edit-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_data: updatedProfile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '프로필 수정 중 오류가 발생했습니다.');
      }

      await response.json();
      alert('프로필이 성공적으로 수정되었습니다!');
      router.push(`/profiles/${ params.slug }`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '프로필 수정 중 오류가 발생했습니다.');
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
    <>
      <div className="w-full mb-2 md:mb-4">
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-main">{'프로필 편집'}</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-background border border-gray4 rounded-xl">
          <div className="flex flex-col gap-2 h-[60vh] overflow-y-auto overflow-x-hidden p-6 md:p-8">
            <div>
              <label className="block text-main font-medium mb-2">
                {'이름 (한글)'}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background transition-all duration-200"
                required
                placeholder="이름을 입력해주세요"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-main font-medium mb-2">
                  {'닉네임'}
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  className="w-full px-4 py-3 border border-gray3 rounded-lg bg-gray4 text-gray2 cursor-not-allowed"
                  disabled
                />
              </div>

              <div>
                <label className="block text-main font-medium mb-2">
                  {'이메일'}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="w-full px-4 py-3 border border-gray3 rounded-lg bg-gray4 text-gray2 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-main font-medium mb-2">
                    {'GitHub'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray3">
                      {'github.com/'}
                    </span>
                    <input
                      type="text"
                      name="social.github"
                      value={formData.social.github}
                      onChange={handleChange}
                      className="w-full pl-[100px] pr-4 py-3 border border-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background transition-all duration-200 placeholder:text-gray2"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-main font-medium mb-2">
                    {'LinkedIn'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray3">
                      {'linkedin.com/in/'}
                    </span>
                    <input
                      type="text"
                      name="social.linkedin"
                      value={formData.social.linkedin}
                      onChange={handleChange}
                      className="w-full pl-[125px] pr-4 py-3 border border-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background transition-all duration-200 placeholder:text-gray2"
                      placeholder="username"
                    />
                  </div>
                </div>

                {/* <div>
                  <label className="block text-main font-medium mb-2">
                    {'Twitter'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray3">
                      {'twitter.com/'}
                    </span>
                    <input
                      type="text"
                      name="social.twitter"
                      value={formData.social.twitter}
                      onChange={handleChange}
                      className="w-full pl-[100px] pr-4 py-3 border border-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background transition-all duration-200 placeholder:text-gray2"
                      placeholder="username"
                    />
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 md:mx-8 -mt-2 mb-4 p-3 bg-level-5 text-level-5 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4 py-6">
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="px-4 py-2 text-gray2 rounded-lg hover:text-main transition-all duration-200"
          >
            {'취소'}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-white bg-primary hover:bg-accent dark:bg-secondary dark:hover:bg-background-secondary rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '제출 중...' : '프로필 수정하기'}
          </button>
        </div>
      </form>

      {/* 확인 모달 */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={updateProfile}
        title="프로필 수정"
        message="프로필 정보를 수정하시겠습니까?"
        confirmText="수정하기"
        cancelText="취소"
      />

      {/* 취소 확인 모달 */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => router.push(`/profiles/${ params.slug }`)}
        title="편집 취소"
        message="정말 프로필 편집을 취소하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
      />

      <div className="sm:hidden mt-8">
        <Footer />
      </div>
    </>
  );
}