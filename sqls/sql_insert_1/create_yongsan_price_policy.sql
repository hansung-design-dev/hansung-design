-- 용산구 가격 정책 테이블 생성 및 데이터 입력
-- panel_type과 region_gu_name 기준으로 각 banner_slot_info에 가격 정책 적용

-- 1. 가격 정책 테이블 생성
CREATE TYPE price_usage_type AS ENUM ('default', 'public-institution', 'company');

CREATE TABLE IF NOT EXISTS banner_slot_price_policy (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_slot_info_id INTEGER NOT NULL REFERENCES banner_slot_info(id) ON DELETE CASCADE,
    price_usage_type price_usage_type NOT NULL,
    tax_price INTEGER NOT NULL DEFAULT 0,
    road_usage_fee INTEGER NOT NULL DEFAULT 0,
    advertising_fee INTEGER NOT NULL DEFAULT 0,
    total_price INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 유니크 인덱스 생성
CREATE UNIQUE INDEX IF NOT EXISTS idx_banner_slot_price_policy_unique
    ON banner_slot_price_policy (banner_slot_info_id, price_usage_type);

-- 3. 용산구 가격 정책 데이터 입력

-- 3-1. panel_type = 'with_lighting' 또는 'no_lighting'인 애들의 default 타입 가격
INSERT INTO banner_slot_price_policy (
    banner_slot_info_id,
    price_usage_type,
    total_price,
    tax_price,
    road_usage_fee,
    advertising_fee
)
SELECT 
    bsi.id,
    'default' as price_usage_type,
    140000 as total_price,
    10000 as tax_price,
    27720 as road_usage_fee,
    102280 as advertising_fee
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '용산구'
  AND pi.panel_type IN ('with_lighting', 'no_lighting')
  AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
ON CONFLICT (banner_slot_info_id, price_usage_type) DO NOTHING;

-- 3-2. panel_type = 'with_lighting' 또는 'no_lighting'인 애들의 public-institution 타입 가격
INSERT INTO banner_slot_price_policy (
    banner_slot_info_id,
    price_usage_type,
    total_price,
    tax_price,
    road_usage_fee,
    advertising_fee
)
SELECT 
    bsi.id,
    'public-institution' as price_usage_type,
    99000 as total_price,
    0 as tax_price,
    0 as road_usage_fee,
    99000 as advertising_fee
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '용산구'
  AND pi.panel_type IN ('with_lighting', 'no_lighting')
  AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
ON CONFLICT (banner_slot_info_id, price_usage_type) DO NOTHING;

-- 3-3. panel_type = 'semi-auto'인 애들의 default 타입 가격
INSERT INTO banner_slot_price_policy (
    banner_slot_info_id,
    price_usage_type,
    total_price,
    tax_price,
    road_usage_fee,
    advertising_fee
)
SELECT 
    bsi.id,
    'default' as price_usage_type,
    120000 as total_price,
    10000 as tax_price,
    22100 as road_usage_fee,
    87900 as advertising_fee
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '용산구'
  AND pi.panel_type = 'semi-auto'
  AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
ON CONFLICT (banner_slot_info_id, price_usage_type) DO NOTHING;

-- 3-4. panel_type = 'semi-auto'인 애들의 public-institution 타입 가격
INSERT INTO banner_slot_price_policy (
    banner_slot_info_id,
    price_usage_type,
    total_price,
    tax_price,
    road_usage_fee,
    advertising_fee
)
SELECT 
    bsi.id,
    'public-institution' as price_usage_type,
    79000 as total_price,
    0 as tax_price,
    0 as road_usage_fee,
    79000 as advertising_fee
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '용산구'
  AND pi.panel_type = 'semi-auto'
  AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
ON CONFLICT (banner_slot_info_id, price_usage_type) DO NOTHING;

-- 4. 입력된 데이터 확인
SELECT 
    rg.name as region_name,
    pi.panel_type,
    pi.panel_code,
    pi.nickname,
    bsi.slot_number,
    bspp.price_usage_type,
    bspp.total_price,
    bspp.tax_price,
    bspp.road_usage_fee,
    bspp.advertising_fee,
    COUNT(*) as slot_count
FROM banner_slot_price_policy bspp
JOIN banner_slot_info bsi ON bspp.banner_slot_info_id = bsi.id
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '용산구'
  AND pi.panel_type IN ('with_lighting', 'no_lighting', 'semi-auto')
GROUP BY 
    rg.name,
    pi.panel_type,
    pi.panel_code,
    pi.nickname,
    bsi.slot_number,
    bspp.price_usage_type,
    bspp.total_price,
    bspp.tax_price,
    bspp.road_usage_fee,
    bspp.advertising_fee
ORDER BY 
    pi.panel_type,
    pi.panel_code,
    bsi.slot_number,
    bspp.price_usage_type;

-- 5. 요약 통계
SELECT 
    rg.name as region_name,
    pi.panel_type,
    bspp.price_usage_type,
    COUNT(*) as total_slots,
    AVG(bspp.total_price) as avg_total_price,
    AVG(bspp.tax_price) as avg_tax_price,
    AVG(bspp.road_usage_fee) as avg_road_usage_fee,
    AVG(bspp.advertising_fee) as avg_advertising_fee
FROM banner_slot_price_policy bspp
JOIN banner_slot_info bsi ON bspp.banner_slot_info_id = bsi.id
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '용산구'
  AND pi.panel_type IN ('with_lighting', 'no_lighting', 'semi-auto')
GROUP BY 
    rg.name,
    pi.panel_type,
    bspp.price_usage_type
ORDER BY 
    pi.panel_type,
    bspp.price_usage_type; 