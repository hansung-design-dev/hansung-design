interface PricePolicy {
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
}

interface PriceInfoProps {
  pricePolicies: PricePolicy[];
  districtName: string;
}

export default function PriceInfo({
  pricePolicies,
  districtName,
}: PriceInfoProps) {
  if (!pricePolicies || pricePolicies.length === 0) {
    return null;
  }

  // 가격 정책을 용도별로 그룹화
  const groupedPolicies = pricePolicies.reduce((acc, policy) => {
    const key = policy.price_usage_type;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(policy);
    return acc;
  }, {} as Record<string, PricePolicy[]>);

  // 용도별 표시명 매핑
  const getUsageDisplayName = (usageType: string) => {
    switch (usageType) {
      case 'default':
        return '상업용';
      case 'public_institution':
        return '행정용';
      case 're_order':
        return '재사용';
      case 'self_install':
        return '자체제작';
      case 'reduction_by_admin':
        return '관리자할인';
      case 'rent-place':
        return '자리대여';
      default:
        return usageType;
    }
  };

  // 구별 특별한 표시 로직
  const getDistrictSpecificDisplay = () => {
    switch (districtName) {
      case '강북구':
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              상업용:{' '}
              {groupedPolicies.default?.[0]?.total_price?.toLocaleString()}원
            </div>
            <div>
              행정용:{' '}
              {groupedPolicies.public_institution?.[0]?.total_price?.toLocaleString()}
              원
            </div>
          </div>
        );

      case '관악구':
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              상업용:{' '}
              {groupedPolicies.default?.[0]?.total_price?.toLocaleString()}원
            </div>
            <div>
              자체제작:{' '}
              {groupedPolicies.self_install?.[0]?.total_price?.toLocaleString()}
              원
            </div>
          </div>
        );

      case '마포구':
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              상업용:{' '}
              {groupedPolicies.default?.[0]?.total_price?.toLocaleString()}원
            </div>
            <div>
              행정용:{' '}
              {groupedPolicies.public_institution?.[0]?.total_price?.toLocaleString()}
              원
            </div>
            <div>
              저단형상업용:{' '}
              {groupedPolicies.default?.[1]?.total_price?.toLocaleString()}원
            </div>
            <div>
              저단형행정용:{' '}
              {groupedPolicies.public_institution?.[1]?.total_price?.toLocaleString()}
              원
            </div>
          </div>
        );

      case '서대문구':
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              상업용:{' '}
              {groupedPolicies.default?.[0]?.total_price?.toLocaleString()}원
            </div>
            <div>
              행정용(패널형):{' '}
              {groupedPolicies.public_institution?.[0]?.total_price?.toLocaleString()}
              원
            </div>
            <div>
              행정용(현수막):{' '}
              {groupedPolicies.public_institution?.[1]?.total_price?.toLocaleString()}
              원
            </div>
          </div>
        );

      case '송파구':
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              상업용:{' '}
              {groupedPolicies.default?.[0]?.total_price?.toLocaleString()}원
            </div>
            <div>
              행정용:{' '}
              {groupedPolicies.public_institution?.[0]?.total_price?.toLocaleString()}
              원
            </div>
            <div>상단광고: 상담문의</div>
          </div>
        );

      case '용산구':
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              상업용(패널형):{' '}
              {groupedPolicies.default?.[0]?.total_price?.toLocaleString()}원
            </div>
            <div>
              상업용(현수막):{' '}
              {groupedPolicies.default?.[1]?.total_price?.toLocaleString()}원
            </div>
            <div>
              행정용(패널형):{' '}
              {groupedPolicies.public_institution?.[0]?.total_price?.toLocaleString()}
              원
            </div>
            <div>
              행정용(현수막):{' '}
              {groupedPolicies.public_institution?.[1]?.total_price?.toLocaleString()}
              원
            </div>
            <div>상단광고: 상담문의</div>
          </div>
        );

      default:
        // 기본 표시: 모든 가격 정책을 표시
        return (
          <div className="text-sm text-gray-600 space-y-1">
            {Object.entries(groupedPolicies).map(([usageType, policies]) => (
              <div key={usageType}>
                {getUsageDisplayName(usageType)}:{' '}
                {policies[0]?.total_price?.toLocaleString()}원
              </div>
            ))}
          </div>
        );
    }
  };

  return <div>{getDistrictSpecificDisplay()}</div>;
}
