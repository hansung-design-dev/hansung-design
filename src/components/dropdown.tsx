'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface DropdownOption {
  id: number;
  option: string;
}

interface DropdownMenuProps {
  data: DropdownOption[];
  onChange: (item: DropdownOption) => void;
  title?: string;
  selectedOption?: DropdownOption | null;
}

export default function DropdownMenu({
  data,
  onChange,
  title = '선택해주세요',
  selectedOption,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<DropdownOption | null>(
    selectedOption || null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: DropdownOption) => {
    setSelected(item);
    onChange(item);
    setIsOpen(false);
  };

  // selectedOption prop이 변경되면 selected 상태 업데이트
  useEffect(() => {
    if (selectedOption) {
      setSelected(selectedOption);
    }
  }, [selectedOption]);

  return (
    <div
      className="relative w-[7rem] h-[1.75rem] border border-gray-14 border-solid rounded-md flex items-center justify-between "
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-default bg-white flex items-center justify-center gap-1 hover:border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent text-gray-14 relative"
      >
        <span className="text-1 font-500 mx-auto">
          {selected ? selected.option : title}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
          <ChevronDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white text-gray-14 shadow-lg focus:outline-none pl-0 ">
          <ul className="text-1 sm:text-0.875 list-none flex flex-col items-center w-full pl-0">
            {data.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full text-center cursor-pointer hover:bg-gray-100 select-none py-3 pl-0 text-1"
              >
                <span className="">{item.option}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
