'use client';
import { ReactNode } from 'react';

interface ModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  titleAlign?: 'left' | 'center';
}

export default function ModalContainer({
  isOpen,
  onClose,
  title,
  children,
  titleAlign = 'left',
}: ModalContainerProps) {
  if (!isOpen) return null;

  const isCenterTitle = titleAlign === 'center';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div
          className={
            isCenterTitle
              ? 'relative mb-6'
              : 'flex justify-between items-center mb-6'
          }
        >
          <h2
            className={`text-1.25 font-700 ${
              isCenterTitle ? 'text-center' : ''
            }`}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className={
              isCenterTitle
                ? 'absolute right-0 top-0 text-gray-500 hover:text-gray-700 text-2xl font-bold'
                : 'text-gray-500 hover:text-gray-700 text-2xl font-bold'
            }
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
