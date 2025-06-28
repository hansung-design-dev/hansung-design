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
}

export default function DistrictInfo({
  period,
  bankInfo,
  flexRow = false,
}: DistrictInfoProps) {
  return (
    <div className="text-gray-600">
      {period && (
        <div className="mt-2">
          <BannerPeriod {...period} />
        </div>
      )}
      <BankInfo flexRow={flexRow} bankInfo={bankInfo} />
    </div>
  );
}
