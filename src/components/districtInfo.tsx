import BankInfo from './bankInfo';
import PhoneNumber from './phoneNumber';

interface DistrictInfoProps {
  period?: {
    first_half_from: string;
    first_half_to: string;
    second_half_from: string;
    second_half_to: string;
  } | null;
  bankInfo?: {
    id: string;
    bank_name: string;
    account_number: string;
    depositor: string;
    region_gu: {
      id: string;
      name: string;
    };
    display_types: {
      id: string;
      name: string;
    };
  } | null;
  districtName?: string;
  flexRow?: boolean;
  isLEDDisplay?: boolean;
}

export default function DistrictInfo({
  period,
  bankInfo,
  districtName,
  flexRow = false,
  isLEDDisplay = false,
}: DistrictInfoProps) {
  // 디버깅용 로그
  console.log('🔍 DistrictInfo 상세 디버깅:', {
    period,
    periodType: typeof period,
    periodKeys: period ? Object.keys(period) : 'null',
    periodValues: period ? Object.values(period) : 'null',
    bankInfo,
    flexRow,
    isLEDDisplay,
  });

  // 구별 신청 시간 표시
  const getApplicationTime = () => {
    if (!districtName) return null;

    if (districtName === '강북구' || districtName === '마포구') {
      return (
        <div className="text-gray-600">
          <div className="text-1">
            <span className="font-medium">1차:</span> 매월 5일 9시
          </div>
          <div className="text-1">
            <span className="font-medium">2차:</span> 매월 20일 9시
          </div>
        </div>
      );
    } else {
      return (
        <div className="text-gray-600">
          <div className="text-1">
            <span className="font-medium">1차:</span> 매월 1일 9시
          </div>
          <div className="text-1">
            <span className="font-medium">2차:</span> 매월 16일 9시
          </div>
        </div>
      );
    }
  };

  return (
    <div className="text-gray-600">
      {getApplicationTime()}

      {isLEDDisplay && (
        <div className="mt-2 text-green-600 font-medium">상시접수</div>
      )}

      {districtName && (
        <div className="mt-2">
          <PhoneNumber districtName={districtName} flexRow={flexRow} />
        </div>
      )}

      <BankInfo flexRow={flexRow} bankInfo={bankInfo} />
    </div>
  );
}
