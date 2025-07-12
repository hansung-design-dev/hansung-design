'use client';
import { Button } from '../button/button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠</div>
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={onClose}
              size="md"
              variant="outlinedGray"
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              size="md"
              variant="filledBlack"
              className="flex-1"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
