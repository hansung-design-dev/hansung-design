import React from 'react';

interface ViewTypeButtonProps {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export default function ViewTypeButton({
  Icon,
  label,
  isActive,
  onClick,
}: ViewTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 hover:cursor-pointer  ${
        isActive ? 'border-b-solid border-black text-black' : 'text-gray-700'
      }`}
    >
      <Icon
        className={`w-7 h-6 ${isActive ? 'text-black' : 'text-gray-500'}`}
        width={20}
        height={20}
      />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
