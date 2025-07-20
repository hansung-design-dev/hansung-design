import BankInfo from './bankInfo';
import PhoneNumber from './phoneNumber';
import PriceInfo from './priceInfo';

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
  pricePolicies?: {
    id: string;
    price_usage_type:
      | 'default'
      | 'public_institution'
      | 're_order'
      | 'self_install'
      | 'reduction_by_admin'
      | 'rent-place';
    tax_price: number;
    road_usage_fee: number;
    advertising_fee: number;
    total_price: number;
  }[];
}

export default function DistrictInfo({
  period,
  bankInfo,
  districtName,
  flexRow = false,
  isLEDDisplay = false,
  pricePolicies,
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
    <div className="text-gray-600 space-y-2">
      {/* 신청기간 - LED 전자게시대가 아닌 경우에만 표시 */}
      {!isLEDDisplay && (
        <div className="border-b border-gray-200 pb-2">
          <div className="text-0.875 font-medium text-gray-500 mb-2">
            신청기간
          </div>
          {getApplicationTime()}
        </div>
      )}

      {/* LED 전자게시대 상시접수 표시 */}
      {isLEDDisplay && (
        <div className="border-b border-gray-200 pb-2">
          <div className="text-green-600 font-medium text-0.875">상시접수</div>
        </div>
      )}

      {/* 전화번호 */}
      {districtName && (
        <div className="border-b border-gray-200 pb-2">
          <div className="text-0.875 font-medium text-gray-500 mb-1">
            문의전화
          </div>
          <PhoneNumber districtName={districtName} flexRow={flexRow} />
        </div>
      )}

      {/* 입금계좌 */}
      <div>
        <div className="text-0.875 font-medium text-gray-500 mb-1">
          입금계좌
        </div>
        <BankInfo flexRow={flexRow} bankInfo={bankInfo} />
      </div>

      {/* 가격정보 (현수막게시대의 경우에만) */}
      {!isLEDDisplay && pricePolicies && pricePolicies.length > 0 && (
        <div className="border-t border-gray-200 pt-2">
          <div className="text-0.875 font-medium text-gray-500 mb-1">
            가격정보
          </div>
          <PriceInfo
            pricePolicies={pricePolicies}
            districtName={districtName || ''}
          />
        </div>
      )}
    </div>
  );
}
