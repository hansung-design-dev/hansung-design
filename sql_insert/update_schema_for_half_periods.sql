-- =================================================================
-- 1. orders 테이블에 half_period 컬럼 추가
-- =================================================================

-- orders 테이블에 half_period 컬럼 추가 (first_half, second_half)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS half_period text CHECK (half_period IN ('first_half', 'second_half'));

-- =================================================================
-- 2. order_details 테이블에 half_period 컬럼 추가
-- =================================================================

-- order_details 테이블에 half_period 컬럼 추가
ALTER TABLE order_details ADD COLUMN IF NOT EXISTS half_period text CHECK (half_period IN ('first_half', 'second_half'));

-- =================================================================
-- 3. banner_slot_info 테이블에 상하반기별 마감수 컬럼 추가
-- =================================================================

-- banner_slot_info 테이블에 상하반기별 마감수 컬럼 추가
ALTER TABLE banner_slot_info ADD COLUMN IF NOT EXISTS first_half_closure_quantity integer DEFAULT 0;
ALTER TABLE banner_slot_info ADD COLUMN IF NOT EXISTS second_half_closure_quantity integer DEFAULT 0;

-- =================================================================
-- 4. led_slot_info 테이블에 상하반기별 마감수 컬럼 추가
-- =================================================================

-- led_slot_info 테이블에 상하반기별 마감수 컬럼 추가
ALTER TABLE led_slot_info ADD COLUMN IF NOT EXISTS first_half_closure_quantity integer DEFAULT 0;
ALTER TABLE led_slot_info ADD COLUMN IF NOT EXISTS second_half_closure_quantity integer DEFAULT 0;

-- =================================================================
-- 5. 기존 데이터에 상하반기 정보 추가
-- =================================================================

-- 기존 orders 데이터에 상하반기 정보 추가 (기본값: first_half)
UPDATE orders SET half_period = 'first_half' WHERE half_period IS NULL;

-- 기존 order_details 데이터에 상하반기 정보 추가 (기본값: first_half)
UPDATE order_details SET half_period = 'first_half' WHERE half_period IS NULL;

-- =================================================================
-- 6. 주문 생성 시 마감수 자동 감소 트리거 함수
-- =================================================================

-- 주문 생성 시 마감수를 자동으로 감소시키는 함수
CREATE OR REPLACE FUNCTION update_closure_quantity_on_order()
RETURNS TRIGGER AS $$
DECLARE
    v_panel_type text;
    v_order_quantity integer;
BEGIN
    -- 패널 타입 확인
    SELECT pi.panel_type INTO v_panel_type
    FROM panel_info pi
    WHERE pi.id = NEW.panel_info_id;
    
    -- 주문 수량 확인
    SELECT od.slot_order_quantity INTO v_order_quantity
    FROM order_details od
    WHERE od.order_id = NEW.id
    LIMIT 1;
    
    -- 패널 타입에 따라 마감수 업데이트
    IF v_panel_type = 'led' THEN
        -- LED 패널인 경우
        IF NEW.half_period = 'first_half' THEN
            UPDATE led_slot_info 
            SET first_half_closure_quantity = first_half_closure_quantity + COALESCE(v_order_quantity, 1)
            WHERE panel_info_id = NEW.panel_info_id;
        ELSIF NEW.half_period = 'second_half' THEN
            UPDATE led_slot_info 
            SET second_half_closure_quantity = second_half_closure_quantity + COALESCE(v_order_quantity, 1)
            WHERE panel_info_id = NEW.panel_info_id;
        END IF;
    ELSE
        -- 배너 패널인 경우
        IF NEW.half_period = 'first_half' THEN
            UPDATE banner_slot_info 
            SET first_half_closure_quantity = first_half_closure_quantity + COALESCE(v_order_quantity, 1)
            WHERE panel_info_id = NEW.panel_info_id;
        ELSIF NEW.half_period = 'second_half' THEN
            UPDATE banner_slot_info 
            SET second_half_closure_quantity = second_half_closure_quantity + COALESCE(v_order_quantity, 1)
            WHERE panel_info_id = NEW.panel_info_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 주문 생성 시 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_closure_quantity ON orders;
CREATE TRIGGER trigger_update_closure_quantity
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_closure_quantity_on_order();

-- =================================================================
-- 7. 상하반기별 주문 데이터 생성 함수
-- =================================================================

-- 상하반기별 주문 데이터를 생성하는 함수
CREATE OR REPLACE FUNCTION create_half_period_orders()
RETURNS void AS $$
DECLARE
    v_user_id UUID;
    v_mapo_bulletin_id UUID;      -- 마포구 시민게시대
    v_songpa_panel_id UUID;       -- 송파구 패널
    v_yongsan_panel_id UUID;      -- 용산구 패널
    v_mapo_lower_id UUID;         -- 마포구 저단형
    v_mapo_multi_id UUID;         -- 마포구 연립형
    v_seodaemun_admin_id UUID;    -- 서대문구 행정용
    v_led_panel_id UUID;          -- LED 게시대
    v_order_id UUID;
BEGIN
    -- 기존 사용자 ID 가져오기 (testsung 사용자)
    SELECT id INTO v_user_id FROM user_auth WHERE username = 'testsung' LIMIT 1;
    
    -- 사용자가 없으면 에러 발생
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'testsung 사용자가 존재하지 않습니다.';
    END IF;
    
    RAISE NOTICE '사용자 ID: %', v_user_id;
    
    -- 1. 마포구 시민게시대 찾기 (bulletin-board 타입)
    SELECT pi.id INTO v_mapo_bulletin_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '마포구' AND pi.panel_type = 'bulletin-board' 
    LIMIT 1;
    
    -- 2. 송파구 패널 찾기
    SELECT pi.id INTO v_songpa_panel_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '송파구' 
    LIMIT 1;
    
    -- 3. 용산구 패널 찾기
    SELECT pi.id INTO v_yongsan_panel_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '용산구' 
    LIMIT 1;
    
    -- 4. 마포구 저단형 찾기 (lower-panel)
    SELECT pi.id INTO v_mapo_lower_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '마포구' AND pi.panel_type = 'lower-panel' 
    LIMIT 1;
    
    -- 5. 마포구 연립형 찾기 (multi-panel)
    SELECT pi.id INTO v_mapo_multi_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '마포구' AND pi.panel_type = 'multi-panel' 
    LIMIT 1;
    
    -- 6. 서대문구 행정용 찾기
    SELECT pi.id INTO v_seodaemun_admin_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '서대문구' 
    LIMIT 1;
    
    -- 7. LED 게시대 찾기
    SELECT pi.id INTO v_led_panel_id 
    FROM panel_info pi 
    WHERE pi.panel_type = 'led' 
    LIMIT 1;
    
    RAISE NOTICE '찾은 패널 정보:';
    RAISE NOTICE '마포구 시민게시대: %', v_mapo_bulletin_id;
    RAISE NOTICE '송파구 패널: %', v_songpa_panel_id;
    RAISE NOTICE '용산구 패널: %', v_yongsan_panel_id;
    RAISE NOTICE '마포구 저단형: %', v_mapo_lower_id;
    RAISE NOTICE '마포구 연립형: %', v_mapo_multi_id;
    RAISE NOTICE '서대문구 행정용: %', v_seodaemun_admin_id;
    RAISE NOTICE 'LED 게시대: %', v_led_panel_id;
    
    -- =================================================================
    -- 상반기 주문들 생성
    -- =================================================================
    
    -- 상반기 주문 1: 마포구 시민게시대 (포스터 지참 후 방문 신청)
    IF v_mapo_bulletin_id IS NOT NULL THEN
        INSERT INTO orders (
            id, user_id, panel_info_id, panel_slot_usage_id, total_price, depositor_name, 
            deposit_date, is_paid, is_checked, payment_method, half_period,
            is_received_order, is_received_paymenet, is_draft_sent, is_draft_received, 
            is_address_verified, is_draft_verified, display_location, received_payment_at,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_mapo_bulletin_id, NULL, 0, '성은지테스트',
            CURRENT_DATE - INTERVAL '5 days', true, true, 'bank_transfer', 'first_half',
            true, true, true, true, true, true, '마포구 시민게시대 상반기', CURRENT_TIMESTAMP - INTERVAL '5 days',
            CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days'
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_details (
            id, order_id, slot_order_quantity, display_start_date, display_end_date,
            half_period, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, 1, CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '25 days',
            'first_half', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days'
        );
        
        RAISE NOTICE '마포구 시민게시대 상반기 주문 생성 완료';
    END IF;
    
    -- 상반기 주문 2: 송파구 상담문의
    IF v_songpa_panel_id IS NOT NULL THEN
        INSERT INTO orders (
            id, user_id, panel_info_id, panel_slot_usage_id, total_price, depositor_name, 
            deposit_date, is_paid, is_checked, payment_method, half_period,
            is_received_order, is_received_paymenet, is_draft_sent, is_draft_received, 
            is_address_verified, is_draft_verified, display_location, received_payment_at,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_songpa_panel_id, NULL, 0, '성은지테스트',
            NULL, false, false, 'bank_transfer', 'first_half',
            true, false, true, true, true, true, '송파구 상담문의 상반기', NULL,
            CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_details (
            id, order_id, slot_order_quantity, display_start_date, display_end_date,
            half_period, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, 1, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '30 days',
            'first_half', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'
        );
        
        RAISE NOTICE '송파구 상담문의 상반기 주문 생성 완료';
    END IF;
    
    -- 상반기 주문 3: 용산구 상담문의
    IF v_yongsan_panel_id IS NOT NULL THEN
        INSERT INTO orders (
            id, user_id, panel_info_id, panel_slot_usage_id, total_price, depositor_name, 
            deposit_date, is_paid, is_checked, payment_method, half_period,
            is_received_order, is_received_paymenet, is_draft_sent, is_draft_received, 
            is_address_verified, is_draft_verified, display_location, received_payment_at,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_yongsan_panel_id, NULL, 0, '성은지테스트',
            NULL, false, false, 'bank_transfer', 'first_half',
            true, false, true, true, true, true, '용산구 상담문의 상반기', NULL,
            CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_details (
            id, order_id, slot_order_quantity, display_start_date, display_end_date,
            half_period, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, 1, CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '35 days',
            'first_half', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'
        );
        
        RAISE NOTICE '용산구 상담문의 상반기 주문 생성 완료';
    END IF;
    
    -- 상반기 주문 4: 마포구 저단형
    IF v_mapo_lower_id IS NOT NULL THEN
        INSERT INTO orders (
            id, user_id, panel_info_id, panel_slot_usage_id, total_price, depositor_name, 
            deposit_date, is_paid, is_checked, payment_method, half_period,
            is_received_order, is_received_paymenet, is_draft_sent, is_draft_received, 
            is_address_verified, is_draft_verified, display_location, received_payment_at,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_mapo_lower_id, NULL, 100000, '성은지테스트',
            CURRENT_DATE - INTERVAL '7 days', true, true, 'bank_transfer', 'first_half',
            true, true, true, true, true, true, '마포구 저단형 상반기', CURRENT_TIMESTAMP - INTERVAL '7 days',
            CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days'
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_details (
            id, order_id, slot_order_quantity, display_start_date, display_end_date,
            half_period, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, 1, CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE + INTERVAL '27 days',
            'first_half', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days'
        );
        
        RAISE NOTICE '마포구 저단형 상반기 주문 생성 완료';
    END IF;
    
    -- 상반기 주문 5: 마포구 연립형
    IF v_mapo_multi_id IS NOT NULL THEN
        INSERT INTO orders (
            id, user_id, panel_info_id, panel_slot_usage_id, total_price, depositor_name, 
            deposit_date, is_paid, is_checked, payment_method, half_period,
            is_received_order, is_received_paymenet, is_draft_sent, is_draft_received, 
            is_address_verified, is_draft_verified, display_location, received_payment_at,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_mapo_multi_id, NULL, 130000, '성은지테스트',
            CURRENT_DATE - INTERVAL '10 days', true, true, 'bank_transfer', 'first_half',
            true, true, true, true, true, true, '마포구 연립형 상반기', CURRENT_TIMESTAMP - INTERVAL '10 days',
            CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '10 days'
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_details (
            id, order_id, slot_order_quantity, display_start_date, display_end_date,
            half_period, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, 1, CURRENT_DATE + INTERVAL '8 days', CURRENT_DATE + INTERVAL '23 days',
            'first_half', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '10 days'
        );
        
        RAISE NOTICE '마포구 연립형 상반기 주문 생성 완료';
    END IF;
    
    -- 상반기 주문 6: 서대문구 행정용
    IF v_seodaemun_admin_id IS NOT NULL THEN
        INSERT INTO orders (
            id, user_id, panel_info_id, panel_slot_usage_id, total_price, depositor_name, 
            deposit_date, is_paid, is_checked, payment_method, half_period,
            is_received_order, is_received_paymenet, is_draft_sent, is_draft_received, 
            is_address_verified, is_draft_verified, display_location, received_payment_at,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_seodaemun_admin_id, NULL, 80000, '성은지테스트',
            CURRENT_DATE - INTERVAL '12 days', true, true, 'bank_transfer', 'first_half',
            true, true, true, true, true, true, '서대문구 행정용 상반기', CURRENT_TIMESTAMP - INTERVAL '12 days',
            CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '12 days'
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_details (
            id, order_id, slot_order_quantity, display_start_date, display_end_date,
            half_period, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, 1, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '20 days',
            'first_half', CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '12 days'
        );
        
        RAISE NOTICE '서대문구 행정용 상반기 주문 생성 완료';
    END IF;
    
    -- 상반기 주문 7: LED 게시대
    IF v_led_panel_id IS NOT NULL THEN
        INSERT INTO orders (
            id, user_id, panel_info_id, panel_slot_usage_id, total_price, depositor_name, 
            deposit_date, is_paid, is_checked, payment_method, half_period,
            is_received_order, is_received_paymenet, is_draft_sent, is_draft_received, 
            is_address_verified, is_draft_verified, display_location, received_payment_at,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_led_panel_id, NULL, 561000, '성은지테스트',
            CURRENT_DATE - INTERVAL '15 days', true, true, 'bank_transfer', 'first_half',
            true, true, true, true, true, true, 'LED 게시대 상반기', CURRENT_TIMESTAMP - INTERVAL '15 days',
            CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '15 days'
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_details (
            id, order_id, slot_order_quantity, display_start_date, display_end_date,
            half_period, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, 1, CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '18 days',
            'first_half', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '15 days'
        );
        
        RAISE NOTICE 'LED 게시대 상반기 주문 생성 완료';
    END IF;
    
    -- =================================================================
    -- 하반기 주문들 생성
    -- =================================================================
    
    -- 하반기 주문 1: 마포구 시민게시대 (포스터 지참 후 방문 신청)
    IF v_mapo_bulletin_id IS NOT NULL THEN
        INSERT INTO orders (
            id, user_id, panel_info_id, panel_slot_usage_id, total_price, depositor_name, 
            deposit_date, is_paid, is_checked, payment_method, half_period,
            is_received_order, is_received_paymenet, is_draft_sent, is_draft_received, 
            is_address_verified, is_draft_verified, display_location, received_payment_at,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_mapo_bulletin_id, NULL, 0, '성은지테스트',
            CURRENT_DATE - INTERVAL '3 days', true, true, 'bank_transfer', 'second_half',
            true, true, true, true, true, true, '마포구 시민게시대 하반기', CURRENT_TIMESTAMP - INTERVAL '3 days',
            CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_details (
            id, order_id, slot_order_quantity, display_start_date, display_end_date,
            half_period, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, 1, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '45 days',
            'second_half', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days'
        );
        
        RAISE NOTICE '마포구 시민게시대 하반기 주문 생성 완료';
    END IF;
    
    -- 하반기 주문 2: 송파구 상담문의
    IF v_songpa_panel_id IS NOT NULL THEN
        INSERT INTO orders (
            id, user_id, panel_info_id, panel_slot_usage_id, total_price, depositor_name, 
            deposit_date, is_paid, is_checked, payment_method, half_period,
            is_received_order, is_received_paymenet, is_draft_sent, is_draft_received, 
            is_address_verified, is_draft_verified, display_location, received_payment_at,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_songpa_panel_id, NULL, 0, '성은지테스트',
            NULL, false, false, 'bank_transfer', 'second_half',
            true, false, true, true, true, true, '송파구 상담문의 하반기', NULL,
            CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_details (
            id, order_id, slot_order_quantity, display_start_date, display_end_date,
            half_period, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, 1, CURRENT_DATE + INTERVAL '35 days', CURRENT_DATE + INTERVAL '50 days',
            'second_half', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'
        );
        
        RAISE NOTICE '송파구 상담문의 하반기 주문 생성 완료';
    END IF;
    
    -- 하반기 주문 3: 용산구 상담문의
    IF v_yongsan_panel_id IS NOT NULL THEN
        INSERT INTO orders (
            id, user_id, panel_info_id, panel_slot_usage_id, total_price, depositor_name, 
            deposit_date, is_paid, is_checked, payment_method, half_period,
            is_received_order, is_received_paymenet, is_draft_sent, is_draft_received, 
            is_address_verified, is_draft_verified, display_location, received_payment_at,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_yongsan_panel_id, NULL, 0, '성은지테스트',
            NULL, false, false, 'bank_transfer', 'second_half',
            true, false, true, true, true, true, '용산구 상담문의 하반기', NULL,
            CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_details (
            id, order_id, slot_order_quantity, display_start_date, display_end_date,
            half_period, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, 1, CURRENT_DATE + INTERVAL '40 days', CURRENT_DATE + INTERVAL '55 days',
            'second_half', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'
        );
        
        RAISE NOTICE '용산구 상담문의 하반기 주문 생성 완료';
    END IF;
    
    -- 하반기 주문 4: 마포구 저단형
    IF v_mapo_lower_id IS NOT NULL THEN
        INSERT INTO orders (
            id, user_id, panel_info_id, panel_slot_usage_id, total_price, depositor_name, 
            deposit_date, is_paid, is_checked, payment_method, half_period,
            is_received_order, is_received_paymenet, is_draft_sent, is_draft_received, 
            is_address_verified, is_draft_verified, display_location, received_payment_at,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_mapo_lower_id, NULL, 100000, '성은지테스트',
            CURRENT_DATE - INTERVAL '8 days', true, true, 'bank_transfer', 'second_half',
            true, true, true, true, true, true, '마포구 저단형 하반기', CURRENT_TIMESTAMP - INTERVAL '8 days',
            CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '8 days'
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_details (
            id, order_id, slot_order_quantity, display_start_date, display_end_date,
            half_period, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, 1, CURRENT_DATE + INTERVAL '32 days', CURRENT_DATE + INTERVAL '47 days',
            'second_half', CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '8 days'
        );
        
        RAISE NOTICE '마포구 저단형 하반기 주문 생성 완료';
    END IF;
    
    -- 하반기 주문 5: 마포구 연립형
    IF v_mapo_multi_id IS NOT NULL THEN
        INSERT INTO orders (
            id, user_id, panel_info_id, panel_slot_usage_id, total_price, depositor_name, 
            deposit_date, is_paid, is_checked, payment_method, half_period,
            is_received_order, is_received_paymenet, is_draft_sent, is_draft_received, 
            is_address_verified, is_draft_verified, display_location, received_payment_at,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_mapo_multi_id, NULL, 130000, '성은지테스트',
            CURRENT_DATE - INTERVAL '6 days', true, true, 'bank_transfer', 'second_half',
            true, true, true, true, true, true, '마포구 연립형 하반기', CURRENT_TIMESTAMP - INTERVAL '6 days',
            CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '6 days'
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_details (
            id, order_id, slot_order_quantity, display_start_date, display_end_date,
            half_period, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, 1, CURRENT_DATE + INTERVAL '28 days', CURRENT_DATE + INTERVAL '43 days',
            'second_half', CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '6 days'
        );
        
        RAISE NOTICE '마포구 연립형 하반기 주문 생성 완료';
    END IF;
    
    -- 하반기 주문 6: 서대문구 행정용
    IF v_seodaemun_admin_id IS NOT NULL THEN
        INSERT INTO orders (
            id, user_id, panel_info_id, panel_slot_usage_id, total_price, depositor_name, 
            deposit_date, is_paid, is_checked, payment_method, half_period,
            is_received_order, is_received_paymenet, is_draft_sent, is_draft_received, 
            is_address_verified, is_draft_verified, display_location, received_payment_at,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_seodaemun_admin_id, NULL, 80000, '성은지테스트',
            CURRENT_DATE - INTERVAL '4 days', true, true, 'bank_transfer', 'second_half',
            true, true, true, true, true, true, '서대문구 행정용 하반기', CURRENT_TIMESTAMP - INTERVAL '4 days',
            CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days'
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_details (
            id, order_id, slot_order_quantity, display_start_date, display_end_date,
            half_period, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, 1, CURRENT_DATE + INTERVAL '25 days', CURRENT_DATE + INTERVAL '40 days',
            'second_half', CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days'
        );
        
        RAISE NOTICE '서대문구 행정용 하반기 주문 생성 완료';
    END IF;
    
    -- 하반기 주문 7: LED 게시대
    IF v_led_panel_id IS NOT NULL THEN
        INSERT INTO orders (
            id, user_id, panel_info_id, panel_slot_usage_id, total_price, depositor_name, 
            deposit_date, is_paid, is_checked, payment_method, half_period,
            is_received_order, is_received_paymenet, is_draft_sent, is_draft_received, 
            is_address_verified, is_draft_verified, display_location, received_payment_at,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_user_id, v_led_panel_id, NULL, 561000, '성은지테스트',
            CURRENT_DATE - INTERVAL '9 days', true, true, 'bank_transfer', 'second_half',
            true, true, true, true, true, true, 'LED 게시대 하반기', CURRENT_TIMESTAMP - INTERVAL '9 days',
            CURRENT_TIMESTAMP - INTERVAL '9 days', CURRENT_TIMESTAMP - INTERVAL '9 days'
        ) RETURNING id INTO v_order_id;
        
        INSERT INTO order_details (
            id, order_id, slot_order_quantity, display_start_date, display_end_date,
            half_period, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), v_order_id, 1, CURRENT_DATE + INTERVAL '22 days', CURRENT_DATE + INTERVAL '37 days',
            'second_half', CURRENT_TIMESTAMP - INTERVAL '9 days', CURRENT_TIMESTAMP - INTERVAL '9 days'
        );
        
        RAISE NOTICE 'LED 게시대 하반기 주문 생성 완료';
    END IF;
    
    RAISE NOTICE '모든 상하반기 주문 데이터 생성 완료!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '오류 발생: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- 8. 상하반기별 주문 데이터 생성 실행
-- =================================================================

-- 상하반기별 주문 데이터 생성
SELECT create_half_period_orders();

-- =================================================================
-- 9. 생성된 데이터 확인
-- =================================================================

-- 상하반기별 주문 데이터 확인
SELECT 
    o.id,
    o.total_price,
    o.half_period,
    o.display_location,
    o.created_at,
    pi.nickname as panel_name,
    rg.name as region_name,
    ua.name as user_name,
    CASE 
        WHEN o.half_period = 'first_half' THEN '상반기'
        WHEN o.half_period = 'second_half' THEN '하반기'
        ELSE '미지정'
    END as half_period_display
FROM orders o
JOIN panel_info pi ON o.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN user_auth ua ON o.user_id = ua.id
WHERE o.half_period IS NOT NULL
ORDER BY o.created_at DESC;

-- 상하반기별 마감수 확인
SELECT 
    pi.nickname,
    rg.name as region_name,
    bsi.first_half_closure_quantity as 상반기_마감수,
    bsi.second_half_closure_quantity as 하반기_마감수
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
LIMIT 10;
