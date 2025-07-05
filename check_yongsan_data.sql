-- 용산구 데이터 상태 확인

-- 1. region_gu 테이블에서 용산구 확인
SELECT * FROM region_gu WHERE name = '용산구';

-- 2. region_dong 테이블에서 용산구 관련 동 정보 확인
SELECT * FROM region_dong WHERE district_code = 'yongsan';

-- 3. display_types 테이블에서 LED 전자게시대 확인
SELECT * FROM display_types WHERE name = 'led_display';

-- 4. 현재 panel_info에서 용산구 데이터 확인
SELECT 
    pi.*,
    rg.name as region_name,
    dt.name as display_type_name
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN display_types dt ON pi.display_type_id = dt.id
WHERE rg.name = '용산구';

-- 5. 용산구의 region_gu_id와 display_type_id 확인
SELECT 
    rg.id as region_gu_id,
    rg.name as region_name,
    dt.id as display_type_id,
    dt.name as display_type_name
FROM region_gu rg
CROSS JOIN display_types dt
WHERE rg.name = '용산구' 
AND dt.name = 'led_display'; 