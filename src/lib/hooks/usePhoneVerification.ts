'use client';

import { useCallback, useState } from 'react';

type VerificationStep = 'idle' | 'requested' | 'verified';

interface UsePhoneVerificationOptions {
  onRequest?: () => void;
  onVerified?: (reference: string, context: { verifiedAt: string }) => void;
  onError?: (message: string) => void;
}

interface RequestPayload {
  action: 'request';
  phone: string;
}

interface ConfirmPayload {
  action: 'confirm';
  phone: string;
  code: string;
  requestId: string;
}

const API_ROUTE = '/api/auth/phone-verification';

export function usePhoneVerification(options?: UsePhoneVerificationOptions) {
  const [step, setStep] = useState<VerificationStep>('idle');
  const [message, setMessage] = useState('');
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const [verifiedReference, setVerifiedReference] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const onRequest = options?.onRequest;
  const onVerified = options?.onVerified;
  const onError = options?.onError;

  const resetVerification = useCallback(() => {
    setStep('idle');
    setMessage('');
    setPendingRequestId(null);
    setVerifiedReference(null);
    setCode('');
    setError('');
    setIsRequesting(false);
    setIsConfirming(false);
  }, []);

  const requestVerification = useCallback(
    async (phone: string) => {
      setError('');
      setMessage('');
      setIsRequesting(true);
      try {
        const payload: RequestPayload = { action: 'request', phone };
        const response = await fetch(API_ROUTE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || '인증 요청에 실패했습니다.');
        }

        if (!result.requestId) {
          throw new Error('인증 요청 ID를 확인할 수 없습니다.');
        }

        setPendingRequestId(result.requestId);
        setStep('requested');
        setMessage('인증번호가 발송되었습니다. 인증번호를 입력해주세요.');
        onRequest?.();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '인증 요청 중 오류가 발생했습니다.';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsRequesting(false);
      }
    },
    [onRequest, onError]
  );

  const confirmVerification = useCallback(
    async (phone: string, verificationCode: string) => {
      if (!pendingRequestId) {
        const errorMessage = '인증 요청을 먼저 완료해주세요.';
        setError(errorMessage);
        options?.onError?.(errorMessage);
        return;
      }

      setIsConfirming(true);
      setError('');
      try {
        const payload: ConfirmPayload = {
          action: 'confirm',
          phone,
          code: verificationCode,
          requestId: pendingRequestId,
        };
        const response = await fetch(API_ROUTE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || '인증 확인에 실패했습니다.');
        }

        if (!result.verificationId) {
          throw new Error('인증 결과를 확인할 수 없습니다.');
        }

        setStep('verified');
        setMessage('휴대폰 인증이 완료되었습니다.');
        setVerifiedReference(result.verificationId);
        setPendingRequestId(null);
        setCode('');
        onVerified?.(result.verificationId, {
          verifiedAt: result.verifiedAt ?? new Date().toISOString(),
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '인증 확인 중 오류가 발생했습니다.';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsConfirming(false);
      }
    },
    [pendingRequestId, onError, onVerified]
  );

  return {
    step,
    message,
    error,
    code,
    setCode,
    isRequesting,
    isConfirming,
    requestVerification,
    confirmVerification,
    resetVerification,
    verifiedReference,
  };
}

