-- 각 구별 현수막 게시대 신청기간 데이터 삽입
-- 상반기: 매월 1일 - 15일, 하반기: 매월 16일 - 말일

-- 먼저 display_types에서 banner_display ID를 가져오는 함수 생성
DO $$
DECLARE
    v_banner_display_type_id UUID;
    v_region_gu_ids RECORD;
    v_current_month_start DATE;
    v_current_month_end DATE;
    v_next_month_start DATE;
    v_next_month_end DATE;
    v_first_half_end DATE;
    v_second_half_start DATE;
    v_next_first_half_end DATE;
    v_next_second_half_start DATE;
BEGIN
    -- banner_display 타입 ID 가져오기
    SELECT id INTO v_banner_display_type_id 
    FROM display_types 
    WHERE name = 'banner_display' 
    LIMIT 1;

    -- 현재 월과 다음 월의 날짜 계산
    v_current_month_start := DATE_TRUNC('month', CURRENT_DATE);
    v_current_month_end := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
    v_next_month_start := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    v_next_month_end := (DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month') + INTERVAL '1 month - 1 day')::DATE;
    
    -- 상반기/하반기 날짜 계산
    v_first_half_end := v_current_month_start + INTERVAL '14 days';
    v_second_half_start := v_current_month_start + INTERVAL '15 days';
    v_next_first_half_end := v_next_month_start + INTERVAL '14 days';
    v_next_second_half_start := v_next_month_start + INTERVAL '15 days';

    -- 각 구별로 신청기간 데이터 삽입
    FOR v_region_gu_ids IN 
        SELECT id, name 
        FROM region_gu 
        WHERE name IN ('서대문구', '관악구', '송파구', '용산구', '마포구')
    LOOP
        INSERT INTO region_gu_display_periods (
            display_type_id,
            region_gu_id,
            first_half_from,
            first_half_to,
            first_half_closure_quantity,
            second_half_from,
            second_half_to,
            second_half_closure_quantity,
            next_first_half_from,
            next_first_half_to,
            next_first_half_closure_quantity,
            next_second_half_from,
            next_second_half_to,
            next_second_half_closure_quantity,
            created_at,
            updated_at
        ) VALUES (
            v_banner_display_type_id,
            v_region_gu_ids.id,
            v_current_month_start,           -- 상반기 시작일 (1일)
            v_first_half_end,                -- 상반기 종료일 (15일)
            0,                               -- 상반기 마감 수량 (기본값)
            v_second_half_start,             -- 하반기 시작일 (16일)
            v_current_month_end,             -- 하반기 종료일 (말일)
            0,                               -- 하반기 마감 수량 (기본값)
            v_next_month_start,              -- 다음 상반기 시작일
            v_next_first_half_end,           -- 다음 상반기 종료일
            0,                               -- 다음 상반기 마감 수량
            v_next_second_half_start,        -- 다음 하반기 시작일
            v_next_month_end,                -- 다음 하반기 종료일
            0,                               -- 다음 하반기 마감 수량
            NOW(),
            NOW()
        )
        ON CONFLICT (display_type_id, region_gu_id) 
        DO UPDATE SET
            first_half_from = EXCLUDED.first_half_from,
            first_half_to = EXCLUDED.first_half_to,
            second_half_from = EXCLUDED.second_half_from,
            second_half_to = EXCLUDED.second_half_to,
            next_first_half_from = EXCLUDED.next_first_half_from,
            next_first_half_to = EXCLUDED.next_first_half_to,
            next_second_half_from = EXCLUDED.next_second_half_from,
            next_second_half_to = EXCLUDED.next_second_half_to,
            updated_at = NOW();
    END LOOP;
END $$;

-- 삽입된 데이터 확인
SELECT 
    rg.name as region_name,
    dt.name as display_type,
    TO_CHAR(rgdp.first_half_from, 'YYYY-MM-DD') as first_half_from,
    TO_CHAR(rgdp.first_half_to, 'YYYY-MM-DD') as first_half_to,
    TO_CHAR(rgdp.second_half_from, 'YYYY-MM-DD') as second_half_from,
    TO_CHAR(rgdp.second_half_to, 'YYYY-MM-DD') as second_half_to,
    TO_CHAR(rgdp.next_first_half_from, 'YYYY-MM-DD') as next_first_half_from,
    TO_CHAR(rgdp.next_first_half_to, 'YYYY-MM-DD') as next_first_half_to,
    TO_CHAR(rgdp.next_second_half_from, 'YYYY-MM-DD') as next_second_half_from,
    TO_CHAR(rgdp.next_second_half_to, 'YYYY-MM-DD') as next_second_half_to
FROM region_gu_display_periods rgdp
JOIN region_gu rg ON rgdp.region_gu_id = rg.id
JOIN display_types dt ON rgdp.display_type_id = dt.id
WHERE dt.name = 'banner_display'
ORDER BY rg.name; 