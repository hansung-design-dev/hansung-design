-- 가격 정책 데이터 수정 및 삽입
-- 기존 데이터 삭제 (선택사항)
-- DELETE FROM banner_slot_price_policy;

-- 관악구 가격 정책 (panel_type 조건으로 수정)
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'default',
  110000,
  10000,
  33000,
  67000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '관악구' 
  AND pi.panel_type = 'panel'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 관악구 재사용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  're_order',
  78000,
  10000,
  33000,
  35000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '관악구' 
  AND pi.panel_type = 'panel'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 관악구 자체제작
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'self_install',
  78000,
  10000,
  33000,
  35000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '관악구' 
  AND pi.panel_type = 'panel'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 송파구 상업용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'default',
  139800,
  10000,
  20570,
  109230
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '송파구' 
  AND pi.panel_type = 'panel'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 송파구 행정용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'public_institution',
  109230,
  0,
  0,
  109230
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '송파구' 
  AND pi.panel_type = 'panel'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 서대문구 상업용 (panel_type = 'panel'으로 수정)
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'default',
  123000,
  10000,
  22600,
  90400
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '서대문구' 
  AND pi.panel_type = 'panel'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 서대문구 판넬 행정용 (panel_type = 'panel'으로 수정)
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'public_institution',
  85000,
  0,
  0,
  85000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '서대문구' 
  AND pi.panel_type = 'panel'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 서대문구 반자동 행정용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'public_institution',
  60000,
  0,
  0,
  60000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '서대문구' 
  AND pi.panel_type = 'semi_auto'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 용산구 판넬 상업용 (panel, with_lighting, no_lighting 모두 포함)
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'default',
  140000,
  10000,
  27720,
  102280
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '용산구' 
  AND pi.panel_type IN ('panel', 'with_lighting', 'no_lighting')
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 용산구 판넬 행정용 (panel, with_lighting, no_lighting 모두 포함)
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'public_institution',
  99000,
  0,
  0,
  99000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '용산구' 
  AND pi.panel_type IN ('panel', 'with_lighting', 'no_lighting')
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 용산구 반자동 상업용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'default',
  120000,
  10000,
  22100,
  87900
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '용산구' 
  AND pi.panel_type = 'semi_auto'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 용산구 반자동 행정용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'public_institution',
  79000,
  0,
  0,
  79000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '용산구' 
  AND pi.panel_type = 'semi_auto'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 마포구 연립형 상업용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'default',
  130000,
  10000,
  26400,
  93600
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '마포구' 
  AND pi.panel_type = 'multi_panel'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 마포구 연립형 행정용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'public_institution',
  93600,
  0,
  0,
  93600
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '마포구' 
  AND pi.panel_type = 'multi_panel'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 마포구 저단형 상업용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'default',
  100000,
  10000,
  26400,
  63600
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '마포구' 
  AND pi.panel_type = 'lower_panel'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 마포구 저단형 행정용
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'public_institution',
  70000,
  0,
  0,
  70000
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '마포구' 
  AND pi.panel_type = 'lower_panel'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 마포구 저단형 행정용자리대여 (0원)
INSERT INTO banner_slot_price_policy (
  id,
  banner_slot_info_id,
  price_usage_type,
  total_price,
  tax_price,
  road_usage_fee,
  advertising_fee
)
SELECT 
  gen_random_uuid(),
  bsi.id,
  'reduction_by_admin',
  0,
  0,
  0,
  0
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE rgu.name = '마포구' 
  AND pi.panel_type = 'lower_panel'
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ON CONFLICT (banner_slot_info_id, price_usage_type) DO UPDATE SET
  total_price = EXCLUDED.total_price,
  tax_price = EXCLUDED.tax_price,
  road_usage_fee = EXCLUDED.road_usage_fee,
  advertising_fee = EXCLUDED.advertising_fee,
  updated_at = NOW();

-- 삽입 결과 확인
SELECT 
  rgu.name as 행정구,
  pi.panel_type as 패널타입,
  bsp.price_usage_type as 용도구분,
  bsp.total_price as 총납부액,
  bsp.tax_price as 수수료,
  bsp.road_usage_fee as 도로사용료,
  bsp.advertising_fee as 광고대행료
FROM banner_slot_price_policy bsp
JOIN banner_slot_info bsi ON bsi.id = bsp.banner_slot_info_id
JOIN panel_info pi ON pi.id = bsi.panel_info_id
JOIN region_gu rgu ON rgu.id = pi.region_gu_id
WHERE pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
  AND rgu.is_active = true
ORDER BY rgu.name, pi.panel_type, bsp.price_usage_type; 