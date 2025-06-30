'use client';

import { useState, useEffect } from 'react';
import Nav from '../../../components/layouts/nav';
import { useAuth } from '@/src/contexts/authContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/button/button';
import Image from 'next/image';
import Link from 'next/link';
import MypageContainer from '@/src/components/mypageContainer';
import UserProfileModal from '@/src/components/modal/UserProfileModal';

interface UserProfile {
  id: string;
  profile_title: string;
  company_name?: string;
  business_registration_number?: string;
  phone: string;
  email: string;
  contact_person_name: string;
  fax_number?: string;
  is_default: boolean;
  created_at: string;
}

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
  const [activeTab, setActiveTab] = useState('간편정보관리');
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
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

  const tabs = [
    // { name: '마이페이지', href: '/mypage' },
    { name: '주문내역', href: '/mypage/orders' },
    { name: '1:1상담', href: '/mypage/customer-service' },
    { name: '간편정보관리', href: '/mypage/info' },
    { name: '로그아웃', href: '/' },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // 프로필 데이터 가져오기
  const fetchProfiles = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/user-profiles?userId=${user.id}`);
      const result = await response.json();

      if (result.success) {
        setProfiles(result.data);
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
      <MypageContainer
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        <div className="flex flex-col sm:items-start">
          <Link href="/mypage" className="md:hidden lg:hidden sm:inline">
            <Image
              src="/svg/arrow-left.svg"
              alt="orders"
              width={20}
              height={20}
              className="w-[1.5rem] h-[1.5rem]"
            />
          </Link>
          <h2 className="text-1.5 md:text-2.25 font-500 mb-4 md:mb-8 border-b-solid border-gray-3 pb-4 md:pb-8 w-full">
            간편정보관리
          </h2>
          <div className="space-y-4 md:space-y-6 max-w-2xl w-full">
            <div className="flex flex-col gap-3 md:gap-[1.25rem] bg-white p-4 md:p-6 rounded-lg">
              <div className="">
                <div className="text-0.875 text-gray-500 mb-2 border border-b-solid border-gray-3 pb-2">
                  닉네임
                </div>
                <div className="flex items-center sm:justify-between">
                  <p className="text-0.875 md:text-1 font-500 w-full md:w-[16rem]">
                    {user?.username || '닉네임'}
                  </p>
                  <Button variant="ghost" size="sm" className="bg-gray-4">
                    수정
                  </Button>
                </div>
              </div>
              <div className="">
                <div className="text-0.875 text-gray-500 mb-2 border border-b-solid border-gray-3 pb-2">
                  이메일정보
                </div>
                <p className="text-0.875 md:text-1 font-500">
                  {user?.email || '이메일 없음'}
                </p>
              </div>
              <div>
                <p className="text-0.875 text-gray-500 mb-2 border border-b-solid border-gray-3 pb-2">
                  사업자정보
                </p>
                <div className="flex items-center sm:justify-between">
                  <div className="text-0.875 md:text-1 font-500 text-[#636363] underline underline-offset-4 cursor-pointer">
                    <div className="w-full md:w-[16rem]">첨부파일이름</div>
                  </div>
                  <Button variant="ghost" size="sm" className="bg-gray-4">
                    수정
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg">
              <button
                className="flex flex-col gap-2 items-center justify-center w-full mb-4 md:mb-6 text-0.875 md:text-1 font-500 text-black py-3 border border-solid border-gray-3 rounded-lg"
                onClick={handleAddProfile}
              >
                <div>+</div>
                <div>간편정보 추가하기</div>
              </button>

              {loading ? (
                <div className="text-center py-8">로딩 중...</div>
              ) : currentItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  등록된 간편정보가 없습니다.
                </div>
              ) : (
                currentItems.map((profile) => (
                  <div
                    key={profile.id}
                    className="border border-solid border-gray-3 rounded-lg px-3 md:px-4 py-4 md:py-8 mb-3 md:mb-4 flex flex-col md:flex-row justify-between items-start gap-3 md:gap-0"
                  >
                    <div className="font-500 text-gray-2 flex flex-col gap-1 md:gap-2">
                      <div className="text-1 md:text-1.25 mb-1 flex items-center gap-2">
                        {profile.profile_title}
                        {profile.is_default && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            기본
                          </span>
                        )}
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
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
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
                          onClick={() => handleDeleteProfile(profile.id)}
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 md:gap-4 text-gray-500 mt-4">
                  <div className="flex gap-2 md:gap-4 text-1 md:text-1.25 items-center justify-center">
                    {Array.from({ length: totalPages }, (_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePageChange(idx + 1)}
                        className={`border-none text-1 md:text-1.25 font-500 ${
                          currentPage === idx + 1 ? 'text-black' : 'text-gray-5'
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
