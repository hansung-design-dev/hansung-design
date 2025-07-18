import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PhoneNumberProps {
  districtName?: string;
  flexRow?: boolean;
  showCopyButton?: boolean;
}

export default function PhoneNumber({
  districtName,
  flexRow = false,
  showCopyButton = true,
}: PhoneNumberProps) {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!districtName) return;

    const fetchPhoneNumber = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/region-gu?action=getPhoneNumber&district=${encodeURIComponent(
            districtName
          )}`
        );
        const data = await response.json();

        if (data.success) {
          setPhoneNumber(data.data.phone_number);
        } else {
          setError('전화번호를 가져올 수 없습니다.');
        }
      } catch (err) {
        console.error('Error fetching phone number:', err);
        setError('전화번호를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneNumber();
  }, [districtName]);

  const handleCopy = async () => {
    if (!phoneNumber) return;

    try {
      await navigator.clipboard.writeText(phoneNumber);
      // 복사 성공 피드백 (선택사항)
      console.log('전화번호가 복사되었습니다:', phoneNumber);
    } catch (err) {
      console.error('전화번호 복사 실패:', err);
    }
  };

  if (loading) {
    return (
      <div
        className={`text-gray-600 ${flexRow ? 'flex items-center gap-2' : ''}`}
      >
        <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
      </div>
    );
  }

  if (error || !phoneNumber) {
    return null; // 에러나 전화번호가 없으면 아무것도 표시하지 않음
  }

  return (
    <div className="text-gray-700">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold">{phoneNumber}</span>
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="전화번호 복사"
          >
            <Image
              src="/svg/copy.svg"
              alt="copy"
              width={12}
              height={12}
              className="opacity-60 hover:opacity-100 transition-opacity"
            />
          </button>
        )}
      </div>
    </div>
  );
}
