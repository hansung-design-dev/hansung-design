-- 용산구의 현재 banner_slot_info 상황 확인

-- 1. 용산구 panel_info 확인
SELECT 
    id,
    panel_code,
    panel_type,
    nickname,
    max_banner
FROM panel_info 
WHERE region_gu_id = '0d53c49c-4033-415b-b309-98d3fdc3d3ea'  -- 용산구
ORDER BY panel_code;

-- 2. 용산구 banner_slot_info 확인
SELECT 
    bsi.id,
    bsi.panel_info_id,
    pi.panel_code,
    pi.nickname,
    bsi.slot_number,
    bsi.slot_name,
    bsi.banner_type,
    bsi.total_price,
    bsi.tax_price,
    bsi.advertising_fee,
    bsi.road_usage_fee
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.region_gu_id = '0d53c49c-4033-415b-b309-98d3fdc3d3ea'  -- 용산구
ORDER BY pi.panel_code, bsi.slot_number, bsi.slot_name;

-- 3. 용산구 상단광고만 확인
SELECT 
    bsi.id,
    bsi.panel_info_id,
    pi.panel_code,
    pi.nickname,
    bsi.slot_number,
    bsi.slot_name,
    bsi.banner_type,
    bsi.total_price
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.region_gu_id = '0d53c49c-4033-415b-b309-98d3fdc3d3ea'  -- 용산구
  AND bsi.slot_name LIKE '상단광고%'
ORDER BY pi.panel_code, bsi.slot_name;

-- 용산구 top_fixed 슬롯들을 6개월, 1년, 3년 기간별로 생성
-- 기존 데이터를 6개월로 변경하고, 1년, 3년용 새로운 row 추가

-- 0. price_unit 컬럼 추가
ALTER TABLE banner_slot_info ADD COLUMN IF NOT EXISTS price_unit price_unit_enum;

-- 1. 기존 top_fixed 슬롯들을 6개월로 업데이트
UPDATE banner_slot_info 
SET 
    slot_name = '상단광고 6개월',
    total_price = '6000000.00',
    tax_price = '0.00',
    advertising_fee = '0.00',
    road_usage_fee = '0.00',
    price_unit = '6 months'::price_unit_enum
WHERE panel_info_id IN (
    '75c302a8-96fa-49f9-9f09-515c98af5641', -- 성촌공원
    '5bced9d3-942d-44a3-b3bc-eb3316b6d8fc', -- 서부이촌동 우편집중국 앞
    'c2273c1f-82ae-44cc-bc48-8af3c2a587e0', -- 한강대교입구
    '3197f4c5-f0b8-4fe0-bc48-e925f808797f', -- 동부이촌동
    'e9a8c2f0-93e1-4095-a50c-01f0ae6bdc77', -- 한강대교북단사거리
    '8f02357b-d7b9-4c65-8a61-97fd935f32db', -- 한강중학교 앞 삼거리1
    '0352af5c-cd54-4a96-99e4-5fcaef902b7b', -- 한강중학교 앞 삼거리2
    '954f56e7-72f4-413d-84b1-4f42b56e72ba', -- 원효대교북단
    '927a1d34-8769-421a-b341-dfa0cd5ede28', -- 북한남동
    '4d2b0586-9d35-4437-b513-c50e1aed98f9', -- 경리단 앞 삼거리
    'fda969d6-5e30-45ee-812a-ea133c68a128', -- 삼각지 육군회관 앞
    '1e7810d5-c5a7-4f59-a0c1-4a755668b734', -- 서울역
    'a515b409-199d-461e-a65b-d17dbf4f2c96', -- 서빙고역앞
    'b460a08a-e1e2-498f-9b41-c5cdd0bced0c', -- 갈월동 숙대입구
    '27566273-bd3f-47cd-8351-91b3d679e0ff'  -- 한남역앞 삼거리
) AND banner_type = 'top_fixed';



-- 2. 1년용 슬롯 추가
INSERT INTO banner_slot_info (
    id, panel_info_id, slot_number, slot_name, 
    banner_type, total_price, tax_price, advertising_fee, road_usage_fee,
    price_unit, purpose, usage_type
) VALUES 
-- 성촌공원 1년
(gen_random_uuid(), '75c302a8-96fa-49f9-9f09-515c98af5641', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial'),
-- 서부이촌동 우편집중국 앞 1년
(gen_random_uuid(), '5bced9d3-942d-44a3-b3bc-eb3316b6d8fc', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial'),
-- 한강대교입구 1년
(gen_random_uuid(), 'c2273c1f-82ae-44cc-bc48-8af3c2a587e0', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial'),
-- 동부이촌동 1년
(gen_random_uuid(), '3197f4c5-f0b8-4fe0-bc48-e925f808797f', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial'),
-- 한강대교북단사거리 1년
(gen_random_uuid(), 'e9a8c2f0-93e1-4095-a50c-01f0ae6bdc77', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial'),
-- 한강중학교 앞 삼거리1 1년
(gen_random_uuid(), '8f02357b-d7b9-4c65-8a61-97fd935f32db', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial'),
-- 한강중학교 앞 삼거리2 1년
(gen_random_uuid(), '0352af5c-cd54-4a96-99e4-5fcaef902b7b', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial'),
-- 원효대교북단 1년
(gen_random_uuid(), '954f56e7-72f4-413d-84b1-4f42b56e72ba', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial'),
-- 북한남동 1년
(gen_random_uuid(), '927a1d34-8769-421a-b341-dfa0cd5ede28', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial'),
-- 경리단 앞 삼거리 1년
(gen_random_uuid(), '4d2b0586-9d35-4437-b513-c50e1aed98f9', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial'),
-- 삼각지 육군회관 앞 1년
(gen_random_uuid(), 'fda969d6-5e30-45ee-812a-ea133c68a128', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial'),
-- 서울역 1년
(gen_random_uuid(), '1e7810d5-c5a7-4f59-a0c1-4a755668b734', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial'),
-- 서빙고역앞 1년
(gen_random_uuid(), 'a515b409-199d-461e-a65b-d17dbf4f2c96', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial'),
-- 갈월동 숙대입구 1년
(gen_random_uuid(), 'b460a08a-e1e2-498f-9b41-c5cdd0bced0c', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial'),
-- 한남역앞 삼거리 1년
(gen_random_uuid(), '27566273-bd3f-47cd-8351-91b3d679e0ff', '1', '상단광고 1년', 'top_fixed', '12000000.00', '0.00', '0.00', '0.00', '1 year'::price_unit_enum, '상업', 'commercial');

-- 3. 3년용 슬롯 추가
INSERT INTO banner_slot_info (
    id, panel_info_id, slot_number, slot_name, 
    banner_type, total_price, tax_price, advertising_fee, road_usage_fee,
    price_unit, purpose, usage_type
) VALUES 
-- 성촌공원 3년
(gen_random_uuid(), '75c302a8-96fa-49f9-9f09-515c98af5641', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial'),
-- 서부이촌동 우편집중국 앞 3년
(gen_random_uuid(), '5bced9d3-942d-44a3-b3bc-eb3316b6d8fc', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial'),
-- 한강대교입구 3년
(gen_random_uuid(), 'c2273c1f-82ae-44cc-bc48-8af3c2a587e0', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial'),
-- 동부이촌동 3년
(gen_random_uuid(), '3197f4c5-f0b8-4fe0-bc48-e925f808797f', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial'),
-- 한강대교북단사거리 3년
(gen_random_uuid(), 'e9a8c2f0-93e1-4095-a50c-01f0ae6bdc77', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial'),
-- 한강중학교 앞 삼거리1 3년
(gen_random_uuid(), '8f02357b-d7b9-4c65-8a61-97fd935f32db', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial'),
-- 한강중학교 앞 삼거리2 3년
(gen_random_uuid(), '0352af5c-cd54-4a96-99e4-5fcaef902b7b', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial'),
-- 원효대교북단 3년
(gen_random_uuid(), '954f56e7-72f4-413d-84b1-4f42b56e72ba', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial'),
-- 북한남동 3년
(gen_random_uuid(), '927a1d34-8769-421a-b341-dfa0cd5ede28', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial'),
-- 경리단 앞 삼거리 3년
(gen_random_uuid(), '4d2b0586-9d35-4437-b513-c50e1aed98f9', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial'),
-- 삼각지 육군회관 앞 3년
(gen_random_uuid(), 'fda969d6-5e30-45ee-812a-ea133c68a128', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial'),
-- 서울역 3년
(gen_random_uuid(), '1e7810d5-c5a7-4f59-a0c1-4a755668b734', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial'),
-- 서빙고역앞 3년
(gen_random_uuid(), 'a515b409-199d-461e-a65b-d17dbf4f2c96', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial'),
-- 갈월동 숙대입구 3년
(gen_random_uuid(), 'b460a08a-e1e2-498f-9b41-c5cdd0bced0c', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial'),
-- 한남역앞 삼거리 3년
(gen_random_uuid(), '27566273-bd3f-47cd-8351-91b3d679e0ff', '1', '상단광고 3년', 'top_fixed', '36000000.00', '0.00', '0.00', '0.00', '3 years'::price_unit_enum, '상업', 'commercial');

-- 4. 기존 6개월 슬롯들에 purpose, usage_type 추가
UPDATE banner_slot_info 
SET 
    purpose = '상업',
    usage_type = 'commercial'
WHERE slot_name = '상단광고 6개월' AND banner_type = 'top_fixed';

-- 5. 결과 확인
SELECT 
    bsi.id, bsi.panel_info_id, pi.panel_code, bsi.nickname, bsi.slot_number, bsi.slot_name, 
    bsi.banner_type, bsi.total_price, bsi.tax_price, bsi.advertising_fee, bsi.road_usage_fee,
    bsi.price_unit, bsi.purpose, bsi.usage_type
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE bsi.panel_info_id IN (
    '75c302a8-96fa-49f9-9f09-515c98af5641', -- 성촌공원
    '5bced9d3-942d-44a3-b3bc-eb3316b6d8fc', -- 서부이촌동 우편집중국 앞
    'c2273c1f-82ae-44cc-bc48-8af3c2a587e0', -- 한강대교입구
    '3197f4c5-f0b8-4fe0-bc48-e925f808797f', -- 동부이촌동
    'e9a8c2f0-93e1-4095-a50c-01f0ae6bdc77', -- 한강대교북단사거리
    '8f02357b-d7b9-4c65-8a61-97fd935f32db', -- 한강중학교 앞 삼거리1
    '0352af5c-cd54-4a96-99e4-5fcaef902b7b', -- 한강중학교 앞 삼거리2
    '954f56e7-72f4-413d-84b1-4f42b56e72ba', -- 원효대교북단
    '927a1d34-8769-421a-b341-dfa0cd5ede28', -- 북한남동
    '4d2b0586-9d35-4437-b513-c50e1aed98f9', -- 경리단 앞 삼거리
    'fda969d6-5e30-45ee-812a-ea133c68a128', -- 삼각지 육군회관 앞
    '1e7810d5-c5a7-4f59-a0c1-4a755668b734', -- 서울역
    'a515b409-199d-461e-a65b-d17dbf4f2c96', -- 서빙고역앞
    'b460a08a-e1e2-498f-9b41-c5cdd0bced0c', -- 갈월동 숙대입구
    '27566273-bd3f-47cd-8351-91b3d679e0ff'  -- 한남역앞 삼거리
) AND bsi.banner_type = 'top_fixed'
ORDER BY pi.panel_code, bsi.price_unit; 