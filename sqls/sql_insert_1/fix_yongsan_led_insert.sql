-- 용산구 LED 패널 추가 (수정된 버전)

-- 방법 1: region_dong_id를 NULL로 설정 (동 정보가 없는 경우)
INSERT INTO panel_info (
    id,
    panel_code,
    nickname,
    address,
    panel_status,
    panel_type,
    display_type_id,
    region_gu_id,
    region_dong_id,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    1,
    '용산구 LED 전자게시대',
    '서울특별시 용산구',
    'maintenance', -- maintenance 상태로 설정
    'led',
    dt.id, -- display_type_id를 동적으로 가져오기
    rg.id,
    NULL, -- region_dong_id를 NULL로 설정
    NOW(),
    NOW()
FROM region_gu rg
CROSS JOIN display_types dt
WHERE rg.name = '용산구'
AND dt.name = 'led_display'
AND NOT EXISTS (
    -- 이미 존재하는지 확인
    SELECT 1 FROM panel_info pi2 
    WHERE pi2.region_gu_id = rg.id 
    AND pi2.display_type_id = dt.id
    AND pi2.panel_type = 'led'
);

-- 방법 2: region_dong이 있는 경우 (용산구에 동 정보가 있다면)
-- INSERT INTO panel_info (
--     id,
--     panel_code,
--     nickname,
--     address,
--     panel_status,
--     panel_type,
--     display_type_id,
--     region_gu_id,
--     region_dong_id,
--     created_at,
--     updated_at
-- )
-- SELECT 
--     gen_random_uuid(),
--     1,
--     '용산구 LED 전자게시대',
--     '서울특별시 용산구',
--     'maintenance',
--     'led',
--     dt.id,
--     rg.id,
--     rd.id,
--     NOW(),
--     NOW()
-- FROM region_gu rg
-- LEFT JOIN region_dong rd ON rd.district_code = rg.code
-- CROSS JOIN display_types dt
-- WHERE rg.name = '용산구'
-- AND dt.name = 'led_display'
-- AND rd.name IS NOT NULL
-- AND NOT EXISTS (
--     SELECT 1 FROM panel_info pi2 
--     WHERE pi2.region_gu_id = rg.id 
--     AND pi2.display_type_id = dt.id
--     AND pi2.panel_type = 'led'
-- );

-- 삽입 후 확인
SELECT 
    pi.*,
    rg.name as region_name,
    dt.name as display_type_name
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN display_types dt ON pi.display_type_id = dt.id
WHERE rg.name = '용산구'
ORDER BY pi.created_at DESC; 