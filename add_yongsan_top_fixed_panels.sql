-- 용산구 상단광고(top_fixed) 패널 데이터 추가
-- 기존 panel 데이터와 동일한 address, nickname을 사용하되 panel_type만 'top_fixed'로 설정

-- 먼저 용산구의 region_gu_id 확인
SELECT id, name FROM region_gu WHERE name = '용산구';

-- 용산구에 상단광고 패널 추가
INSERT INTO panel_info (
    id,
    display_type_id,
    region_gu_id,
    region_dong_id,
    nickname,
    address,
    panel_status,
    panel_code,
    panel_type,
    max_banner,
    first_half_closure_quantity,
    second_half_closure_quantity
)
SELECT 
    gen_random_uuid(),
    '8178084e-1f13-40bc-8b90-7b8ddc58bf64', -- banner_display display_type_id
    rg.id, -- 용산구 region_gu_id
    region_dong_id,
    nickname,
    address,
    'active',
    panel_code,
    'top_fixed', -- panel_type을 top_fixed로 변경
    max_banner,
    first_half_closure_quantity,
    second_half_closure_quantity
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '용산구' 
AND pi.panel_type = 'panel'
AND pi.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64';

-- 삽입된 데이터 확인
SELECT 
    pi.id,
    pi.nickname,
    pi.address,
    pi.panel_type,
    pi.panel_code,
    rg.name as region_name
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '용산구' 
AND pi.panel_type = 'top_fixed'
ORDER BY pi.panel_code; 