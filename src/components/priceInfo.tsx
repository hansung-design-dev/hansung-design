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
  displayName?: string; // 새로운 필드 추가
}

interface PriceInfoProps {
  pricePolicies: PricePolicy[];
  districtName: string;
  isLEDDisplay?: boolean;
}

export default function PriceInfo({
  pricePolicies,
  districtName,
  isLEDDisplay = false,
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

  // 새로운 API에서 받은 displayName을 사용하는 로직
  const getDistrictSpecificDisplay = () => {
    // LED 전자게시대인 경우 displayName 사용
    if (isLEDDisplay) {
      const commercialPolicy = pricePolicies.find(
        (policy) => policy.price_usage_type === 'default'
      );
      if (commercialPolicy && commercialPolicy.displayName) {
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <div>{commercialPolicy.displayName}</div>
          </div>
        );
      }
      // displayName이 없는 경우 fallback
      if (commercialPolicy) {
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              상업용: {commercialPolicy.total_price?.toLocaleString()}원
            </div>
          </div>
        );
      }
      return null;
    }

    // displayName이 있는 경우 (새로운 API 사용)
    if (pricePolicies.some((policy) => policy.displayName)) {
      return (
        <div className="text-sm text-gray-600 space-y-1">
          {pricePolicies.map((policy, index) => (
            <div key={`${policy.id || policy.price_usage_type}_${index}`}>
              {policy.displayName}: {policy.total_price?.toLocaleString()}원
            </div>
          ))}
        </div>
      );
    }

    // 기존 로직 (하위 호환성)
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
              저단형행정용:
              {groupedPolicies.public_institution?.[1]?.total_price?.toLocaleString()}
              원
            </div>
          </div>
        );

      case '서대문구':
        return (
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              상업용:
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
            {Object.entries(groupedPolicies).map(
              ([usageType, policies], index) => (
                <div key={`${usageType}_${index}`}>
                  {getUsageDisplayName(usageType)}:{' '}
                  {policies[0]?.total_price?.toLocaleString()}원
                </div>
              )
            )}
          </div>
        );
    }
  };

  return <div>{getDistrictSpecificDisplay()}</div>;
}
