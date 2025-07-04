-- 송파구 상단광고(top_fixed) 패널 데이터 추가
-- 기존 panel 데이터와 동일한 address, nickname을 사용하되 panel_type만 'top_fixed'로 설정

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
    '01d96bb6-3056-472f-a056-2c1ea7a47db5', -- 송파구 region_gu_id
    region_dong_id,
    nickname,
    address,
    'active',
    panel_code,
    'top_fixed', -- panel_type을 top_fixed로 변경
    max_banner,
    first_half_closure_quantity,
    second_half_closure_quantity
FROM panel_info 
WHERE region_gu_id = '01d96bb6-3056-472f-a056-2c1ea7a47db5' 
AND panel_type = 'panel'
AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64';

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
WHERE rg.name = '송파구' 
AND pi.panel_type = 'top_fixed'
ORDER BY pi.panel_code; 