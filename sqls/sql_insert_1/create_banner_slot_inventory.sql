-- =================================================================
-- banner_slot_inventory 데이터 생성 스크립트
-- =================================================================

-- 기존 데이터 삭제 (7월 데이터만)
DELETE FROM banner_slot_inventory bsi
USING region_gu_display_periods rgdp
WHERE bsi.region_gu_display_period_id = rgdp.id
AND rgdp.year_month = '2024-07';

-- =================================================================
-- 1. 관악구 현수막게시대 데이터 생성
-- =================================================================

-- 관악구 panel_code 2번 (면수 4개)
INSERT INTO banner_slot_inventory (
    panel_info_id,
    region_gu_display_period_id,
    total_faces,
    available_faces
)
SELECT 
    pi.id,
    rgdp.id,
    4,  -- 총 면 수
    4   -- 사용 가능한 면 수
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON rgdp.region_gu_id = rg.id
WHERE rg.name = '관악구'
AND pi.panel_code = '2'
AND pi.panel_type IN ('panel', 'bulletin-board', 'lower-panel', 'multi-panel')
AND rgdp.year_month = '2024-07'
AND rgdp.half_period IN ('first_half', 'second_half');

-- 관악구 panel_code 3번 (면수 1개)
INSERT INTO banner_slot_inventory (
    panel_info_id,
    region_gu_display_period_id,
    total_faces,
    available_faces
)
SELECT 
    pi.id,
    rgdp.id,
    1,  -- 총 면 수
    1   -- 사용 가능한 면 수
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON rgdp.region_gu_id = rg.id
WHERE rg.name = '관악구'
AND pi.panel_code = '3'
AND pi.panel_type IN ('panel')
AND rgdp.year_month = '2024-07'
AND rgdp.half_period IN ('first_half', 'second_half');

-- 관악구 나머지 panel_code들 (면수 5개)
INSERT INTO banner_slot_inventory (
    panel_info_id,
    region_gu_display_period_id,
    total_faces,
    available_faces
)
SELECT 
    pi.id,
    rgdp.id,
    5,  -- 총 면 수
    5   -- 사용 가능한 면 수
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON rgdp.region_gu_id = rg.id
WHERE rg.name = '관악구'
AND pi.panel_code NOT IN ('2', '3')
AND pi.panel_type IN ('panel')
AND rgdp.year_month = '2024-07'
AND rgdp.half_period IN ('first_half', 'second_half');

-- =================================================================
-- 관악구 데이터 확인
-- =================================================================

SELECT 
    rg.name as 구명,
    pi.panel_code,
    pi.panel_type,
    rgdp.half_period,
    bsi.total_faces,
    bsi.available_faces,
    bsi.closed_faces
FROM banner_slot_inventory bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '관악구'
AND rgdp.year_month = '2024-07'
ORDER BY pi.panel_code, rgdp.half_period;

-- 관악구 총 로우 수 확인
SELECT 
    COUNT(*) as 총로우수,
    SUM(bsi.total_faces) as 총면수,
    SUM(bsi.available_faces) as 사용가능면수
FROM banner_slot_inventory bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '관악구'
AND rgdp.year_month = '2024-07';

-- =================================================================
-- 2. 마포구 현수막게시대 데이터 생성
-- =================================================================

-- 2-1. 마포구 연립형 (panel_type = 'multi-panel') - 18개 게시대, 각각 6면
INSERT INTO banner_slot_inventory (
    panel_info_id,
    region_gu_display_period_id,
    total_faces,
    available_faces
)
SELECT 
    pi.id,
    rgdp.id,
    6,  -- 총 면 수
    6   -- 사용 가능한 면 수
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON rgdp.region_gu_id = rg.id
WHERE rg.name = '마포구'
AND pi.panel_type = 'multi-panel'
AND rgdp.year_month = '2024-07'
AND rgdp.half_period IN ('first_half', 'second_half');

-- 2-2. 마포구 저단형 (panel_type = 'lower-panel') - 복잡한 면수 매핑
INSERT INTO banner_slot_inventory (
    panel_info_id,
    region_gu_display_period_id,
    total_faces,
    available_faces
)
SELECT 
    pi.id,
    rgdp.id,
    CASE 
        WHEN pi.panel_code IN ('1') THEN 4
        WHEN pi.panel_code IN ('2', '3') THEN 6
        WHEN pi.panel_code IN ('4', '5', '6', '7', '8', '9', '10', '11', '12') THEN 4
        WHEN pi.panel_code IN ('13') THEN 6
        WHEN pi.panel_code IN ('14', '15') THEN 4
        WHEN pi.panel_code IN ('16') THEN 2
        WHEN pi.panel_code IN ('17', '18') THEN 6
        WHEN pi.panel_code IN ('19') THEN 4
        WHEN pi.panel_code IN ('20') THEN 6
        WHEN pi.panel_code IN ('21', '22', '23') THEN 4
        WHEN pi.panel_code IN ('24') THEN 6
        WHEN pi.panel_code IN ('25', '26', '27', '28', '29', '30', '31', '32') THEN 4
        WHEN pi.panel_code IN ('33', '34') THEN 6
        WHEN pi.panel_code IN ('35') THEN 2
        WHEN pi.panel_code IN ('36', '37') THEN 4
        WHEN pi.panel_code IN ('38') THEN 6
        WHEN pi.panel_code IN ('39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49') THEN 4
        WHEN pi.panel_code IN ('50') THEN 2
        WHEN pi.panel_code IN ('51') THEN 4
        WHEN pi.panel_code IN ('52') THEN 6
        WHEN pi.panel_code IN ('53', '54', '55', '56') THEN 4
        WHEN pi.panel_code IN ('57') THEN 2
        WHEN pi.panel_code IN ('58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72') THEN 4
        ELSE 4  -- 기본값
    END,
    CASE 
        WHEN pi.panel_code IN ('1') THEN 4
        WHEN pi.panel_code IN ('2', '3') THEN 6
        WHEN pi.panel_code IN ('4', '5', '6', '7', '8', '9', '10', '11', '12') THEN 4
        WHEN pi.panel_code IN ('13') THEN 6
        WHEN pi.panel_code IN ('14', '15') THEN 4
        WHEN pi.panel_code IN ('16') THEN 2
        WHEN pi.panel_code IN ('17', '18') THEN 6
        WHEN pi.panel_code IN ('19') THEN 4
        WHEN pi.panel_code IN ('20') THEN 6
        WHEN pi.panel_code IN ('21', '22', '23') THEN 4
        WHEN pi.panel_code IN ('24') THEN 6
        WHEN pi.panel_code IN ('25', '26', '27', '28', '29', '30', '31', '32') THEN 4
        WHEN pi.panel_code IN ('33', '34') THEN 6
        WHEN pi.panel_code IN ('35') THEN 2
        WHEN pi.panel_code IN ('36', '37') THEN 4
        WHEN pi.panel_code IN ('38') THEN 6
        WHEN pi.panel_code IN ('39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49') THEN 4
        WHEN pi.panel_code IN ('50') THEN 2
        WHEN pi.panel_code IN ('51') THEN 4
        WHEN pi.panel_code IN ('52') THEN 6
        WHEN pi.panel_code IN ('53', '54', '55', '56') THEN 4
        WHEN pi.panel_code IN ('57') THEN 2
        WHEN pi.panel_code IN ('58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72') THEN 4
        ELSE 4  -- 기본값
    END
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON rgdp.region_gu_id = rg.id
WHERE rg.name = '마포구'
AND pi.panel_type = 'lower-panel'
AND rgdp.year_month = '2024-07'
AND rgdp.half_period IN ('first_half', 'second_half');

-- 2-3. 마포구 시민게시대 (panel_type = 'bulletin-board') - 14개 게시대, 각각 12면
INSERT INTO banner_slot_inventory (
    panel_info_id,
    region_gu_display_period_id,
    total_faces,
    available_faces
)
SELECT 
    pi.id,
    rgdp.id,
    12,  -- 총 면 수
    12   -- 사용 가능한 면 수
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON rgdp.region_gu_id = rg.id
WHERE rg.name = '마포구'
AND pi.panel_type = 'bulletin-board'
AND rgdp.year_month = '2024-07'
AND rgdp.half_period IN ('first_half', 'second_half');

-- =================================================================
-- 마포구 데이터 확인
-- =================================================================

SELECT 
    rg.name as 구명,
    pi.panel_type,
    pi.panel_code,
    rgdp.half_period,
    bsi.total_faces,
    bsi.available_faces,
    bsi.closed_faces
FROM banner_slot_inventory bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '마포구'
AND rgdp.year_month = '2024-07'
ORDER BY pi.panel_type, pi.panel_code, rgdp.half_period;

-- 마포구 총 로우 수 확인
SELECT 
    pi.panel_type,
    COUNT(*) as 총로우수,
    SUM(bsi.total_faces) as 총면수,
    SUM(bsi.available_faces) as 사용가능면수
FROM banner_slot_inventory bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '마포구'
AND rgdp.year_month = '2024-07'
GROUP BY pi.panel_type
ORDER BY pi.panel_type;

-- =================================================================
-- 3. 서대문구 현수막게시대 데이터 생성
-- =================================================================

-- 서대문구 기존 데이터 삭제
DELETE FROM banner_slot_inventory bsi
USING panel_info pi, region_gu rg, region_gu_display_periods rgdp
WHERE bsi.panel_info_id = pi.id
AND pi.region_gu_id = rg.id
AND bsi.region_gu_display_period_id = rgdp.id
AND rg.name = '서대문구'
AND rgdp.year_month = '2024-07';

-- 서대문구 현수막게시대 - 24개 게시대
INSERT INTO banner_slot_inventory (
    panel_info_id,
    region_gu_display_period_id,
    total_faces,
    available_faces
)
SELECT 
    pi.id,
    rgdp.id,
    CASE 
        WHEN pi.panel_code IN ('6', '7', '8', '9', '16', '17', '18', '22') THEN 5
        WHEN pi.panel_code IN ('1', '2', '3', '4', '5', '10', '11', '12', '13', '14', '15', '19', '20', '21', '23', '24') THEN 6
        ELSE 6  -- 기본값
    END,
    CASE 
        WHEN pi.panel_code IN ('6', '7', '8', '9', '16', '17', '18', '22') THEN 5
        WHEN pi.panel_code IN ('1', '2', '3', '4', '5', '10', '11', '12', '13', '14', '15', '19', '20', '21', '23', '24') THEN 6
        ELSE 6  -- 기본값
    END
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON rgdp.region_gu_id = rg.id
WHERE rg.name = '서대문구'
AND pi.panel_type IN ('panel')
AND rgdp.year_month = '2024-07'
AND rgdp.half_period IN ('first_half', 'second_half');

-- =================================================================
-- 서대문구 데이터 확인
-- =================================================================

SELECT 
    rg.name as 구명,
    pi.panel_type,
    pi.panel_code,
    rgdp.half_period,
    bsi.total_faces,
    bsi.available_faces,
    bsi.closed_faces
FROM banner_slot_inventory bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '서대문구'
AND rgdp.year_month = '2024-07'
ORDER BY pi.panel_code, rgdp.half_period;

-- 서대문구 총 로우 수 확인
SELECT 
    COUNT(*) as 총로우수,
    SUM(bsi.total_faces) as 총면수,
    SUM(bsi.available_faces) as 사용가능면수
FROM banner_slot_inventory bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '서대문구'
AND rgdp.year_month = '2024-07';

-- =================================================================
-- 4. 송파구 현수막게시대 데이터 생성
-- =================================================================

-- 4-1. 송파구 현수막게시대 - 20개 게시대, 각각 5면
INSERT INTO banner_slot_inventory (
    panel_info_id,
    region_gu_display_period_id,
    total_faces,
    available_faces
)
SELECT 
    pi.id,
    rgdp.id,
    5,  -- 총 면 수
    5   -- 사용 가능한 면 수
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON rgdp.region_gu_id = rg.id
WHERE rg.name = '송파구'
AND pi.panel_type IN ('panel')
AND rgdp.year_month = '2024-07'
AND rgdp.half_period IN ('first_half', 'second_half');

-- 4-2. 송파구 상단광고 - 20개 게시대, 각각 1면 (banner_slot_info 기준)
INSERT INTO banner_slot_inventory (
    panel_info_id,
    banner_slot_info_id,
    region_gu_display_period_id,
    total_faces,
    available_faces
)
SELECT 
    bsi.panel_info_id,  -- panel_info_id 설정
    bsi.id,  -- banner_slot_info_id 설정
    rgdp.id,
    1,  -- 총 면 수
    1   -- 사용 가능한 면 수
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON rgdp.region_gu_id = rg.id
WHERE rg.name = '송파구'
AND bsi.banner_type = 'top-fixed'
AND bsi.slot_number = 0
AND rgdp.year_month = '2024-07'
AND rgdp.half_period IN ('first_half', 'second_half');

-- =================================================================
-- 5. 용산구 현수막게시대 데이터 생성
-- =================================================================

-- 5-1. 용산구 현수막게시대 - 19개 게시대
INSERT INTO banner_slot_inventory (
    panel_info_id,
    region_gu_display_period_id,
    total_faces,
    available_faces
)
SELECT 
    pi.id,
    rgdp.id,
    CASE 
        WHEN pi.panel_code = '16' THEN 5
        ELSE 6  -- 나머지 게시대
    END,
    CASE 
        WHEN pi.panel_code = '16' THEN 5
        ELSE 6  -- 나머지 게시대
    END
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON rgdp.region_gu_id = rg.id
WHERE rg.name = '용산구'
AND pi.panel_type IN ('panel')
AND rgdp.year_month = '2024-07'
AND rgdp.half_period IN ('first_half', 'second_half');

-- 5-2. 용산구 상단광고 - 19개 게시대, 각각 1면 (banner_slot_info 기준)
INSERT INTO banner_slot_inventory (
    panel_info_id,
    banner_slot_info_id,
    region_gu_display_period_id,
    total_faces,
    available_faces
)
SELECT 
    bsi.panel_info_id,  -- panel_info_id 설정
    bsi.id,  -- banner_slot_info_id 설정
    rgdp.id,
    1,  -- 총 면 수
    1   -- 사용 가능한 면 수
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_gu_display_periods rgdp ON rgdp.region_gu_id = rg.id
WHERE rg.name = '용산구'
AND bsi.banner_type = 'top-fixed'
AND bsi.slot_number = 0
AND rgdp.year_month = '2024-07'
AND rgdp.half_period IN ('first_half', 'second_half');

-- =================================================================
-- 송파구, 용산구 데이터 확인
-- =================================================================

-- 송파구 데이터 확인
SELECT 
    rg.name as 구명,
    pi.panel_type,
    pi.panel_code,
    rgdp.half_period,
    bsi.total_faces,
    bsi.available_faces,
    bsi.closed_faces
FROM banner_slot_inventory bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구'
AND rgdp.year_month = '2024-07'
ORDER BY pi.panel_type, pi.panel_code, rgdp.half_period;

-- 용산구 데이터 확인
SELECT 
    rg.name as 구명,
    pi.panel_type,
    pi.panel_code,
    rgdp.half_period,
    bsi.total_faces,
    bsi.available_faces,
    bsi.closed_faces
FROM banner_slot_inventory bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu_display_periods rgdp ON bsi.region_gu_display_period_id = rgdp.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '용산구'
AND rgdp.year_month = '2024-07'
ORDER BY pi.panel_type, pi.panel_code, rgdp.half_period; 