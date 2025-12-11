'use client';

import { useRouter } from 'next/navigation';
import ModalContainer from './ModalContainer';
import { Button } from '@/src/components/button/button';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginPromptModal({
  isOpen,
  onClose,
  message = '로그인이 필요한 서비스입니다. 로그인 후 다시 시도해주세요.',
}: LoginPromptModalProps) {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push('/signin');
    onClose();
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="로그인이 필요합니다"
      titleAlign="center"
    >
      <div className="flex flex-col gap-4 items-center">
        <p className="text-gray-600 text-md">{message}</p>
        <div className="flex justify-end">
          <Button
            variant="outlinedBlack"
            size="md"
            className="w-full max-w-[12rem]"
            onClick={handleGoToLogin}
          >
            로그인하기
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}
