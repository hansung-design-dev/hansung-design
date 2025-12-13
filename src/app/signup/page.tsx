'use client';
import Image from 'next/image';
import { Button } from '@/src/components/button/button';
import { useEffect, useState, useRef } from 'react';
import { getModalContent } from './modalContent';
import { useAuth } from '@/src/contexts/authContext';
import { useRouter } from 'next/navigation';
import { formatPhoneInput, isValidPhoneFormatted } from '@/src/lib/utils';

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

  // 휴대폰 인증 상태
  const [lastVerifiedPhone, setLastVerifiedPhone] = useState('');
  const [phoneVerificationReference, setPhoneVerificationReference] =
    useState<string>('');

  // 입력 필드 상태
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    email: '',
    password: '',
    phone: '',
    passwordConfirm: '',
  });

  // 유효성 검사 상태
  const [validation, setValidation] = useState({
    name: { isValid: false, message: '' },
    id: { isValid: false, message: '' },
    email: { isValid: false, message: '' },
    password: { isValid: false, message: '' },
    passwordConfirm: { isValid: false, message: '' },
    phone: { isValid: false, message: '' },
  });

  // API 연동 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);

  // 비밀번호 보기/숨기기 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [standardPopupMessage, setStandardPopupMessage] = useState('');
  const [standardPopupError, setStandardPopupError] = useState('');
  const [standardPopupLoading, setStandardPopupLoading] = useState(false);
  const standardFormRef = useRef<HTMLFormElement | null>(null);

  const { signUp } = useAuth();
  const router = useRouter();
  const standardPopupAction =
    process.env.NEXT_PUBLIC_NICE_STANDARD_POPUP_ACTION ?? '';

  const isPhoneVerified =
    Boolean(phoneVerificationReference) && lastVerifiedPhone === formData.phone;

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

  // 휴대폰 번호 유효성 검사 (하이픈 포함 형식)
  const validatePhone = (phone: string) => {
    if (!phone) {
      return { isValid: false, message: '휴대폰 번호를 입력해주세요.' };
    }

    if (!isValidPhoneFormatted(phone)) {
      return {
        isValid: false,
        message: '휴대폰 번호를 010-1234-5678 형식으로 입력해주세요.',
      };
    }

    return { isValid: true, message: '' };
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    // 휴대폰 번호는 입력 시 자동으로 하이픈 포맷 적용
    if (field === 'phone') {
      const formatted = formatPhoneInput(value);
      setFormData((prev) => ({ ...prev, phone: formatted }));
      return;
    }

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
      case 'phone':
        validationResult = validatePhone(value);
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

  // 휴대폰 번호가 바뀌면(인증 후 수정 등) 인증 상태를 리셋
  useEffect(() => {
    if (!lastVerifiedPhone && !phoneVerificationReference) return;
    if (formData.phone !== lastVerifiedPhone) {
      setLastVerifiedPhone('');
      setPhoneVerificationReference('');
    }
  }, [formData.phone, lastVerifiedPhone, phoneVerificationReference]);

  // 회원가입 가능 여부 확인
  const canSignup = () => {
    const allFieldsValid = Object.values(validation).every((v) => v.isValid);
    const allRequiredAgreements =
      agreements.terms &&
      agreements.privacy &&
      agreements.collection &&
      agreements.thirdParty;

    // console.log('회원가입 조건 확인:', {
    //   allFieldsValid,
    //   allRequiredAgreements,
    //   usernameChecked,
    //   agreements,
    // });

    return (
      allFieldsValid &&
      allRequiredAgreements &&
      usernameChecked &&
      isPhoneVerified
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

  const handleStandardCertify = async () => {
    console.log('[NICE] standard popup button clicked', {
      phoneInput: formData.phone,
    });
    if (standardPopupLoading) return;
    setStandardPopupLoading(true);
    setStandardPopupError('');
    setStandardPopupMessage('');

    try {
      const response = await fetch('/api/auth/nice?purpose=signup');
      console.log('[NICE] /api/auth/nice response', {
        ok: response.ok,
        status: response.status,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const msg =
          typeof body?.error === 'string' && body.error.trim()
            ? body.error.trim()
            : 'Nice 본인인증 준비에 실패했습니다.';
        throw new Error(msg);
      }

      const data = await response.json();
      console.log('[NICE] /api/auth/nice data', {
        tokenVersionId: data?.tokenVersionId,
        requestno: data?.requestno,
        encDataSample:
          typeof data?.encData === 'string' ? data.encData.slice(0, 16) : null,
        integritySample:
          typeof data?.integrityValue === 'string'
            ? data.integrityValue.slice(0, 16)
            : null,
      });
      if (!data?.tokenVersionId || !data?.encData || !data?.integrityValue) {
        throw new Error('Nice API가 필요한 값을 반환하지 않았습니다.');
      }

      const form = standardFormRef.current;
      if (!form) {
        throw new Error('Nice 표준창 폼을 찾을 수 없습니다.');
      }

      (form.elements.namedItem('token_version_id') as HTMLInputElement).value =
        data.tokenVersionId;
      (form.elements.namedItem('enc_data') as HTMLInputElement).value =
        data.encData;
      (form.elements.namedItem('integrity_value') as HTMLInputElement).value =
        data.integrityValue;

      window.name = 'Parent_window';
      const option = `width=500,height=550,top=100,left=100,fullscreen=no,menubar=no,status=no,toolbar=no,titlebar=yes,location=no,scrollbars=no`;
      const popup = window.open(
        'https://nice.checkplus.co.kr/CheckPlusSafeModel/service.cb',
        'popupChk',
        option
      );
      console.log('[NICE] popup opened', { ok: !!popup });

      form.action =
        'https://nice.checkplus.co.kr/CheckPlusSafeModel/service.cb';
      form.target = 'popupChk';
      form.submit();
      console.log('[NICE] form submitted to service.cb');

      setStandardPopupMessage(' ');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '표준창 인증 준비 중 오류가 발생했습니다.';
      console.error('standard certify error', error);
      setStandardPopupError(message);
    } finally {
      setStandardPopupLoading(false);
    }
  };

  // 팝업 결과 수신 (result 페이지가 postMessage로 전달)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      // 보안: 동일 origin에서 온 메시지만 허용
      if (event.origin !== window.location.origin) return;
      const data = event.data as unknown;
      if (typeof data !== 'object' || data === null) return;
      const msg = data as {
        type?: string;
        payload?: {
          resultcode?: string;
          requestno?: string;
          phone?: string;
          phoneVerificationReference?: string;
          error?: string;
        };
      };
      if (msg.type !== 'NICE_AUTH_RESULT') return;
      console.log('[NICE] message from popup', msg);
      const resultcode = msg.payload?.resultcode;
      const requestno = msg.payload?.requestno;
      const verifiedPhone = msg.payload?.phone;
      const verifiedRef = msg.payload?.phoneVerificationReference;
      const isSuccess = resultcode === '0000';
      if (isSuccess) {
        // 서버가 발급한 reference를 받은 경우에만 "인증 완료" 처리
        if (verifiedRef && verifiedPhone) {
          setLastVerifiedPhone(verifiedPhone);
          setPhoneVerificationReference(verifiedRef);
        } else {
          setLastVerifiedPhone('');
          setPhoneVerificationReference('');
        }
        setStandardPopupError('');
        setStandardPopupMessage('인증이 완료되었습니다.');
      } else {
        setLastVerifiedPhone('');
        setPhoneVerificationReference('');
        setStandardPopupError(
          `휴대폰 인증에 실패했습니다. (resultcode=${resultcode ?? ''})`
        );
        setStandardPopupMessage(
          `NICE 인증 결과 수신: resultcode=${resultcode ?? ''} requestno=${
            requestno ?? ''
          }`
        );
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [formData.phone]);

  const handleSignup = async () => {
    console.log('🔍 회원가입 시작');
    console.log('🔍 canSignup 결과:', canSignup());
    console.log('🔍 폼 데이터:', formData);
    console.log('🔍 약관 동의:', agreements);
    console.log('🔍 유효성 검사:', validation);
    console.log('🔍 아이디 중복확인:', usernameChecked);

    if (!canSignup()) {
      console.log('🔍 회원가입 조건 미충족');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔍 signUp 함수 호출:', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        username: formData.id,
        phone: formData.phone,
        agreements,
      });

      const result = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.id,
        formData.phone,
        agreements,
        phoneVerificationReference
      );

      console.log('🔍 signUp 결과:', result);

      if (result.success) {
        router.push('/signin'); // 회원가입 성공 시 로그인 페이지로 이동
      } else {
        setError(result.error || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('🔍 회원가입 오류:', error);
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
            <div className="text-red text-0.75 mt-2 ml-2">
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
            <div className="text-red text-0.75 mt-2 ml-2">
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
            <div className="text-red text-0.75 mt-2 ml-2">
              {validation.email.message}
            </div>
          )}
        </div>

        {/* 휴대폰 번호 인풋 */}
        <div className="w-full mb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center h-[4rem] bg-white rounded">
                <Image
                  src="/svg/login-password.svg"
                  alt="휴대폰"
                  width={20}
                  height={20}
                  className="h-[1.25rem] w-[1.25rem] pl-2"
                />
                <input
                  type="tel"
                  placeholder="  휴대폰 번호를 입력해주세요."
                  className="flex-1 outline-none border-none font-200"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onBlur={(e) => handleInputBlur('phone', e.target.value)}
                  maxLength={13}
                  inputMode="numeric"
                  autoComplete="tel"
                />
              </div>
              <Button
                size="sm"
                className={`text-0-75-500 h-[4rem] ${
                  isPhoneVerified
                    ? 'bg-gray-300 text-gray-600 hover:cursor-not-allowed'
                    : ''
                }`}
                onClick={handleStandardCertify}
                disabled={
                  standardPopupLoading || !formData.phone || isPhoneVerified
                }
              >
                {isPhoneVerified
                  ? '인증완료'
                  : standardPopupLoading
                  ? '요청 중...'
                  : '휴대폰번호 인증'}
              </Button>
            </div>
          </div>
          {standardPopupMessage && !standardPopupError && (
            <div className="text-blue-600 text-0.75 mt-1 ml-2">
              {standardPopupMessage}
            </div>
          )}
          {standardPopupError && (
            <div className="text-red text-0.75 mt-1 ml-2">
              {standardPopupError}
            </div>
          )}
          {validation.phone.message && (
            <div className="text-red text-0.75 mt-2 ml-2">
              {validation.phone.message}
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
            <div className="text-red text-0.75 mt-2 ml-2">
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
            <div className="text-red text-0.75 mt-2 ml-2">
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
                  className="text-red text-0-75 underline"
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
                  className="text-red text-0-75 underline"
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
                  className="text-red text-0-75 underline"
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
                  className="text-red text-0-75 underline"
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
        <form
          ref={standardFormRef}
          action={standardPopupAction}
          method="post"
          target="nicePopup"
          style={{ display: 'none' }}
        >
          <input type="hidden" name="m" defaultValue="service" />
          <input type="hidden" name="enc_data" defaultValue="" />
          <input type="hidden" name="token_version_id" defaultValue="" />
          <input type="hidden" name="integrity_value" defaultValue="" />
        </form>
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
