import BannerPeriod from './bannerPeriod';
import BankInfo from './bankInfo';

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
  flexRow?: boolean;
  isLEDDisplay?: boolean;
}

export default function DistrictInfo({
  period,
  bankInfo,
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

  return (
    <div className="text-gray-600">
      {period && <BannerPeriod {...period} />}

      {isLEDDisplay && (
        <div className="mt-2 text-green-600 font-medium">상시접수</div>
      )}
      <BankInfo flexRow={flexRow} bankInfo={bankInfo} />
    </div>
  );
}
