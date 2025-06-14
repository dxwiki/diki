'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, SocialType } from '@/types';
import { ConfirmModal } from '@/components/ui/Modal';
import Footer from '@/components/common/Footer';
import { useToast } from '@/layouts/ToastProvider';
import { Switch } from '@mui/material';
import styles from '@/app/style/switch.module.css';

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
    };

    // GitHub URL 설정
    if (userInfo.username && !userInfo.username.includes('@')) {
      social.github = `${ userInfo.username }`;
    }

    if (userInfo.social && userInfo.social.linkedin) {
      social.linkedin = userInfo.social.linkedin;
    }

    const showLinks = userInfo.showLinks || {
      email: true,
      github: true,
      linkedin: true,
    };

    const cookieProfile: Profile = {
      id: userInfo.id,
      username: userInfo.username,
      name: userInfo.name,
      thumbnail: userInfo.thumbnail,
      email: userInfo.email || '',
      role: 'contributor',
      social: social,
      updatedAt: new Date().toISOString(),
      intro: userInfo.intro || '',
      showLinks: showLinks,
    };

    return { cookieProfile, isOwnProfile, userInfo };
  } catch (error) {
    console.error('쿠키 파싱 오류:', error);
    return { cookieProfile: undefined, isOwnProfile: false, userInfo: null };
  }
}

export default function ProfileEditPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    thumbnail: '',
    intro: '',
    social: {
      github: '',
      linkedin: '',
    },
    showLinks: {
      email: true,
      github: true,
      linkedin: true,
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [nameError, setNameError] = useState(false);

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
            intro: profileData.intro || '',
            social: {
              github: profileData.social.github || '',
              linkedin: profileData.social.linkedin || '',
            },
            showLinks: profileData.showLinks || {
              email: true,
              github: true,
              linkedin: true,
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
              intro: cookieProfile.intro || '',
              social: {
                github: cookieProfile.social.github || '',
                linkedin: cookieProfile.social.linkedin || '',
              },
              showLinks: cookieProfile.showLinks || {
                email: true,
                github: true,
                linkedin: true,
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

    if (name === 'name' && value.trim() !== '') {
      setNameError(false);
    }

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

  // 토글 버튼 상태 변경 처리
  const handleToggleChange = (field: string) => {
    const [parent, child] = field.split('.');
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as Record<string, boolean>),
        [child]: !(prev[parent as keyof typeof prev] as Record<string, boolean>)[child],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 이름 필드 유효성 검사
    if (!formData.name.trim()) {
      setNameError(true);
      return;
    }

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
        intro: formData.intro,
        social: formData.social,
        showLinks: formData.showLinks,
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
        throw new Error(errorData.message || '프로필 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
      }

      await response.json();

      showToast('프로필 수정 요청이 접수되었습니다.', 'success', 5000);
      router.push(`/profiles/${ params.slug }`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '프로필 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    showToast('프로필 편집이 취소되었습니다.', 'info', 5000);
    router.push(`/profiles/${ params.slug }`);
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setError(null);

    try {
      if (!profile) throw new Error('프로필 정보를 찾을 수 없습니다.');

      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: profile.username,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.');
      }

      await response.json();
      router.push('/good-bye');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '회원탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.');
      setDeletingAccount(false);
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
      <div className="w-full mt-10 mb-2 md:mb-4">
        <h1 className="text-xl lg:text-2xl font-bold text-main">{'프로필 편집'}</h1>
        <p className="text-gray2">{'프로필은 매일 자정(00:00)에 업데이트됩니다. 자정 이전에 수정된 내용은 반영되지 않을 수 있습니다.'}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-background border border-gray4 rounded-xl">
          <div className="flex flex-col gap-4 sm:gap-6 sm:h-[60vh] sm:overflow-y-auto overflow-x-hidden my-10 sm:my-0 p-1.5 sm:p-6 md:p-8">
            <div>
              <label className="block text-primary font-medium mb-2">
                {'이름(한글)'}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background transition-all duration-200 ${ nameError ? 'border-level-5' : 'border-gray3' }`}
                required
                placeholder="이름을 입력해주세요"
              />
              <p className={`text-sm p-1 ${ nameError ? 'text-level-5' : 'text-gray2' }`}>
                {nameError ? '이름은 필수 입력값입니다.' : '포스트에 표시되는 이름입니다.'}
              </p>
            </div>

            <div>
              <label className="block text-primary font-medium mb-2">
                {'소개글'}
              </label>
              <input
                name="intro"
                value={formData.intro}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background transition-all duration-200"
                placeholder="간단한 소개글을 입력해주세요."
                maxLength={50}
              />
              <p className="text-gray2 text-sm p-1">{'프로필에 표시될 소개글입니다.(최대 50자)'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex text-main font-medium justify-between items-center" htmlFor="username">
                  <span>{'닉네임'}</span>
                  <div className="flex items-center invisible">
                    <Switch
                      disabled={true}
                    />
                  </div>
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  className="w-full px-4 py-3 border border-gray4 rounded-lg !bg-gray4 text-gray0 cursor-not-allowed"
                  disabled
                />
                <p className="text-gray2 text-sm p-1">{'Github 닉네임으로 설정되므로 수정할 수 없습니다.'}</p>
              </div>

              <div>
                <label className="flex text-main font-medium justify-between items-center" htmlFor="email">
                  <span>{'이메일'}</span>
                  <div className="flex items-center">
                    <span className="text-sm text-gray1">{'프로필에 표시'}</span>
                    <Switch
                      checked={formData.showLinks.email}
                      onChange={() => handleToggleChange('showLinks.email')}
                      inputProps={{ 'aria-label': '이메일 표시 여부' }}
                      className={styles.customSwitch}
                    />
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  className="w-full px-4 py-3 border border-gray4 rounded-lg !bg-gray4 text-gray0 cursor-not-allowed"
                  disabled
                  autoComplete="email"
                />
                <p className="text-gray2 text-sm p-1">{'Github 이메일로 설정되므로 수정할 수 없습니다.'}</p>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex text-primary font-medium justify-between items-center" htmlFor="github">
                    <span>{'GitHub'}</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray1">{'프로필에 표시'}</span>
                      <Switch
                        checked={formData.showLinks.github}
                        onChange={() => handleToggleChange('showLinks.github')}
                        inputProps={{ 'aria-label': 'GitHub 표시 여부' }}
                        className={styles.customSwitch}
                      />
                    </div>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray3">
                      {'github.com/'}
                    </span>
                    <input
                      type="text"
                      name="social.github"
                      id="github"
                      value={formData.social.github}
                      onChange={handleChange}
                      className="w-full pl-[100px] pr-4 py-3 border border-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background transition-all duration-200 placeholder:text-gray2"
                      placeholder="username"
                      autoComplete="username"
                    />
                  </div>
                  <p className="text-gray2 text-sm p-1">{'Github 닉네임으로 기본값이 설정됩니다.'}</p>
                </div>

                <div>
                  <label className="flex text-primary font-medium justify-between items-center" htmlFor="linkedin">
                    <span>{'LinkedIn'}</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray1">{'프로필에 표시'}</span>
                      <Switch
                        checked={formData.showLinks.linkedin}
                        onChange={() => handleToggleChange('showLinks.linkedin')}
                        inputProps={{ 'aria-label': 'LinkedIn 표시 여부' }}
                        className={styles.customSwitch}
                      />
                    </div>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray3">
                      {'linkedin.com/in/'}
                    </span>
                    <input
                      type="text"
                      name="social.linkedin"
                      id="linkedin"
                      value={formData.social.linkedin}
                      onChange={handleChange}
                      className="w-full pl-[125px] pr-4 py-3 border border-gray3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background transition-all duration-200 placeholder:text-gray2"
                      placeholder="username"
                      autoComplete="url"
                    />
                  </div>
                  <p className="text-gray2 text-sm p-1">{'Github 닉네임으로 기본값이 설정됩니다.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 md:mx-8 -mt-2 mb-4 p-3 bg-level-5 text-level-5 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-between space-x-2 sm:space-x-4 mt-10 sm:mt-0 py-6">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-level-5 hover:bg-red-700 dark:hover:bg-red-900 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={deletingAccount}
          >
            {deletingAccount ? '탈퇴 처리 중...' : '회원 탈퇴'}
          </button>
          <div className="flex gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-gray2 rounded-lg hover:text-main transition-all duration-200"
            >
              {'취소'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-white bg-primary hover:bg-accent dark:bg-secondary dark:hover:bg-background-secondary rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '제출 중...' : '프로필 수정하기'}
            </button>
          </div>
        </div>
      </form>

      {/* 확인 모달 */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={updateProfile}
        title="프로필 수정"
        message="프로필 정보를 수정하시겠습니까?"
        submessage={(
          <p className="text-gray1 mt-1">
            {'프로필은 매일 자정(00:00)에 업데이트되므로 자정 이전에 수정된 내용은 반영되지 않습니다.'}
          </p>
        )}
        confirmText="수정하기"
        cancelText="취소"
      />

      {/* 취소 확인 모달 */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="편집 취소"
        message="정말 프로필 편집을 취소하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
      />

      {/* 회원탈퇴 확인 모달 */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="회원 탈퇴"
        message="정말 탈퇴하시겠습니까?"
        submessage={(
          <p className="text-level-5">
            {'이 작업은 되돌릴 수 없으며, 작성하신 글은 자정(00:00)에 비공개 처리됩니다.'}
          </p>
        )}
        confirmText="탈퇴하기"
        cancelText="취소"
        confirmButtonClass="px-4 py-2 text-level-5 hover:bg-red-700 dark:hover:bg-red-900 hover:text-white rounded-lg"
      />

      <div className="sm:hidden mt-8">
        <Footer />
      </div>
    </>
  );
}