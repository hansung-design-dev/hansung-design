'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ModalContainer from './ModalContainer';
import { Button } from '../button/button';
import { useAuth } from '@/src/contexts/authContext';
import { useProfile } from '@/src/contexts/profileContext';
import Image from 'next/image';
import { formatPhoneInput } from '@/src/lib/utils';

export interface UserProfile {
  id: string;
  profile_title: string;
  company_name?: string;
  business_registration_file?: string;
  phone: string;
  email: string;
  contact_person_name: string;
  fax_number?: string;
  is_default: boolean;
  is_public_institution?: boolean;
  is_company?: boolean;
  created_at: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileToEdit?: UserProfile | null; // 수정할 프로필 정보
  mode?: 'edit' | 'create'; // 'edit': 간편정보 수정 모드, 'create': 간편정보 추가 모드
  className?: string; // 커스텀 클래스
  onConfirm?: (profileData: {
    profile_title: string;
    company_name: string;
    business_registration_file: string;
    phone: string;
    email: string;
    contact_person_name: string;
    fax_number: string;
    is_default: boolean;
    is_public_institution: boolean;
    is_company: boolean;
    profile_id?: string; // 선택한 프로필 ID 추가
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

// 결제 완료 모달 컴포넌트
function PaymentSuccessModal({
  isOpen,
  onClose,
  orderNumber,
  totalAmount,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  totalAmount: number;
}) {
  const router = useRouter();

  const handleGoToOrders = () => {
    router.push('/mypage/orders');
    onClose();
  };

  const handleGoToHome = () => {
    router.push('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h3 className="text-2xl font-bold mb-4 text-green-600">
            결제가 완료되었습니다!
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-600 mb-2">주문번호</p>
            <p className="text-lg font-semibold text-gray-800">{orderNumber}</p>
            <p className="text-gray-600 mt-2 mb-1">결제금액</p>
            <p className="text-xl font-bold text-green-600">
              {totalAmount.toLocaleString()}원
            </p>
          </div>
          <p className="text-gray-600 mb-6">
            주문이 성공적으로 완료되었습니다.
            <br />
            주문 내역에서 시안 업로드 및 진행 상황을 확인하실 수 있습니다.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              size="md"
              variant="filledBlack"
              onClick={handleGoToOrders}
              className="w-full"
            >
              주문 내역 보기
            </Button>
            <Button
              size="md"
              variant="outline"
              onClick={handleGoToHome}
              className="w-full"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PaymentSuccessModal };

export default function UserProfileModal({
  isOpen,
  onClose,
  profileToEdit,
  mode = 'create',
  className = '',
  onConfirm,
}: UserProfileModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    profile_title: '',
    company_name: '',
    business_registration_file: '',
    phone: '',
    email: '',
    contact_person_name: '',
    fax_number: '',
    is_default: false,
    is_public_institution: false,
    is_company: false,
  });

  const [fileName, setFileName] = useState<string>('');
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
        // 데이터베이스에 필드가 없을 경우를 대비해 기본값 설정
        const profilesWithDefaults = result.data.map(
          (profile: UserProfile) => ({
            ...profile,
            is_public_institution: profile.is_public_institution ?? false,
            is_company: profile.is_company ?? false,
          })
        );
        setUserProfiles(profilesWithDefaults);
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
        business_registration_file:
          profileToEdit.business_registration_file || '',
        phone: profileToEdit.phone || '',
        email: profileToEdit.email || '',
        contact_person_name: profileToEdit.contact_person_name || '',
        fax_number: profileToEdit.fax_number || '',
        is_default: profileToEdit.is_default || false,
        is_public_institution: profileToEdit.is_public_institution || false,
        is_company: profileToEdit.is_company || false,
      });
      setSelectedProfileId(profileToEdit.id);
      // 기존 파일명 설정
      if (profileToEdit.business_registration_file) {
        setFileName(profileToEdit.business_registration_file);
      }
    } else {
      // 새 프로필 생성 시 기본값 설정
      setFormData({
        profile_title: '',
        company_name: '',
        business_registration_file: '',
        phone: user?.phone || '',
        email: user?.email || '',
        contact_person_name: user?.name || '',
        fax_number: '',
        is_default: false,
        is_public_institution: false,
        is_company: false,
      });
      setSelectedProfileId(null);
      setFileName('');
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
    // 전화번호는 입력 시 자동 포맷
    if (field === 'phone' && typeof value === 'string') {
      const formatted = formatPhoneInput(value);
      setFormData((prev) => ({ ...prev, phone: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    // 공공기관/기업 체크박스 변경 시 ProfileContext 업데이트
    if (
      profileToEdit &&
      (field === 'is_public_institution' || field === 'is_company')
    ) {
      updateProfile(profileToEdit.id, { [field]: value });
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 타입 검증
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
      ];
      if (!allowedTypes.includes(file.type)) {
        setAlertModal({
          isOpen: true,
          title: '파일 형식 오류',
          message: 'PDF, JPEG, JPG, PNG 파일만 업로드 가능합니다.',
          type: 'error',
          onConfirm: () => {},
        });
        return;
      }

      // 파일 크기 검증 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        setAlertModal({
          isOpen: true,
          title: '파일 크기 오류',
          message: '파일 크기는 10MB 이하여야 합니다.',
          type: 'error',
          onConfirm: () => {},
        });
        return;
      }

      try {
        // 파일 업로드
        const formDataFile = new FormData();
        formDataFile.append('file', file);
        formDataFile.append('userId', user?.id || '');

        const uploadResponse = await fetch(
          '/api/upload-business-registration',
          {
            method: 'POST',
            body: formDataFile,
          }
        );

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success) {
          setFileName(file.name);
          setFormData((prev) => ({
            ...prev,
            business_registration_file: uploadResult.filePath,
          }));
        } else {
          setAlertModal({
            isOpen: true,
            title: '파일 업로드 오류',
            message: uploadResult.error || '파일 업로드에 실패했습니다.',
            type: 'error',
            onConfirm: () => {},
          });
        }
      } catch (error) {
        console.error('파일 업로드 오류:', error);
        setAlertModal({
          isOpen: true,
          title: '파일 업로드 오류',
          message: '파일 업로드 중 오류가 발생했습니다.',
          type: 'error',
          onConfirm: () => {},
        });
      }
    }
  };

  const handleFileRemove = () => {
    setFileName('');
    setFormData((prev) => ({ ...prev, business_registration_file: '' }));
  };

  const handleDownloadFile = async (filePath: string, userId: string) => {
    try {
      const response = await fetch(
        `/api/download-business-registration?filePath=${encodeURIComponent(
          filePath
        )}&userId=${userId}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filePath.split('/').pop() || 'business-registration';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('파일 다운로드 실패');
        alert('파일 다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
      alert('파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleProfileSelect = (profile: UserProfile) => {
    setFormData({
      profile_title: profile.profile_title || '',
      company_name: profile.company_name || '',
      business_registration_file: profile.business_registration_file || '',
      phone: profile.phone || '',
      email: profile.email || '',
      contact_person_name: profile.contact_person_name || '',
      fax_number: profile.fax_number || '',
      is_default: profile.is_default || false,
      is_public_institution: profile.is_public_institution || false,
      is_company: profile.is_company || false,
    });
    setSelectedProfileId(profile.id);
    setIsDropdownOpen(false);
    // 파일명 설정
    if (profile.business_registration_file) {
      setFileName(profile.business_registration_file);
    } else {
      setFileName('');
    }
  };

  const handleDropdownToggle = () => {
    if (userProfiles.length > 0) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handlePhoneVerification = () => {
    setAlertModal({
      isOpen: true,
      title: '나이스 인증 준비 중',
      message:
        '나이스 휴대폰 인증은 곧 도입될 예정입니다. 현재는 번호를 입력한 뒤 프로필을 저장해주세요.',
      type: 'info',
      onConfirm: () => {},
    });
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
            // ProfileContext 업데이트
            if (profileToEdit && result.data) {
              updateProfile(profileToEdit.id, result.data);
            }
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
      // 선택한 프로필 ID 포함 (selectedProfileId가 있으면 사용, 없으면 formData만 전달)
      onConfirm({
        ...formData,
        profile_id: selectedProfileId || undefined, // 선택한 프로필 ID 추가
      });
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
                  className={`px-3 ${
                    className.includes('compact') ? 'py-2' : 'py-4'
                  } border-solid border-1 border-gray-300 rounded-lg cursor-pointer flex items-center justify-between ${
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
                        <div className="font-medium flex items-center gap-2">
                          {profile.profile_title}
                          {/* 사용자 유형 태그 */}
                          {profile.is_public_institution && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              행정용
                            </span>
                          )}
                          {profile.is_company && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              기업용
                            </span>
                          )}
                          {profile.is_default && (
                            <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              기본
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {profile.contact_person_name} • {profile.phone}
                        </div>
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
              className={`w-[80%] px-3 ${
                className.includes('compact') ? 'py-2' : 'py-4'
              } border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1`}
              placeholder="담당자명을 입력하세요"
            />
          </div>

          {/* 전화번호 */}
          <div className="flex gap-2 items-center">
            <label className="block text-1 text-gray-2 font-500 mb-2 w-29">
              전화번호<span className="text-red">*</span>
            </label>
            <div className="w-[80%] flex gap-2 items-center">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`flex-1 px-3 ${
                  className.includes('compact') ? 'py-2' : 'py-4'
                } border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1`}
                placeholder="010-1234-5678"
                maxLength={13}
                inputMode="numeric"
                autoComplete="tel"
              />
              <Button
                onClick={handlePhoneVerification}
                size="sm"
                variant="outlineGray"
                className="rounded-lg"
              >
                인증하기
              </Button>
            </div>
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
              className={`w-[80%] px-3 ${
                className.includes('compact') ? 'py-2' : 'py-4'
              } border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1`}
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
              className={`w-[80%] px-3 ${
                className.includes('compact') ? 'py-2' : 'py-4'
              } border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1`}
              placeholder="회사명을 입력하세요 (개인인 경우 비워두세요)"
            />
          </div>

          {/* 사업자등록증 첨부 */}
          <div className="flex gap-2 items-center">
            <label className="block text-1 text-gray-2 font-500 mb-2 w-29">
              사업자등록증
            </label>
            <div className="w-[80%] space-y-2">
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".pdf,.jpeg,.jpg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="business-registration-file"
                />
                <label
                  htmlFor="business-registration-file"
                  className={`px-4 ${
                    className.includes('compact') ? 'py-2' : 'py-3'
                  } bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-2`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  업로드하기
                </label>
                {fileName && (
                  <Button
                    onClick={handleFileRemove}
                    size="sm"
                    variant="outlinedGray"
                    className={`px-3 ${
                      className.includes('compact') ? 'py-2' : 'py-3'
                    }`}
                  >
                    삭제
                  </Button>
                )}
              </div>
              {fileName && (
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10,9 9,9 8,9" />
                      </svg>
                      <span className="text-sm text-blue-800">{fileName}</span>
                    </div>
                    {formData.business_registration_file &&
                      formData.business_registration_file.startsWith(
                        '/uploads/'
                      ) && (
                        <button
                          onClick={() =>
                            handleDownloadFile(
                              formData.business_registration_file,
                              user?.id || ''
                            )
                          }
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          다운로드
                        </button>
                      )}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500">
                PDF, JPEG, JPG, PNG 파일만 가능 (최대 10MB)
              </p>
            </div>
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
              className={`w-[80%] px-3 ${
                className.includes('compact') ? 'py-2' : 'py-4'
              } border-solid border-1 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-1`}
              placeholder="02-1234-5678 (선택사항)"
            />
          </div>

          {/* 공공/기업용 체크박스 - 마이페이지 모드에서만 표시 */}
          {mode !== 'edit' && (
            <div className="flex gap-2 items-center">
              <label className="block text-1 text-gray-2 font-500 mb-2 w-29">
                사용자 유형
              </label>
              <div className="w-[80%] space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_public_institution}
                    onChange={(e) =>
                      handleInputChange(
                        'is_public_institution',
                        e.target.checked
                      )
                    }
                    className="mr-2"
                  />
                  공공기관용 (행정가격 적용, 승인 필요)
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_company}
                    onChange={(e) =>
                      handleInputChange('is_company', e.target.checked)
                    }
                    className="mr-2"
                  />
                  기업용 (승인 필요, 일반가격)
                </label>
                <p className="text-xs text-gray-500">
                  개인용은 체크하지 않으시면 됩니다.
                </p>
              </div>
            </div>
          )}

          {/* 장바구니 모드에서 사용자 유형 표시 */}
          {mode === 'edit' &&
            (formData.is_public_institution || formData.is_company) && (
              <div className="flex gap-2 items-center">
                <label className="block text-1 text-gray-2 font-500 mb-2 w-29">
                  사용자 유형
                </label>
                <div className="w-[80%]">
                  <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-sm text-blue-800">
                      {formData.is_public_institution ? '공공기관용' : '기업용'}
                    </span>
                  </div>
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
