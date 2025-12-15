'use client';

import { useState, useEffect } from 'react';
import Nav from '../../../components/layouts/nav';
import { useAuth } from '@/src/contexts/authContext';
import { useProfile, type UserProfile } from '@/src/contexts/profileContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/button/button';
import Image from 'next/image';
import MypageContainer from '@/src/components/mypageContainer';
import UserProfileModal from '@/src/components/modal/UserProfileModal';
import UserInfoSkeleton from '@/src/components/skeleton/UserInfoSkeleton';
import { normalizePhone } from '@/src/lib/utils';

// 알림 모달 컴포넌트
function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <div className="text-green-500 text-4xl mb-4">✓</div>;
      case 'error':
        return <div className="text-red-500 text-4xl mb-4">✗</div>;
      case 'warning':
        return <div className="text-yellow-500 text-4xl mb-4">⚠</div>;
      default:
        return <div className="text-blue-500 text-4xl mb-4">ℹ</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {getIcon()}
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <Button
            size="md"
            variant="filledBlack"
            onClick={onClose}
            className="w-full"
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}

// 확인 모달 컴포넌트
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-yellow-500 text-4xl mb-4">⚠</div>
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-4 justify-center">
            <Button
              size="md"
              variant="outlinedGray"
              onClick={onClose}
              className="w-[6.5rem]"
            >
              취소
            </Button>
            <Button
              size="md"
              variant="filledBlack"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="w-[6.5rem]"
            >
              확인
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserInfoPage() {
  const [activeTab] = useState('간편정보관리');
  const { user, signOut } = useAuth();
  const { profiles, setProfiles } = useProfile();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<UserProfile | null>(null);

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'error' | 'warning',
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // 프로필 데이터 가져오기
  const fetchProfiles = async () => {
    if (!user?.id) {
      // 로그인 정보가 없으면 더 이상 로딩 상태로 두지 않고 종료
      console.warn(
        '[UserInfoPage] 사용자 정보가 없어 프로필을 불러오지 않습니다.'
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/user-profiles?userId=${user.id}`);
      const result = await response.json();

      if (result.success) {
        // 데이터베이스에 필드가 없을 경우를 대비해 기본값 설정
        const profilesWithDefaults = result.data.map(
          (profile: UserProfile) => ({
            ...profile,
            is_public_institution: profile.is_public_institution ?? false,
            is_company: profile.is_company ?? false,
            is_approved: profile.is_approved ?? false,
            // 회원가입 인증(user_auth.is_verified)은 "기본정보" 인증완료를 의미하므로,
            // 기본프로필(카드/모달)에 한해서는 user.is_verified(+폰번호 일치)면 인증완료로 표시한다.
            // NOTE: 이는 UX 보정이며, 실제 서버 검증(프로필 생성/번호변경)은 phone_verifications reference로 수행됨.
            is_phone_verified:
              profile.is_phone_verified ??
              (profile.is_default &&
              Boolean(user?.is_verified) &&
              normalizePhone(String(profile.phone ?? '')) ===
                normalizePhone(String(user?.phone ?? ''))
                ? true
                : false),
            phone_verified_at: profile.phone_verified_at ?? undefined,
          })
        );

        console.log('🔍 가져온 프로필 데이터:', profilesWithDefaults);
        setProfiles(profilesWithDefaults); // ProfileContext에 저장
      } else {
        console.error('프로필 조회 실패:', result.error);
        setAlertModal({
          isOpen: true,
          title: '오류',
          message: '프로필 조회에 실패했습니다.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('프로필 조회 에러:', error);
      setAlertModal({
        isOpen: true,
        title: '오류',
        message: '프로필 조회 중 오류가 발생했습니다.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const totalPages = Math.ceil(profiles.length / itemsPerPage);
  const currentItems = profiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddProfile = () => {
    setProfileToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProfile = (profile: UserProfile) => {
    setProfileToEdit(profile);
    setIsModalOpen(true);
  };

  // ProfileContext update is handled directly in UserProfileModal

  const handleDeleteProfile = async (profileId: string) => {
    setConfirmModal({
      isOpen: true,
      title: '프로필 삭제',
      message: '정말 삭제하시겠습니까?',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/user-profiles/${profileId}`, {
            method: 'DELETE',
          });

          const result = await response.json();

          if (result.success) {
            setAlertModal({
              isOpen: true,
              title: '완료',
              message: '프로필이 삭제되었습니다.',
              type: 'success',
            });
            fetchProfiles(); // 목록 새로고침
          } else {
            setAlertModal({
              isOpen: true,
              title: '오류',
              message: result.error || '삭제에 실패했습니다.',
              type: 'error',
            });
          }
        } catch (error) {
          console.error('프로필 삭제 에러:', error);
          setAlertModal({
            isOpen: true,
            title: '오류',
            message: '삭제 중 오류가 발생했습니다.',
            type: 'error',
          });
        }
      },
    });
  };

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.push('/');
      } else {
        console.error('로그아웃 실패:', result.error);
        setAlertModal({
          isOpen: true,
          title: '오류',
          message: '로그아웃에 실패했습니다.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      setAlertModal({
        isOpen: true,
        title: '오류',
        message: '로그아웃 중 오류가 발생했습니다.',
        type: 'error',
      });
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#F1F1F1]">
      <Nav variant="default" className="bg-white sm:px-0" />
      <MypageContainer activeTab={activeTab}>
        <div className="flex justify-center w-full">
          <div className="w-full max-w-4xl bg-white rounded-lg p-6 md:p-10 flex flex-col items-center gap-6">
            <h2 className="text-1.5 md:text-2.25 font-500 mb-2 text-left w-full">
              간편정보관리
            </h2>
            <div className="space-y-4 md:space-y-6 w-full flex flex-col items-center px-4 md:px-0">
              <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <div className="text-0.75 text-gray-500">아이디</div>
                  <p className="text-1 font-500">{user?.username || '-'}</p>
                  <div className="border-b border-gray-200" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-0.75 text-gray-500">이메일정보</div>
                  <p className="text-1 font-500">
                    {user?.email || '이메일 없음'}
                  </p>
                  <div className="border-b border-gray-200" />
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 max-w-3xl mx-auto w-full flex flex-col items-center justify-center">
                <div className="w-full flex flex-col items-center gap-4">
                  <button
                    className="flex flex-col gap-2 items-center justify-center w-full max-w-[28rem] text-0.875 md:text-1 font-500 text-black py-3 border border-solid border-gray-3 rounded-lg mx-auto mb-4 md:mb-6"
                    onClick={handleAddProfile}
                  >
                    <div>+</div>
                    <div>간편정보 추가하기</div>
                  </button>

                  {loading ? (
                    <div className="w-full flex justify-center">
                      <div className="w-full max-w-[28rem] md:max-w-[56rem]">
                        <UserInfoSkeleton />
                      </div>
                    </div>
                  ) : currentItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 w-full max-w-[28rem] md:max-w-[56rem]">
                      등록된 간편정보가 없습니다.
                    </div>
                  ) : (
                    <div className="w-full flex justify-center">
                      <div className="grid w-full max-w-[88rem] md:max-w-[68rem] gap-5 grid-cols-1 md:grid-cols-2 items-stretch justify-items-stretch gap-4">
                        {currentItems.map((profile) => {
                          console.log('🔍 렌더링할 프로필:', {
                            id: profile.id,
                            title: profile.profile_title,
                            is_public_institution:
                              profile.is_public_institution,
                            is_company: profile.is_company,
                          });

                          return (
                            <div
                              key={profile.id}
                              className="border border-solid border-gray-3 rounded-lg px-3 md:px-4 py-4 md:py-8 flex flex-col items-center text-center gap-3 w-full h-full"
                            >
                              <div className="font-500 text-gray-2 flex flex-col gap-2 items-center">
                                <div className="flex flex-wrap gap-2 justify-center text-xs font-semibold">
                                  {profile.is_default && (
                                    <span className="border border-blue-200 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                      기본
                                    </span>
                                  )}
                                  {profile.is_phone_verified && (
                                    <span className="border border-green-200 bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                      인증완료
                                    </span>
                                  )}
                                  {profile.is_public_institution && (
                                    <span className="border border-green-200 bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                      행정용
                                    </span>
                                  )}
                                  {profile.is_company && (
                                    <span className="border border-orange-200 bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                                      기업용
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                                      profile.is_approved
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-red-500 bg-red-50 text-red-600'
                                    }`}
                                  >
                                    <span className="w-3 h-3 flex items-center justify-center rounded-full border text-[10px] leading-none">
                                      {profile.is_approved ? '✓' : ' '}
                                    </span>
                                    {profile.is_approved
                                      ? '승인됨'
                                      : '승인대기'}
                                  </span>
                                </div>
                                <div className="text-1 md:text-1.25">
                                  {profile.profile_title}
                                </div>
                              </div>
                              <div className="text-0.875 md:text-1">
                                {profile.contact_person_name}
                              </div>
                              <div className="text-0.875 md:text-1">
                                {profile.phone}
                              </div>
                              <div className="text-0.875 md:text-1">
                                {profile.email}
                              </div>
                              {profile.company_name && (
                                <div className="text-0.875 md:text-1 text-gray-500">
                                  {profile.company_name}
                                </div>
                              )}
                              <div className="flex gap-2 mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="bg-gray-4"
                                  onClick={() => handleEditProfile(profile)}
                                >
                                  수정
                                </Button>
                                {!profile.is_default && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="bg-red-100 text-red-600"
                                    onClick={() =>
                                      handleDeleteProfile(profile.id)
                                    }
                                  >
                                    삭제
                                  </Button>
                                )}
                              </div>
                              {/* {isNicknameModalOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] px-4">
                                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                    <div className="text-xl font-semibold mb-4">
                                      닉네임 변경
                                    </div>
                                    <label className="text-sm text-gray-600 mb-1 block">
                                      새 닉네임을 입력해주세요.
                                    </label>
                                    <input
                                      className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                                      value={nicknameInput}
                                      onChange={(e) =>
                                        setNicknameInput(e.target.value)
                                      }
                                      placeholder="닉네임을 입력하세요"
                                    />
                                    {nicknameError && (
                                      <p className="text-sm text-red-500 mb-2">
                                        {nicknameError}
                                      </p>
                                    )}
                                    <div className="flex justify-end gap-3 mt-4">
                                      <Button
                                        size="md"
                                        variant="outlinedGray"
                                        onClick={() =>
                                          setIsNicknameModalOpen(false)
                                        }
                                        disabled={isUpdatingNickname}
                                        className="px-4"
                                      >
                                        취소
                                      </Button>
                                      <Button
                                        size="md"
                                        variant="filledBlack"
                                        onClick={handleNicknameSave}
                                        disabled={isUpdatingNickname}
                                        className="px-4"
                                      >
                                        {isUpdatingNickname
                                          ? '저장 중…'
                                          : '저장'}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )} */}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 md:gap-4 text-gray-500 mt-4">
                      <div className="flex gap-2 md:gap-4 text-1 md:text-1.25 items-center justify-center">
                        {Array.from({ length: totalPages }, (_, idx) => (
                          <button
                            key={idx}
                            onClick={() => handlePageChange(idx + 1)}
                            className={`border-none text-1 md:text-1.25 font-500 ${
                              currentPage === idx + 1
                                ? 'text-black'
                                : 'text-gray-5'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                      {currentPage < totalPages && (
                        <Image
                          src="/svg/arrow-right.svg"
                          alt="arrow-right"
                          width={13}
                          height={13}
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="cursor-pointer"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex   md:flex-row gap-3 md:gap-4 justify-center ">
              <Button
                variant="outlineGray"
                size="md"
                className="w-[10rem]"
                onClick={() => console.log('비번변경')}
              >
                비밀번호 변경하기
              </Button>
              <Button
                variant="outlineGray"
                size="md"
                className="w-[10rem]"
                onClick={handleLogout}
              >
                로그아웃
              </Button>
            </div>

            <div className="text-center mt-4 md:mt-6">
              <button className="text-0.875 md:text-1 text-gray-500 border-none">
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      </MypageContainer>

      <UserProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileToEdit={profileToEdit}
        // NOTE: UserProfileModal에서 mode='edit'는 장바구니(선택) 모드로 사용 중.
        // 마이페이지(생성/수정 폼)는 mode='create'로 유지하고, profileToEdit 유무로 수정/생성을 구분한다.
        mode="create"
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </main>
  );
}
