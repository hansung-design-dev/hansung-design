'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ModalContainer from './ModalContainer';
import { Button } from '../button/button';
import { useAuth } from '@/src/contexts/authContext';
import Image from 'next/image';

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

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileToEdit?: UserProfile | null; // 수정할 프로필 정보
  mode?: 'edit' | 'create'; // 'edit': 간편정보 수정 모드, 'create': 간편정보 추가 모드
  onConfirm?: (profileData: {
    profile_title: string;
    company_name: string;
    business_registration_number: string;
    phone: string;
    email: string;
    contact_person_name: string;
    fax_number: string;
    is_default: boolean;
  }) => void; // 장바구니에서 확인 버튼 클릭 시 호출
}

// 알림 모달 컴포넌트
function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  onConfirm?: () => void;
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

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
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
            onClick={handleConfirm}
            className="w-full"
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function UserProfileModal({
  isOpen,
  onClose,
  profileToEdit,
  mode = 'create',
  onConfirm,
}: UserProfileModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    profile_title: '',
    company_name: '',
    business_registration_number: '',
    phone: '',
    email: '',
    contact_person_name: '',
    fax_number: '',
    is_default: false,
  });
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null
  );
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'error' | 'warning',
    onConfirm: () => {},
  });

  // 사용자의 프로필 목록 가져오기
  const fetchUserProfiles = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/user-profiles?userId=${user.id}`);
      const result = await response.json();

      if (result.success) {
        setUserProfiles(result.data);
      }
    } catch (error) {
      console.error('프로필 목록 조회 에러:', error);
    }
  };

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (profileToEdit) {
      setFormData({
        profile_title: profileToEdit.profile_title || '',
        company_name: profileToEdit.company_name || '',
        business_registration_number:
          profileToEdit.business_registration_number || '',
        phone: profileToEdit.phone || '',
        email: profileToEdit.email || '',
        contact_person_name: profileToEdit.contact_person_name || '',
        fax_number: profileToEdit.fax_number || '',
        is_default: profileToEdit.is_default || false,
      });
      setSelectedProfileId(profileToEdit.id);
    } else {
      // 새 프로필 생성 시 기본값 설정
      setFormData({
        profile_title: '',
        company_name: '',
        business_registration_number: '',
        phone: user?.phone || '',
        email: user?.email || '',
        contact_person_name: user?.name || '',
        fax_number: '',
        is_default: false,
      });
      setSelectedProfileId(null);
    }
  }, [profileToEdit, user]);

  // 모달이 열릴 때 프로필 목록 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchUserProfiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSelect = (profile: UserProfile) => {
    setFormData({
      profile_title: profile.profile_title || '',
      company_name: profile.company_name || '',
      business_registration_number: profile.business_registration_number || '',
      phone: profile.phone || '',
      email: profile.email || '',
      contact_person_name: profile.contact_person_name || '',
      fax_number: profile.fax_number || '',
      is_default: profile.is_default || false,
    });
    setSelectedProfileId(profile.id);
    setIsDropdownOpen(false);
  };

  const handleDropdownToggle = () => {
    if (userProfiles.length > 0) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        setAlertModal({
          isOpen: true,
          title: '알림',
          message: '로그인이 필요합니다.',
          type: 'warning',
          onConfirm: () => {},
        });
        return;
      }

      const requestData = {
        user_auth_id: user.id,
        ...formData,
      };

      let response;
      if (profileToEdit) {
        // 수정
        response = await fetch(`/api/user-profiles/${profileToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        });
      } else {
        // 생성
        response = await fetch('/api/user-profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        });
      }

      const result = await response.json();

      if (result.success) {
        setAlertModal({
          isOpen: true,
          title: '완료',
          message: profileToEdit
            ? '프로필이 수정되었습니다.'
            : '프로필이 생성되었습니다.',
          type: 'success',
          onConfirm: () => {
            // 페이지 새로고침하여 프로필 목록 업데이트
            window.location.reload();
          },
        });
        // 성공 모달을 띄운 후에 모달을 닫음
        onClose();
      } else {
        setAlertModal({
          isOpen: true,
          title: '오류',
          message: result.error || '오류가 발생했습니다.',
          type: 'error',
          onConfirm: () => {},
        });
      }
    } catch (error) {
      console.error('프로필 저장 에러:', error);
      setAlertModal({
        isOpen: true,
        title: '오류',
        message: '저장 중 오류가 발생했습니다.',
        type: 'error',
        onConfirm: () => {},
      });
    }
  };

  const handleConfirm = () => {
    // 장바구니에서 확인 버튼 클릭 시
    if (onConfirm) {
      onConfirm(formData);
      onClose();
    }
  };

  const handleGoToProfilePage = () => {
    // 마이페이지 간편정보 페이지로 이동
    onClose();
    router.push('/mypage/info');
  };

  const getModalTitle = () => {
    if (mode === 'edit') {
      return '간편정보 수정하기';
    }
    return profileToEdit ? '간편정보 수정하기' : '간편정보 추가하기';
  };

  const getSubmitButtonText = () => {
    if (mode === 'edit') {
      return '확인';
    }
    return profileToEdit ? '수정' : '저장';
  };

  return (
    <>
      <ModalContainer isOpen={isOpen} onClose={onClose} title={getModalTitle()}>
        <div className="space-y-6">
          {/* 프로필 제목 - create 모드에서는 input, edit 모드에서는 드롭다운 */}
          <div className="flex gap-2 items-center">
            <label className="block text-1 text-gray-2 font-500 mb-2 w-30">
              프로필 제목<span className="text-red">*</span>
            </label>
            {mode === 'create' ? (
              // 마이페이지 모드: input 필드
              <input
                type="text"
                value={formData.profile_title}
                onChange={(e) =>
                  handleInputChange('profile_title', e.target.value)
                }
                className="w-[80%] px-3 py-4 border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
                placeholder="예: 기본 프로필, 한성 디자인팀, 회사A"
              />
            ) : (
              // 장바구니 모드: 드롭다운
              <div className="relative w-[80%]">
                <div
                  className={`px-3 py-4 border-solid border-1 border-gray-300 rounded-lg cursor-pointer flex items-center justify-between ${
                    userProfiles.length > 0
                      ? 'hover:border-gray-400'
                      : 'bg-gray-100 cursor-not-allowed'
                  }`}
                  onClick={handleDropdownToggle}
                >
                  <span
                    className={
                      formData.profile_title ? 'text-black' : 'text-gray-500'
                    }
                  >
                    {formData.profile_title || '프로필을 선택하세요'}
                  </span>
                  {userProfiles.length > 0 && (
                    <Image
                      src={
                        isDropdownOpen
                          ? '/svg/arrow-up.svg'
                          : '/svg/arrow-down.svg'
                      }
                      alt="dropdown"
                      width={16}
                      height={16}
                      className="ml-2"
                    />
                  )}
                </div>

                {/* 드롭다운 메뉴 */}
                {isDropdownOpen && userProfiles.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {userProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className={`px-3 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                          selectedProfileId === profile.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleProfileSelect(profile)}
                      >
                        <div className="font-medium">
                          {profile.profile_title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {profile.contact_person_name} • {profile.phone}
                        </div>
                        {profile.is_default && (
                          <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            기본
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 담당자명 */}
          <div className="flex gap-2 items-center">
            <label className="block text-1 text-gray-2 font-500 mb-2 w-30">
              담당자명<span className="text-red">*</span>
            </label>
            <input
              type="text"
              value={formData.contact_person_name}
              onChange={(e) =>
                handleInputChange('contact_person_name', e.target.value)
              }
              className="w-[80%] px-3 py-4 border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
              placeholder="담당자명을 입력하세요"
            />
          </div>

          {/* 전화번호 */}
          <div className="flex gap-2 items-center">
            <label className="block text-1 text-gray-2 font-500 mb-2 w-29">
              전화번호<span className="text-red">*</span>
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-[80%] px-3 py-4 border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
              placeholder="010-1234-5678"
            />
          </div>

          {/* 이메일 */}
          <div className="flex gap-2 items-center">
            <label className="block text-1 text-gray-2 font-500 mb-2 w-30">
              이메일<span className="text-red">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-[80%] px-3 py-4 border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
              placeholder="이메일을 입력하세요"
            />
          </div>

          {/* 회사명 */}
          <div className="flex gap-2 items-center">
            <label className="block text-1 text-gray-2 font-500 mb-2 w-30">
              회사명
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) =>
                handleInputChange('company_name', e.target.value)
              }
              className="w-[80%] px-3 py-4 border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
              placeholder="회사명을 입력하세요 (개인인 경우 비워두세요)"
            />
          </div>

          {/* 사업자등록번호 */}
          <div className="flex gap-2 items-center">
            <label className="block text-1 text-gray-2 font-500 mb-2 w-29">
              사업자등록번호
            </label>
            <input
              type="text"
              value={formData.business_registration_number}
              onChange={(e) =>
                handleInputChange(
                  'business_registration_number',
                  e.target.value
                )
              }
              className="w-[80%] px-3 py-4 border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
              placeholder="123-45-67890 (개인인 경우 비워두세요)"
            />
          </div>

          {/* 팩스번호 */}
          <div className="flex gap-2 items-center">
            <label className="block text-1 text-gray-2 font-500 mb-2 w-29">
              팩스번호
            </label>
            <input
              type="text"
              value={formData.fax_number}
              onChange={(e) => handleInputChange('fax_number', e.target.value)}
              className="w-[80%] px-3 py-4 border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1"
              placeholder="02-1234-5678 (선택사항)"
            />
          </div>

          {/* 기본 프로필 설정 - edit 모드에서만 표시 */}
          {mode === 'edit' && (
            <div className="flex gap-2 items-center">
              <label className="block text-1 text-gray-2 font-500 mb-2 w-29">
                기본 프로필
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) =>
                      handleInputChange('is_default', e.target.checked)
                    }
                    className="mr-2"
                  />
                  기본 프로필로 설정
                </label>
              </div>
            </div>
          )}

          {/* 버튼들 */}
          <div className="flex justify-center gap-4 pt-4">
            {mode === 'edit' ? (
              // 장바구니 모드: 확인 버튼과 간편정보 수정하기 버튼
              <>
                <Button
                  onClick={handleConfirm}
                  size="lg"
                  variant="filledBlack"
                  className="text-white rounded-lg hover:bg-gray-2 lg:text-1 lg:font-300"
                >
                  확인
                </Button>
                <Button
                  onClick={handleGoToProfilePage}
                  size="lg"
                  variant="filledBlack"
                  className="text-white rounded-lg hover:bg-gray-2 lg:text-1 lg:font-300"
                >
                  간편정보 수정하기
                </Button>
              </>
            ) : (
              // 마이페이지 모드: 저장/수정 버튼과 취소 버튼
              <>
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  variant="filledBlack"
                  className="text-white rounded-lg hover:bg-gray-2 lg:text-1 lg:font-300"
                >
                  {getSubmitButtonText()}
                </Button>
                <Button
                  onClick={onClose}
                  size="lg"
                  variant="outlinedGray"
                  className="rounded-lg lg:text-1 lg:font-300"
                >
                  취소
                </Button>
              </>
            )}
          </div>
        </div>
      </ModalContainer>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />
    </>
  );
}
