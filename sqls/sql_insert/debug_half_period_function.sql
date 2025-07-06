-- =================================================================
-- 상하반기 주문 함수 디버깅
-- =================================================================

-- 1. 먼저 함수가 존재하는지 확인
SELECT 
    routine_name, 
    routine_type, 
    data_type 
FROM information_schema.routines 
WHERE routine_name = 'create_half_period_orders';

-- 2. testsung 사용자 확인
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM user_auth WHERE username = 'testsung' LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE '❌ testsung 사용자를 찾을 수 없습니다!';
    ELSE
        RAISE NOTICE '✅ testsung 사용자 찾음: %', v_user_id;
    END IF;
END $$;

-- 3. 패널 정보 확인
DO $$
DECLARE
    v_mapo_bulletin_id UUID;
    v_songpa_panel_id UUID;
    v_yongsan_panel_id UUID;
    v_mapo_lower_id UUID;
    v_mapo_multi_id UUID;
    v_seodaemun_admin_id UUID;
    v_led_panel_id UUID;
BEGIN
    -- 마포구 시민게시대 찾기
    SELECT pi.id INTO v_mapo_bulletin_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '마포구' AND pi.panel_type = 'bulletin-board' 
    LIMIT 1;
    
    -- 송파구 패널 찾기
    SELECT pi.id INTO v_songpa_panel_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '송파구' 
    LIMIT 1;
    
    -- 용산구 패널 찾기
    SELECT pi.id INTO v_yongsan_panel_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '용산구' 
    LIMIT 1;
    
    -- 마포구 저단형 찾기
    SELECT pi.id INTO v_mapo_lower_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '마포구' AND pi.panel_type = 'lower-panel' 
    LIMIT 1;
    
    -- 마포구 연립형 찾기
    SELECT pi.id INTO v_mapo_multi_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '마포구' AND pi.panel_type = 'multi-panel' 
    LIMIT 1;
    
    -- 서대문구 행정용 찾기
    SELECT pi.id INTO v_seodaemun_admin_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '서대문구' 
    LIMIT 1;
    
    -- LED 게시대 찾기
    SELECT pi.id INTO v_led_panel_id 
    FROM panel_info pi 
    WHERE pi.panel_type = 'led' 
    LIMIT 1;
    
    RAISE NOTICE '패널 정보 확인:';
    RAISE NOTICE '마포구 시민게시대: %', v_mapo_bulletin_id;
    RAISE NOTICE '송파구 패널: %', v_songpa_panel_id;
    RAISE NOTICE '용산구 패널: %', v_yongsan_panel_id;
    RAISE NOTICE '마포구 저단형: %', v_mapo_lower_id;
    RAISE NOTICE '마포구 연립형: %', v_mapo_multi_id;
    RAISE NOTICE '서대문구 행정용: %', v_seodaemun_admin_id;
    RAISE NOTICE 'LED 게시대: %', v_led_panel_id;
    
    -- NULL인 패널이 있는지 확인
    IF v_mapo_bulletin_id IS NULL THEN
        RAISE NOTICE '❌ 마포구 시민게시대를 찾을 수 없습니다';
    END IF;
    IF v_songpa_panel_id IS NULL THEN
        RAISE NOTICE '❌ 송파구 패널을 찾을 수 없습니다';
    END IF;
    IF v_yongsan_panel_id IS NULL THEN
        RAISE NOTICE '❌ 용산구 패널을 찾을 수 없습니다';
    END IF;
    IF v_mapo_lower_id IS NULL THEN
        RAISE NOTICE '❌ 마포구 저단형을 찾을 수 없습니다';
    END IF;
    IF v_mapo_multi_id IS NULL THEN
        RAISE NOTICE '❌ 마포구 연립형을 찾을 수 없습니다';
    END IF;
    IF v_seodaemun_admin_id IS NULL THEN
        RAISE NOTICE '❌ 서대문구 행정용을 찾을 수 없습니다';
    END IF;
    IF v_led_panel_id IS NULL THEN
        RAISE NOTICE '❌ LED 게시대를 찾을 수 없습니다';
    END IF;
END $$;

-- 4. 현재 orders 테이블 상태 확인
SELECT 
    '현재 orders 테이블' as info,
    COUNT(*) as total_count,
    COUNT(CASE WHEN half_period IS NOT NULL THEN 1 END) as with_half_period,
    COUNT(CASE WHEN half_period IS NULL THEN 1 END) as without_half_period
FROM orders;

-- 5. 함수 실행 전후 비교를 위한 현재 데이터 백업
CREATE TEMP TABLE temp_orders_backup AS 
SELECT * FROM orders;

-- 6. 함수 실행 (에러가 발생하면 자세한 에러 메시지 확인)
DO $$
BEGIN
    RAISE NOTICE '함수 실행 시작...';
    PERFORM create_half_period_orders();
    RAISE NOTICE '함수 실행 완료!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ 함수 실행 중 오류 발생: %', SQLERRM;
        RAISE NOTICE '오류 상세: %', SQLSTATE;
END $$;

-- 7. 함수 실행 후 데이터 확인
SELECT 
    '함수 실행 후 orders 테이블' as info,
    COUNT(*) as total_count,
    COUNT(CASE WHEN half_period IS NOT NULL THEN 1 END) as with_half_period,
    COUNT(CASE WHEN half_period IS NULL THEN 1 END) as without_half_period
FROM orders;

-- 8. 새로 추가된 주문들 확인
SELECT 
    o.id,
    o.total_price,
    o.depositor_name,
    o.half_period,
    o.display_location,
    o.created_at,
    pi.nickname as panel_name,
    rg.name as region_name
FROM orders o
LEFT JOIN panel_info pi ON o.panel_info_id = pi.id
LEFT JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE o.id NOT IN (SELECT id FROM temp_orders_backup)
ORDER BY o.created_at DESC; 