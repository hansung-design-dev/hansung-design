'use client';
import Image from 'next/image';
import { Button } from '@/src/components/button/button';
import { useState } from 'react';
import { getModalContent } from './modalContent';
import { useAuth } from '@/src/contexts/authContext';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    collection: false,
    thirdParty: false,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState('');

  // 본인인증 상태
  const [isVerified, setIsVerified] = useState(false);

  // 입력 필드 상태
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  // 유효성 검사 상태
  const [validation, setValidation] = useState({
    name: { isValid: false, message: '' },
    id: { isValid: false, message: '' },
    email: { isValid: false, message: '' },
    password: { isValid: false, message: '' },
    passwordConfirm: { isValid: false, message: '' },
  });

  // API 연동 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);

  // 비밀번호 보기/숨기기 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  const handleAgreementChange = (key: keyof typeof agreements) => {
    if (key === 'all') {
      const newValue = !agreements.all;
      setAgreements({
        all: newValue,
        terms: newValue,
        privacy: newValue,
        collection: newValue,
        thirdParty: newValue,
      });
    } else {
      const newAgreements = { ...agreements, [key]: !agreements[key] };
      const allChecked =
        newAgreements.terms &&
        newAgreements.privacy &&
        newAgreements.collection &&
        newAgreements.thirdParty;
      setAgreements({ ...newAgreements, all: allChecked });
    }
  };

  const openModal = (type: string) => {
    setCurrentModal(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentModal('');
  };

  // 이름 유효성 검사 (한글, 영문)
  const validateName = (name: string) => {
    const nameRegex = /^[가-힣a-zA-Z\s]+$/;
    if (!name) {
      return { isValid: false, message: '이름을 입력해주세요.' };
    }
    if (!nameRegex.test(name)) {
      return { isValid: false, message: '한글 또는 영문만 입력 가능합니다.' };
    }

    // 한글과 영문 글자 수 확인
    const koreanChars = name.match(/[가-힣]/g) || [];
    const englishChars = name.match(/[a-zA-Z]/g) || [];

    if (koreanChars.length > 0 && englishChars.length > 0) {
      // 한글과 영문이 혼합된 경우
      if (koreanChars.length < 2 && englishChars.length < 3) {
        return {
          isValid: false,
          message: '한글은 2글자 이상, 영문은 3글자 이상 입력해주세요.',
        };
      }
    } else if (koreanChars.length > 0) {
      // 한글만 있는 경우
      if (koreanChars.length < 2) {
        return { isValid: false, message: '한글은 2글자 이상 입력해주세요.' };
      }
    } else if (englishChars.length > 0) {
      // 영문만 있는 경우
      if (englishChars.length < 3) {
        return { isValid: false, message: '영문은 3글자 이상 입력해주세요.' };
      }
    }

    return { isValid: true, message: '' };
  };

  // 아이디 유효성 검사 (영문, 숫자, -, _ 조합, 최소 4글자)
  const validateId = (id: string) => {
    const idRegex = /^[a-zA-Z0-9_-]{4,}$/;
    if (!id) {
      return { isValid: false, message: '아이디를 입력해주세요.' };
    }
    if (!idRegex.test(id)) {
      return {
        isValid: false,
        message: '영문, 숫자, -, _ 조합으로 최소 4글자 이상 입력해주세요.',
      };
    }
    return { isValid: true, message: '' };
  };

  // 이메일 유효성 검사
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return { isValid: false, message: '이메일을 입력해주세요.' };
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, message: '올바른 이메일 형식을 입력해주세요.' };
    }
    return { isValid: true, message: '' };
  };

  // 비밀번호 유효성 검사 (최소 6글자, 영문대소문자/숫자/특수문자 조합)
  const validatePassword = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!password) {
      return { isValid: false, message: '비밀번호를 입력해주세요.' };
    }
    if (!passwordRegex.test(password)) {
      return {
        isValid: false,
        message:
          '영문 대소문자, 숫자, 특수문자를 포함하여 최소 6글자 이상 입력해주세요.',
      };
    }
    return { isValid: true, message: '' };
  };

  // 비밀번호 확인 유효성 검사
  const validatePasswordConfirm = (passwordConfirm: string) => {
    if (!passwordConfirm) {
      return { isValid: false, message: '비밀번호를 한 번 더 입력해주세요.' };
    }
    if (passwordConfirm !== formData.password) {
      return { isValid: false, message: '비밀번호가 일치하지 않습니다.' };
    }
    return { isValid: true, message: '' };
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 아이디가 변경되면 중복확인 상태 초기화
    if (field === 'id') {
      setUsernameChecked(false);
    }
  };

  // 입력 필드 포커스 아웃 핸들러
  const handleInputBlur = (field: keyof typeof formData, value: string) => {
    let validationResult: { isValid: boolean; message: string };
    switch (field) {
      case 'name':
        validationResult = validateName(value);
        break;
      case 'id':
        validationResult = validateId(value);
        break;
      case 'email':
        validationResult = validateEmail(value);
        break;
      case 'password':
        validationResult = validatePassword(value);
        setValidation((prev) => ({
          ...prev,
          password: validationResult,
          passwordConfirm: validatePasswordConfirm(formData.passwordConfirm),
        }));
        return;
      case 'passwordConfirm':
        validationResult = validatePasswordConfirm(value);
        break;
      default:
        return;
    }

    setValidation((prev) => ({ ...prev, [field]: validationResult }));
  };

  // 본인인증 핸들러
  const handleVerification = (type: 'ipin' | 'phone') => {
    // 실제 인증 로직은 여기에 구현
    console.log(`${type} 인증 시작`);

    // 임시로 인증 완료 처리 (실제로는 인증 API 호출)
    if (type === 'ipin') {
      // 아이핀 인증 시뮬레이션
      setTimeout(() => {
        setIsVerified(true);
        setError(''); // 성공 시 에러 메시지 초기화
      }, 1000);
    } else if (type === 'phone') {
      // 휴대폰 인증 시뮬레이션
      setTimeout(() => {
        setIsVerified(true);
        setError(''); // 성공 시 에러 메시지 초기화
      }, 1000);
    }
  };

  // 회원가입 가능 여부 확인
  const canSignup = () => {
    const allFieldsValid = Object.values(validation).every((v) => v.isValid);
    const allRequiredAgreements =
      agreements.terms &&
      agreements.privacy &&
      agreements.collection &&
      agreements.thirdParty;

    console.log('회원가입 조건 확인:', {
      allFieldsValid,
      allRequiredAgreements,
      isVerified,
      usernameChecked,
      agreements,
    });

    return (
      allFieldsValid && allRequiredAgreements && isVerified && usernameChecked
    );
  };

  // 중복확인 함수
  const handleUsernameCheck = async () => {
    if (!formData.id) {
      setError('아이디를 먼저 입력해주세요.');
      return;
    }

    // 아이디 유효성 검사
    const idValidation = validateId(formData.id);
    if (!idValidation.isValid) {
      setError(idValidation.message);
      return;
    }

    setUsernameCheckLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: formData.id }),
      });

      const data = await response.json();

      if (data.success) {
        setUsernameChecked(true);
        setError(''); // 성공 메시지는 validation 메시지로 표시
      } else {
        setError(data.error || '중복확인에 실패했습니다.');
        setUsernameChecked(false);
      }
    } catch {
      setError('중복확인 중 오류가 발생했습니다.');
      setUsernameChecked(false);
    } finally {
      setUsernameCheckLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!canSignup()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.id,
        agreements
      );

      if (result.success) {
        router.push('/signin'); // 회원가입 성공 시 로그인 페이지로 이동
      } else {
        setError(result.error || '회원가입에 실패했습니다.');
      }
    } catch {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 flex items-center justify-center bg-[#f5f5f5]">
      <div className="w-[27rem] flex flex-col items-center">
        <div className="text-2.265 font-600 mt-12 mb-2">회원가입</div>
        <div className="text-1-400 mb-8">
          회원가입에 필요한 정보를 입력해주세요.
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {/* 닉네임/성함 인풋 */}
        <div className="w-full mb-6">
          <div className="flex items-center h-[4rem] bg-white rounded">
            <Image
              src="/svg/login-password.svg"
              alt="이름"
              width={20}
              height={20}
              className="h-[1.25rem] w-[1.25rem] pl-2"
            />
            <input
              type="text"
              placeholder="  이름을 입력해주세요."
              className="flex-1 outline-none border-none font-200"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={(e) => handleInputBlur('name', e.target.value)}
            />
          </div>
          {validation.name.message && (
            <div className="text-blue-500 text-0.75 mt-2 ml-2">
              {validation.name.message}
            </div>
          )}
        </div>

        {/* 아이디 인풋 */}
        <div className="w-full mb-6">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center h-[4rem] bg-white rounded">
              <Image
                src="/svg/login-user.svg"
                alt="아이디"
                width={20}
                height={20}
                className="h-[1.25rem] w-[1.25rem] pl-2"
              />
              <input
                type="text"
                placeholder="  아이디를 입력해주세요."
                className="flex-1 outline-none border-none font-200"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                onBlur={(e) => handleInputBlur('id', e.target.value)}
              />
            </div>
            <Button
              size="sm"
              className="text-0-75-500 h-[4rem]"
              onClick={handleUsernameCheck}
              disabled={usernameCheckLoading || !formData.id}
            >
              {usernameCheckLoading ? '확인중...' : '중복확인'}
            </Button>
          </div>
          {validation.id.message && (
            <div className="text-blue-500 text-0.75 mt-2 ml-2">
              {validation.id.message}
            </div>
          )}
          {usernameChecked && !validation.id.message && (
            <div className="text-green-500 text-0.75 mt-2 ml-2">
              사용 가능한 아이디입니다.
            </div>
          )}
        </div>

        {/* 이메일 인풋 */}
        <div className="w-full mb-6">
          <div className="flex items-center h-[4rem] bg-white rounded">
            <Image
              src="/svg/login-password.svg"
              alt="이메일"
              width={20}
              height={20}
              className="h-[1.25rem] w-[1.25rem] pl-2"
            />
            <input
              type="email"
              placeholder="  이메일을 적어주세요."
              className="flex-1 outline-none border-none font-200"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={(e) => handleInputBlur('email', e.target.value)}
            />
          </div>
          {validation.email.message && (
            <div className="text-blue-500 text-0.75 mt-2 ml-2">
              {validation.email.message}
            </div>
          )}
        </div>

        {/* 비번 인풋 */}
        <div className="w-full mb-6">
          <div className="flex items-center h-[4rem] bg-white rounded">
            <Image
              src="/svg/login-password.svg"
              alt="비밀번호"
              width={20}
              height={20}
              className="h-[1.25rem] w-[1.25rem] pl-2"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="  비밀번호를 적어주세요."
              className="flex-1 outline-none border-none font-200"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={(e) => handleInputBlur('password', e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-3"
            >
              <Image
                src={showPassword ? '/svg/eye_off.svg' : '/svg/eye_on.svg'}
                alt={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                width={20}
                height={20}
                className="h-[1.25rem] w-[1.25rem]"
              />
            </button>
          </div>
          {validation.password.message && (
            <div className="text-blue-500 text-0.75 mt-2 ml-2">
              {validation.password.message}
            </div>
          )}
        </div>

        {/* 비번확인 인풋 */}
        <div className="w-full mb-6">
          <div className="flex items-center h-[4rem] bg-white rounded">
            <Image
              src="/svg/login-password.svg"
              alt="비밀번호"
              width={20}
              height={20}
              className="h-[1.25rem] w-[1.25rem] pl-2"
            />
            <input
              type={showPasswordConfirm ? 'text' : 'password'}
              placeholder="  비밀번호를 한 번 더 입력해주세요."
              className="flex-1 outline-none border-none font-200"
              value={formData.passwordConfirm}
              onChange={(e) =>
                handleInputChange('passwordConfirm', e.target.value)
              }
              onBlur={(e) => handleInputBlur('passwordConfirm', e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="px-3"
            >
              <Image
                src={
                  showPasswordConfirm ? '/svg/eye_off.svg' : '/svg/eye_on.svg'
                }
                alt={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
                width={20}
                height={20}
                className="h-[1.25rem] w-[1.25rem]"
              />
            </button>
          </div>
          {validation.passwordConfirm.message && (
            <div className="text-blue-500 text-0.75 mt-2 ml-2">
              {validation.passwordConfirm.message}
            </div>
          )}
        </div>

        {/* 약관 동의 섹션 */}
        <div className="w-full bg-white rounded p-0 mb-6">
          <div className="p-6">
            <div className="text-1.125 font-600 mb-4">약관 동의</div>

            {/* 전체 동의 */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <input
                type="checkbox"
                id="all"
                checked={agreements.all}
                onChange={() => handleAgreementChange('all')}
                className="w-5 h-5"
              />
              <label htmlFor="all" className="text-1 font-600 cursor-pointer">
                전체 동의
              </label>
            </div>

            {/* 개별 약관들 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreements.terms}
                  onChange={() => handleAgreementChange('terms')}
                  className="w-4 h-4"
                />
                <label
                  htmlFor="terms"
                  className="text-0-875 font-500 cursor-pointer flex-1"
                >
                  회원이용약관 <span className="">(필수)</span>
                </label>
                <button
                  className="text-blue-600 text-0-75 underline"
                  onClick={() => openModal('terms')}
                >
                  보기
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={agreements.privacy}
                  onChange={() => handleAgreementChange('privacy')}
                  className="w-4 h-4"
                />
                <label
                  htmlFor="privacy"
                  className="text-0-875 font-500 cursor-pointer flex-1"
                >
                  개인정보처리방침 <span className="">(필수)</span>
                </label>
                <button
                  className="text-blue-600 text-0-75 underline"
                  onClick={() => openModal('privacy')}
                >
                  보기
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="collection"
                  checked={agreements.collection}
                  onChange={() => handleAgreementChange('collection')}
                  className="w-4 h-4"
                />
                <label
                  htmlFor="collection"
                  className="text-0-875 font-500 cursor-pointer flex-1"
                >
                  개인정보 수집·이용 및 제공에 대한 동의{' '}
                  <span className="">(필수)</span>
                </label>
                <button
                  className="text-blue-600 text-0-75 underline"
                  onClick={() => openModal('collection')}
                >
                  보기
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="thirdParty"
                  checked={agreements.thirdParty}
                  onChange={() => handleAgreementChange('thirdParty')}
                  className="w-4 h-4"
                />
                <label
                  htmlFor="thirdParty"
                  className="text-0-875 font-500 cursor-pointer flex-1"
                >
                  개인정보의 수집 목적 내 제3자 제공 동의{' '}
                  <span className="">(필수)</span>
                </label>
                <button
                  className="text-blue-600 text-0-75 underline"
                  onClick={() => openModal('thirdParty')}
                >
                  보기
                </button>
              </div>
            </div>

            {/* 약관 동의 상태 표시 */}
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
              <div className="font-medium mb-2">회원가입 조건 확인:</div>
              <div className="space-y-1 text-xs">
                <div
                  className={`flex items-center gap-2 ${
                    Object.values(validation).every((v) => v.isValid)
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  <span>✓</span>
                  <span>
                    모든 필수 정보 입력:{' '}
                    {Object.values(validation).every((v) => v.isValid)
                      ? '완료'
                      : '미완료'}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    agreements.terms &&
                    agreements.privacy &&
                    agreements.collection &&
                    agreements.thirdParty
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  <span>✓</span>
                  <span>
                    약관 동의:{' '}
                    {agreements.terms &&
                    agreements.privacy &&
                    agreements.collection &&
                    agreements.thirdParty
                      ? '완료'
                      : '미완료'}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    isVerified ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <span>✓</span>
                  <span>본인인증: {isVerified ? '완료' : '미완료'}</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    usernameChecked ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <span>✓</span>
                  <span>
                    아이디 중복확인: {usernameChecked ? '완료' : '미완료'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 본인인증 섹션 */}
        <div className="w-full mb-6">
          <div className="flex gap-4">
            <button
              className={`flex-1 h-[3.5rem] text-white text-1 font-500 rounded transition-colors ${
                isVerified ? 'bg-green-600' : 'bg-black hover:bg-blue-700'
              }`}
              onClick={() => handleVerification('ipin')}
            >
              {isVerified ? '인증 완료' : '아이핀 인증'}
            </button>
            <button
              className={`flex-1 h-[3.5rem] text-white text-1 font-500 rounded transition-colors ${
                isVerified ? 'bg-green-600' : 'bg-black hover:bg-green-700'
              }`}
              onClick={() => handleVerification('phone')}
            >
              {isVerified ? '인증 완료' : '휴대폰 인증'}
            </button>
          </div>
        </div>

        {/* 회원가입 버튼 */}
        <button
          className={`w-full h-[4rem] text-white text-1.25 font-500 rounded ${
            canSignup() ? 'bg-black' : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!canSignup()}
          onClick={handleSignup}
        >
          {loading ? '회원가입 중...' : '회원가입'}
        </button>
      </div>

      {/* 약관 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-1.25 font-600">
                {getModalContent(currentModal).title}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                x
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap text-0-875 leading-relaxed">
                {getModalContent(currentModal).content}
              </pre>
            </div>
            <div className="flex justify-end p-6 border-t">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
