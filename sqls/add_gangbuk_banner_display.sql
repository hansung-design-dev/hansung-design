-- 강북구 현수막게시대 추가 SQL
-- 1. 필요한 ID 조회
-- display_type_id (banner_display)
-- region_gu_id (강북구)

-- display_type_id 조회
SELECT id as display_type_id FROM display_types WHERE name = 'banner_display';

-- region_gu_id 조회  
SELECT id as region_gu_id FROM region_gu WHERE name = '강북구';

-- 2. panel_info에 강북구 현수막게시대 추가
INSERT INTO panel_info (
  id,
  panel_code,
  nickname,
  address,
  panel_status,
  panel_type,
  max_banner,
  display_type_id,
  region_gu_id,
  region_dong_id,
  latitude,
  longitude,
  photo_url,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  (SELECT COALESCE(MAX(panel_code), 0) + 1 FROM panel_info WHERE display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')), -- 자동으로 다음 번호 할당
  '강북구 현수막게시대',
  '강북구', -- 주소는 구 이름으로 설정
  'active',
  'panel', -- 기본 패널 타입
  1, -- max_banner
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '강북구'),
  NULL, -- region_dong_id는 NULL로 설정
  NULL, -- latitude는 NULL로 설정
  NULL, -- longitude는 NULL로 설정
  NULL, -- photo_url은 NULL로 설정
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM panel_info 
  WHERE region_gu_id = (SELECT id FROM region_gu WHERE name = '강북구')
  AND display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
);

-- 3. banner_slot_info 추가
INSERT INTO banner_slot_info (
  id,
  panel_info_id,
  slot_number,
  slot_name,
  max_width,
  max_height,
  banner_type,
  price_unit,
  panel_slot_status,
  notes,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  pi.id,
  1, -- slot_number
  '상업용', -- slot_name
  300, -- max_width (기본값)
  150, -- max_height (기본값)
  'panel', -- banner_type
  '원', -- price_unit
  'active', -- panel_slot_status
  '강북구 현수막게시대 상업용 슬롯', -- notes
  NOW(),
  NOW()
FROM panel_info pi
WHERE pi.region_gu_id = (SELECT id FROM region_gu WHERE name = '강북구')
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND NOT EXISTS (
    SELECT 1 FROM banner_slot_info bsi 
    WHERE bsi.panel_info_id = pi.id 
    AND bsi.slot_number = 1
  );

-- 4. banner_slot_price_policy 추가 (상업용)
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
  112300,
  10000,
  33690,
  68510
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
WHERE pi.region_gu_id = (SELECT id FROM region_gu WHERE name = '강북구')
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND bsi.slot_number = 1
  AND bsi.slot_name = '상업용'
  AND NOT EXISTS (
    SELECT 1 FROM banner_slot_price_policy bsp 
    WHERE bsp.banner_slot_info_id = bsi.id 
    AND bsp.price_usage_type = 'default'
  );

-- 5. banner_slot_price_policy 추가 (행정용)
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
  69300,
  0,
  0,
  69300
FROM banner_slot_info bsi
JOIN panel_info pi ON pi.id = bsi.panel_info_id
WHERE pi.region_gu_id = (SELECT id FROM region_gu WHERE name = '강북구')
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND bsi.slot_number = 1
  AND bsi.slot_name = '상업용'
  AND NOT EXISTS (
    SELECT 1 FROM banner_slot_price_policy bsp 
    WHERE bsp.banner_slot_info_id = bsi.id 
    AND bsp.price_usage_type = 'public_institution'
  );

-- 6. 삽입 결과 확인
SELECT 
  '강북구' as 행정구,
  pi.panel_code as 패널코드,
  pi.nickname as 패널명,
  pi.panel_status as 상태,
  bsi.slot_name as 슬롯명,
  bsp.price_usage_type as 용도구분,
  bsp.total_price as 총납부액,
  bsp.tax_price as 수수료,
  bsp.road_usage_fee as 도로사용료,
  bsp.advertising_fee as 광고대행료
FROM panel_info pi
JOIN banner_slot_info bsi ON bsi.panel_info_id = pi.id
JOIN banner_slot_price_policy bsp ON bsp.banner_slot_info_id = bsi.id
WHERE pi.region_gu_id = (SELECT id FROM region_gu WHERE name = '강북구')
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
ORDER BY bsp.price_usage_type;

-- 7. 강북구 현수막게시대 카운트 확인
SELECT 
  rgu.name as 행정구,
  COUNT(pi.id) as 패널수,
  COUNT(bsi.id) as 슬롯수,
  COUNT(bsp.id) as 가격정책수
FROM region_gu rgu
LEFT JOIN panel_info pi ON pi.region_gu_id = rgu.id 
  AND pi.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
  AND pi.panel_status = 'active'
LEFT JOIN banner_slot_info bsi ON bsi.panel_info_id = pi.id
LEFT JOIN banner_slot_price_policy bsp ON bsp.banner_slot_info_id = bsi.id
WHERE rgu.name = '강북구'
GROUP BY rgu.name; 