--1.  check_inventory_before_order

CREATE OR REPLACE FUNCTION check_inventory_before_order()
RETURNS TRIGGER AS $$
DECLARE
  period_id UUID;
  current_inventory RECORD;
BEGIN
  -- order_details의 display_start_date와 display_end_date를 기반으로 해당하는 기간 찾기
  SELECT rgdp.id INTO period_id
  FROM region_gu_display_periods rgdp
  JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = NEW.panel_info_id
    AND rgdp.display_type_id = pi.display_type_id
    AND (
      -- 기간이 완전히 겹치는 경우
      (NEW.display_start_date >= rgdp.period_from AND NEW.display_end_date <= rgdp.period_to)
      OR
      -- 기간이 부분적으로 겹치는 경우
      (NEW.display_start_date <= rgdp.period_to AND NEW.display_end_date >= rgdp.period_from)
    );
  
  -- 해당 기간의 재고 확인
  IF period_id IS NOT NULL THEN
    SELECT available_slots, total_slots INTO current_inventory
    FROM banner_slot_inventory
    WHERE panel_info_id = NEW.panel_info_id
      AND region_gu_display_period_id = period_id;
    
    -- 재고 정보가 있고, 주문 수량이 가용 재고를 초과하는 경우
    IF FOUND AND current_inventory.available_slots < NEW.slot_order_quantity THEN
      RAISE EXCEPTION '재고 부족: 요청 수량 %개, 가용 재고 %개 (기간: %)', 
        NEW.slot_order_quantity, current_inventory.available_slots, period_id;
    END IF;
  ELSE
    -- 기간을 찾지 못한 경우 경고
    RAISE WARNING '기간을 찾을 수 없음: panel_info_id=%, display_start_date=%, display_end_date=%', 
      NEW.panel_info_id, NEW.display_start_date, NEW.display_end_date;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


--2.check_period_data

CREATE OR REPLACE FUNCTION check_period_data(target_year_month TEXT DEFAULT NULL)
RETURNS TABLE (
    district TEXT,
    display_type TEXT,
    year_month TEXT,
    period TEXT,
    period_from DATE,
    period_to DATE,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rg.name as district,
        dt.name as display_type,
        rgdp.year_month,
        rgdp.period,
        rgdp.period_from,
        rgdp.period_to,
        rgdp.created_at
    FROM region_gu_display_periods rgdp
    JOIN region_gu rg ON rgdp.region_gu_id = rg.id
    JOIN display_types dt ON rgdp.display_type_id = dt.id
    WHERE (target_year_month IS NULL OR rgdp.year_month = target_year_month)
    ORDER BY rg.name, dt.name, rgdp.year_month, rgdp.period;
END;
$$ LANGUAGE plpgsql;


-- 3. create_half_period_orders

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


-- 4. fill_panel_slot_snapshot_after_order_details


DECLARE
    v_panel_type TEXT;
    v_slot_record RECORD;
    v_snapshot JSONB;
BEGIN
    -- 디버깅 로그
    RAISE NOTICE 'order_details 트리거 실행: order_id = %, panel_info_id = %', 
        NEW.order_id, NEW.panel_info_id;
    
    -- panel_info_id가 없으면 처리하지 않음
    IF NEW.panel_info_id IS NULL THEN
        RAISE NOTICE 'panel_info_id가 NULL이므로 처리 중단';
        RETURN NEW;
    END IF;
    
    -- 패널 타입 확인
    SELECT dt.name INTO v_panel_type
    FROM panel_info pi
    JOIN display_types dt ON pi.display_type_id = dt.id
    WHERE pi.id = NEW.panel_info_id;
    
    RAISE NOTICE '패널 타입: %', v_panel_type;
    
    -- 패널 타입에 따라 슬롯 정보 조회
    IF v_panel_type = 'banner_display' THEN
        -- 배너 패널: panel_slot_usage에서 정확한 슬롯 정보 가져오기
        IF NEW.panel_slot_usage_id IS NOT NULL THEN
            -- panel_slot_usage가 있으면 해당 슬롯 사용 (banner_slot_price_policy 포함)
            SELECT 
                bsi.*,
                bsp.total_price as policy_total_price,
                bsp.tax_price as policy_tax_price,
                bsp.road_usage_fee as policy_road_usage_fee,
                bsp.advertising_fee as policy_advertising_fee
            INTO v_slot_record 
            FROM panel_slot_usage psu
            JOIN banner_slot_info bsi ON psu.banner_slot_info_id = bsi.id
            LEFT JOIN banner_slot_price_policy bsp ON bsi.id = bsp.banner_slot_info_id 
                AND bsp.price_usage_type = 'default'  -- 기본값, 필요시 사용자 타입에 따라 변경
            WHERE psu.id = NEW.panel_slot_usage_id;
            
            RAISE NOTICE '배너 슬롯 조회 (panel_slot_usage): slot_number = %, id = %, policy_total_price = %', 
                v_slot_record.slot_number, v_slot_record.id, v_slot_record.policy_total_price;
        ELSE
            -- panel_slot_usage가 없으면 1번 슬롯 사용 (banner_slot_price_policy 포함)
            SELECT 
                bsi.*,
                bsp.total_price as policy_total_price,
                bsp.tax_price as policy_tax_price,
                bsp.road_usage_fee as policy_road_usage_fee,
                bsp.advertising_fee as policy_advertising_fee
            INTO v_slot_record 
            FROM banner_slot_info bsi
            LEFT JOIN banner_slot_price_policy bsp ON bsi.id = bsp.banner_slot_info_id 
                AND bsp.price_usage_type = 'default'  -- 기본값, 필요시 사용자 타입에 따라 변경
            WHERE bsi.panel_info_id = NEW.panel_info_id
              AND bsi.slot_number = 1;
            
            RAISE NOTICE '배너 슬롯 조회 (기본값): slot_number = %, id = %, policy_total_price = %', 
                v_slot_record.slot_number, v_slot_record.id, v_slot_record.policy_total_price;
        END IF;
            
    ELSIF v_panel_type = 'led_display' THEN
        -- LED 패널: panel_slot_usage에서 정확한 슬롯 정보 가져오기
        IF NEW.panel_slot_usage_id IS NOT NULL THEN
            -- panel_slot_usage가 있으면 해당 슬롯 사용
            SELECT lsi.* INTO v_slot_record 
            FROM panel_slot_usage psu
            JOIN led_slot_info lsi ON psu.panel_info_id = lsi.panel_info_id 
                AND psu.slot_number = lsi.slot_number
            WHERE psu.id = NEW.panel_slot_usage_id;
            
            RAISE NOTICE 'LED 슬롯 조회 (panel_slot_usage): slot_number = %, id = %', 
                v_slot_record.slot_number, v_slot_record.id;
        ELSE
            -- panel_slot_usage가 없으면 1번 슬롯 사용
            SELECT * INTO v_slot_record 
            FROM led_slot_info
            WHERE panel_info_id = NEW.panel_info_id
              AND slot_number = 1;
            
            RAISE NOTICE 'LED 슬롯 조회 (기본값): slot_number = %, id = %', 
                v_slot_record.slot_number, v_slot_record.id;
        END IF;
    ELSE
        RAISE NOTICE '알 수 없는 패널 타입: %', v_panel_type;
        RETURN NEW;
    END IF;
    
    -- 슬롯 정보가 없으면 처리하지 않음
    IF v_slot_record.id IS NULL THEN
        RAISE NOTICE '슬롯 정보를 찾을 수 없으므로 처리 중단';
        RETURN NEW;
    END IF;
    
    -- JSONB 스냅샷 생성
    v_snapshot := to_jsonb(v_slot_record);
    
    RAISE NOTICE '생성된 스냅샷: %', v_snapshot;
    
    -- orders 테이블의 panel_slot_snapshot 업데이트
    UPDATE orders 
    SET panel_slot_snapshot = v_snapshot
    WHERE id = NEW.order_id;
    
    RAISE NOTICE 'panel_slot_snapshot 업데이트 완료: 주문 ID %', NEW.order_id;
    
    RETURN NEW;
END;


-- 5. generate_next_first_half_periods
CREATE OR REPLACE FUNCTION generate_next_first_half_periods()
RETURNS void AS $$
DECLARE
    next_month_date DATE;
    next_year INTEGER;
    next_month INTEGER;
    display_type_record RECORD;
    region_record RECORD;
    target_year_month TEXT;
    mapo_next_month_5th DATE; -- 마포구 다음달 5일
BEGIN
    -- 다음달 날짜 계산
    next_month_date := (CURRENT_DATE + INTERVAL '1 month')::DATE;
    next_year := EXTRACT(YEAR FROM next_month_date);
    next_month := EXTRACT(MONTH FROM next_month_date);
    target_year_month := next_year || '년 ' || next_month || '월';
    
    -- 마포구용 다음달 5일 날짜 계산
    mapo_next_month_5th := (next_month_date + INTERVAL '4 days')::DATE;
    
    RAISE NOTICE '다음달 상반기 기간 자동 생성 시작: %', target_year_month;
    
    -- 배너 디스플레이만 처리 (LED는 전체 월 단위)
    FOR display_type_record IN 
        SELECT id, name FROM display_types 
        WHERE name = 'banner_display'
    LOOP
        -- 각 활성화된 구에 대해
        FOR region_record IN 
            SELECT id, name FROM region_gu 
            WHERE is_active = true
        LOOP
            -- 마포구, 강북구 특별 처리: 5일-19일 상반기
            IF region_record.name IN ('마포구', '강북구') THEN
                INSERT INTO region_gu_display_periods (
                    display_type_id, 
                    region_gu_id, 
                    period_from, 
                    period_to, 
                    year_month, 
                    half_period
                )
                SELECT 
                    display_type_record.id,
                    region_record.id,
                    mapo_next_month_5th, -- 다음달 5일부터
                    (mapo_next_month_5th + INTERVAL '14 days')::DATE, -- 다음달 19일까지
                    target_year_month,
                    'first_half'
                WHERE NOT EXISTS (
                    SELECT 1 FROM region_gu_display_periods 
                    WHERE display_type_id = display_type_record.id
                      AND region_gu_id = region_record.id
                      AND year_month = target_year_month
                      AND half_period = 'first_half'
                );
            
            -- 송파, 관악, 용산, 서대문: 1일-15일 상반기
            ELSE
                INSERT INTO region_gu_display_periods (
                    display_type_id, 
                    region_gu_id, 
                    period_from, 
                    period_to, 
                    year_month, 
                    half_period
                )
                SELECT 
                    display_type_record.id,
                    region_record.id,
                    next_month_date, -- 다음달 1일부터
                    (next_month_date + INTERVAL '14 days')::DATE, -- 다음달 15일까지
                    target_year_month,
                    'first_half'
                WHERE NOT EXISTS (
                    SELECT 1 FROM region_gu_display_periods 
                    WHERE display_type_id = display_type_record.id
                      AND region_gu_id = region_record.id
                      AND year_month = target_year_month
                      AND half_period = 'first_half'
                );
            END IF;
            
            RAISE NOTICE '구 %에 % 타입 상반기 기간 데이터 생성 완료', 
                region_record.name, display_type_record.name;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '다음달 상반기 기간 자동 생성 완료: %', target_year_month;
END;
$$ LANGUAGE plpgsql;

-- 6. generate_next_month_led_periods
-- generate_next_month_led_periods 함수 수정
CREATE OR REPLACE FUNCTION generate_next_month_led_periods()
RETURNS void AS $$
DECLARE
    next_month_date DATE;
    next_year INTEGER;
    next_month INTEGER;
    region_record RECORD;
    target_year_month TEXT;
    led_display_type_id UUID;
    period_record RECORD;
BEGIN
    -- 다음달 날짜 계산
    next_month_date := (CURRENT_DATE + INTERVAL '1 month')::DATE;
    next_year := EXTRACT(YEAR FROM next_month_date);
    next_month := EXTRACT(MONTH FROM next_month_date);
    target_year_month := next_year || '년 ' || next_month || '월';
    
    -- LED 디스플레이 타입 ID 가져오기
    SELECT id INTO led_display_type_id FROM display_types WHERE name = 'led_display';
    
    RAISE NOTICE '다음달 LED 디스플레이 기간 자동 생성 시작: %', target_year_month;
    
    -- 각 활성화된 구에 대해
    FOR region_record IN 
        SELECT id, name FROM region_gu 
        WHERE is_active = true
    LOOP
        -- 기간 생성
        INSERT INTO region_gu_display_periods (
            display_type_id, 
            region_gu_id, 
            period_from, 
            period_to, 
            year_month, 
            period
        )
        SELECT 
            led_display_type_id,
            region_record.id,
            next_month_date, -- 다음달 1일부터
            (next_month_date + INTERVAL '1 month - 1 day')::DATE, -- 다음달 마지막 날까지
            target_year_month,
            'full_month'
        WHERE NOT EXISTS (
            SELECT 1 FROM region_gu_display_periods 
            WHERE display_type_id = led_display_type_id
              AND region_gu_id = region_record.id
              AND year_month = target_year_month
              AND period = 'full_month'
        );
        
        -- 생성된 기간에 대해 재고 생성
        FOR period_record IN
            SELECT id FROM region_gu_display_periods
            WHERE display_type_id = led_display_type_id
              AND region_gu_id = region_record.id
              AND year_month = target_year_month
              AND period = 'full_month'
        LOOP
            -- LED 디스플레이 패널들에 대해 재고 생성
            INSERT INTO led_display_inventory (
                panel_info_id,
                region_gu_display_period_id,
                total_faces,
                available_faces,
                closed_faces
            )
            SELECT 
                pi.id,
                period_record.id,
                20, -- 각 게시대별 20개 면
                20, -- 초기 가용 면
                0   -- 초기 폐쇄 면
            FROM panel_info pi
            WHERE pi.region_gu_id = region_record.id
              AND pi.display_type_id = led_display_type_id
              AND pi.panel_status = 'active'
              AND NOT EXISTS (
                  SELECT 1 FROM led_display_inventory ldi
                  WHERE ldi.panel_info_id = pi.id
                    AND ldi.region_gu_display_period_id = period_record.id
              );
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '다음달 LED 디스플레이 기간 및 재고 생성 완료: %', target_year_month;
END;
$$ LANGUAGE plpgsql;

-- 7. generate_next_second_half_periods
CREATE OR REPLACE FUNCTION generate_next_second_half_periods()
RETURNS void AS $$
DECLARE
    next_month_date DATE;
    next_year INTEGER;
    next_month INTEGER;
    display_type_record RECORD;
    region_record RECORD;
    target_year_month TEXT;
    mapo_next_month_5th DATE; -- 마포구 다음달 5일
BEGIN
    -- 다음달 날짜 계산
    next_month_date := (CURRENT_DATE + INTERVAL '1 month')::DATE;
    next_year := EXTRACT(YEAR FROM next_month_date);
    next_month := EXTRACT(MONTH FROM next_month_date);
    target_year_month := next_year || '년 ' || next_month || '월';
    
    -- 마포구용 다음달 5일 날짜 계산
    mapo_next_month_5th := (next_month_date + INTERVAL '4 days')::DATE;
    
    RAISE NOTICE '다음달 하반기 기간 자동 생성 시작: %', target_year_month;
    
    -- 배너 디스플레이만 처리 (LED는 전체 월 단위)
    FOR display_type_record IN 
        SELECT id, name FROM display_types 
        WHERE name = 'banner_display'
    LOOP
        -- 각 활성화된 구에 대해
        FOR region_record IN 
            SELECT id, name FROM region_gu 
            WHERE is_active = true
        LOOP
            -- 마포구, 강북구 특별 처리: 20일-다음달4일 하반기
            IF region_record.name IN ('마포구', '강북구') THEN
                INSERT INTO region_gu_display_periods (
                    display_type_id, 
                    region_gu_id, 
                    period_from, 
                    period_to, 
                    year_month, 
                    half_period
                )
                SELECT 
                    display_type_record.id,
                    region_record.id,
                    (next_month_date + INTERVAL '19 days')::DATE, -- 다음달 20일부터
                    (next_month_date + INTERVAL '1 month + 3 days')::DATE, -- 다음달 4일까지
                    target_year_month,
                    'second_half'
                WHERE NOT EXISTS (
                    SELECT 1 FROM region_gu_display_periods 
                    WHERE display_type_id = display_type_record.id
                      AND region_gu_id = region_record.id
                      AND year_month = target_year_month
                      AND half_period = 'second_half'
                );
            
            -- 송파, 관악, 용산, 서대문: 16일-31일 하반기
            ELSE
                INSERT INTO region_gu_display_periods (
                    display_type_id, 
                    region_gu_id, 
                    period_from, 
                    period_to, 
                    year_month, 
                    half_period
                )
                SELECT 
                    display_type_record.id,
                    region_record.id,
                    (next_month_date + INTERVAL '15 days')::DATE, -- 다음달 16일부터
                    (next_month_date + INTERVAL '1 month - 1 day')::DATE, -- 다음달 31일까지
                    target_year_month,
                    'second_half'
                WHERE NOT EXISTS (
                    SELECT 1 FROM region_gu_display_periods 
                    WHERE display_type_id = display_type_record.id
                      AND region_gu_id = region_record.id
                      AND year_month = target_year_month
                      AND half_period = 'second_half'
                );
            END IF;
            
            RAISE NOTICE '구 %에 % 타입 하반기 기간 데이터 생성 완료', 
                region_record.name, display_type_record.name;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '다음달 하반기 기간 자동 생성 완료: %', target_year_month;
END;
$$ LANGUAGE plpgsql;

-- 8. generate_specific_month_periods



DECLARE
    target_date DATE;
    target_year_month TEXT;
    display_type_record RECORD;
    region_record RECORD;
BEGIN
    -- 대상 월 날짜 계산
    target_date := (target_year || '-' || target_month || '-01')::DATE;
    target_year_month := target_year || '년 ' || target_month || '월';
    
    RAISE NOTICE '대상 월 기간 생성 시작: %', target_year_month;
    
    -- 각 display_type에 대해
    FOR display_type_record IN 
        SELECT id, name FROM display_types 
        WHERE name IN ('banner_display', 'led_display')
    LOOP
        -- 각 활성화된 구에 대해
        FOR region_record IN 
            SELECT id, name FROM region_gu 
            WHERE is_active = true
        LOOP
            -- 상반기 기간 데이터 생성 (중복 방지)
            INSERT INTO region_gu_display_periods (
                display_type_id, 
                region_gu_id, 
                period_from, 
                period_to, 
                year_month, 
                half_period
            )
            SELECT 
                display_type_record.id,
                region_record.id,
                target_date,
                (target_date + INTERVAL '1 month - 1 day')::DATE,
                target_year_month,
                'first_half'
            WHERE NOT EXISTS (
                SELECT 1 FROM region_gu_display_periods 
                WHERE display_type_id = display_type_record.id
                  AND region_gu_id = region_record.id
                  AND year_month = target_year_month
                  AND half_period = 'first_half'
            );
            
            -- 하반기 기간 데이터 생성 (중복 방지)
            INSERT INTO region_gu_display_periods (
                display_type_id, 
                region_gu_id, 
                period_from, 
                period_to, 
                year_month, 
                half_period
            )
            SELECT 
                display_type_record.id,
                region_record.id,
                target_date,
                (target_date + INTERVAL '1 month - 1 day')::DATE,
                target_year_month,
                'second_half'
            WHERE NOT EXISTS (
                SELECT 1 FROM region_gu_display_periods 
                WHERE display_type_id = display_type_record.id
                  AND region_gu_id = region_record.id
                  AND year_month = target_year_month
                  AND half_period = 'second_half'
            );
            
            RAISE NOTICE '구 %에 % 타입 기간 데이터 생성 완료', 
                region_record.name, display_type_record.name;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '대상 월 기간 생성 완료: %', target_year_month;
END;

--9. insert_led_panel_bulk

DECLARE
    new_panel_id UUID;
    v_display_type_id UUID;
BEGIN
    -- Get the display_type_id for 'led_display'
    SELECT id INTO v_display_type_id FROM display_types WHERE name = 'led_display' LIMIT 1;

    -- Step 1: Insert into panel_info
    INSERT INTO panel_info (
        display_type_id,
        panel_code,
        region_gu_id,
        region_dong_id,
        address,
        nickname,
        panel_status,
        panel_type
    )
    VALUES (
        v_display_type_id,
        p_panel_code,
        p_gu_id,
        p_region_dong_id,
        p_address,
        p_nickname,
        'active',
        'led'
    )
    RETURNING id INTO new_panel_id;

    -- Step 2: Insert into led_panel_details
    INSERT INTO led_panel_details (
        panel_info_id,
        exposure_count,
        max_banners,
        panel_width,
        panel_height
    )
    VALUES (
        new_panel_id,
        0,     -- exposure_count를 0으로 설정
        20,    -- max_banners 기본값
        p_slot_width_px,
        p_slot_height_px
    );

    -- Step 3: Insert into led_slot_info
    INSERT INTO led_slot_info (
        panel_info_id,
        slot_number,
        slot_width_px,
        slot_height_px,
        position_x,
        position_y,
        total_price,
        tax_price,
        advertising_fee,
        road_usage_fee,
        administrative_fee,
        price_unit,
        panel_slot_status
    )
    VALUES (
        new_panel_id,
        1,     -- slot_number를 1로 설정
        p_slot_width_px,
        p_slot_height_px,
        0,
        0,
        p_total_price,
        p_tax_price,
        p_advertising_fee,
        p_road_usage_fee,
        p_administrative_fee,
        p_price_unit,
        'available'
    );
END;

-- 10.insert_mapo_bulletin_board


DECLARE
    new_panel_id UUID;
    v_display_type_id UUID;
    slot_num INTEGER;
BEGIN
    -- Get the display_type_id for 'banner_display'
    SELECT id INTO v_display_type_id FROM display_types WHERE name = 'banner_display' LIMIT 1;

    -- Step 1: Insert into panel_info
    INSERT INTO panel_info (
        display_type_id,
        panel_code,
        region_gu_id,
        region_dong_id,
        address,
        nickname,
        panel_status,
        panel_type
    )
    VALUES (
        v_display_type_id,
        p_panel_code,
        p_gu_id,
        p_region_dong_id,
        p_address,
        p_nickname,
        'active',
        'bulletin-board'
    )
    RETURNING id INTO new_panel_id;

    -- Step 2: Insert into banner_panel_details
    INSERT INTO banner_panel_details (
        panel_info_id,
        max_banners,
        is_for_admin -- 상업용
    )
    VALUES (
        new_panel_id,
        p_max_banners,
        FALSE 
    );

    -- Step 3: Insert into banner_slot_info, creating 12 slots per panel
    FOR slot_num IN 1..12 LOOP
        INSERT INTO banner_slot_info (
            panel_info_id,
            slot_number,
            total_price,
            tax_price,
            advertising_fee,
            road_usage_fee,
            banner_type,
            price_unit
        )
        VALUES (
            new_panel_id,
            slot_num, -- slot_number from 1 to 12
            NULL, -- total_price is null
            p_tax_price,
            NULL, -- advertising_fee is null
            NULL, -- road_usage_fee is null
            p_banner_type,
            p_price_unit
        );
    END LOOP;
END;

-- 11. insert_mapo_citizen_bulletin


DECLARE
    new_panel_id UUID;
    v_display_type_id UUID;
    slot_num INTEGER;
BEGIN
    -- Get the display_type_id for 'banner_display'
    SELECT id INTO v_display_type_id FROM display_types WHERE name = 'banner_display' LIMIT 1;

    -- Step 1: Insert into panel_info
    INSERT INTO panel_info (
        display_type_id,
        panel_code,
        region_gu_id,
        region_dong_id,
        address,
        nickname,
        panel_status,
        panel_type
    )
    VALUES (
        v_display_type_id,
        p_panel_code,
        p_gu_id,
        p_region_dong_id,
        p_address,
        p_nickname,
        'active',
        'bulletin-board'
    )
    RETURNING id INTO new_panel_id;

    -- Step 2: Insert into banner_panel_details
    INSERT INTO banner_panel_details (
        panel_info_id,
        max_banners,
        panel_width,
        panel_height,
        is_for_admin
    )
    VALUES (
        new_panel_id,
        p_max_banners,
        p_width,
        p_height,
        TRUE 
    );

    -- Step 3: Insert into banner_slot_info, create slots based on max_banners
    FOR slot_num IN 1..p_max_banners LOOP
        INSERT INTO banner_slot_info (
            panel_info_id,
            slot_number,
            max_width,
            max_height,
            total_price,
            tax_price,
            advertising_fee,
            road_usage_fee,
            banner_type,
            price_unit
        )
        VALUES (
            new_panel_id,
            slot_num,
            p_width,
            p_height,
            p_total_price,
            p_tax_price,
            p_advertising_fee,
            p_road_usage_fee,
            p_banner_type,
            p_price_unit
        );
    END LOOP;
END;


-- 12.insert_mapo_lower_panel


DECLARE
    new_panel_id UUID;
    v_display_type_id UUID;
    slot_num INTEGER;
BEGIN
    -- Get the display_type_id for 'banner_display'
    SELECT id INTO v_display_type_id FROM display_types WHERE name = 'banner_display' LIMIT 1;

    -- Step 1: Insert into panel_info
    INSERT INTO panel_info (
        display_type_id,
        panel_code,
        region_gu_id,
        region_dong_id,
        address,
        nickname,
        panel_status,
        panel_type
    )
    VALUES (
        v_display_type_id,
        p_panel_code,
        p_gu_id,
        p_region_dong_id,
        p_address,
        p_nickname,
        'active',
        'lower-panel'
    )
    RETURNING id INTO new_panel_id;

    -- Step 2: Insert into banner_panel_details
    INSERT INTO banner_panel_details (
        panel_info_id,
        max_banners,
        panel_width,
        panel_height,
        is_for_admin -- 상업용
    )
    VALUES (
        new_panel_id,
        p_max_banners,
        p_width,
        p_height,
        FALSE 
    );

    -- Step 3: Insert into banner_slot_info, create slots based on max_banners
    FOR slot_num IN 1..p_max_banners LOOP
        INSERT INTO banner_slot_info (
            panel_info_id,
            slot_number,
            max_width,
            max_height,
            total_price,
            tax_price,
            advertising_fee,
            road_usage_fee,
            banner_type,
            price_unit
        )
        VALUES (
            new_panel_id,
            slot_num,
            p_width,
            p_height,
            p_total_price,
            p_tax_price,
            p_advertising_fee,
            p_road_usage_fee,
            p_banner_type,
            p_price_unit
        );
    END LOOP;
END;

-- 13.insert_mapo_multi_panel

DECLARE
    new_panel_id UUID;
    v_display_type_id UUID;
BEGIN
    -- Get the display_type_id for 'banner_display'
    SELECT id INTO v_display_type_id FROM display_types WHERE name = 'banner_display' LIMIT 1;

    -- Step 1: Insert into panel_info
    INSERT INTO panel_info (
        display_type_id,
        panel_code,
        region_gu_id,
        region_dong_id,
        address,
        nickname,
        panel_status,
        panel_type
    )
    VALUES (
        v_display_type_id,
        p_panel_code,
        p_gu_id,
        p_region_dong_id,
        p_address,
        p_nickname,
        'active',
        'multi-panel'
    )
    RETURNING id INTO new_panel_id;

    -- Step 2: Insert into banner_panel_details
    INSERT INTO banner_panel_details (
        panel_info_id,
        max_banners,
        panel_width,
        panel_height,
        is_for_admin -- 상업용
    )
    VALUES (
        new_panel_id,
        p_max_banners,
        p_width,
        p_height,
        FALSE 
    );

    -- Step 3: Insert into banner_slot_info, assuming one primary slot per panel
    INSERT INTO banner_slot_info (
        panel_info_id,
        slot_number,
        max_width,
        max_height,
        total_price,
        tax_price,
        advertising_fee,
        road_usage_fee,
        banner_type,
        price_unit
    )
    VALUES (
        new_panel_id,
        1, -- Assuming slot #1 for each panel
        p_width,
        p_height,
        p_total_price,
        p_tax_price,
        p_advertising_fee,
        p_road_usage_fee,
        p_banner_type,
        p_price_unit
    );
END;


-- 14.insert_songpa_banner

DECLARE
    new_panel_id UUID;
    v_display_type_id UUID;
BEGIN
    -- Get the display_type_id for 'banner_display'
    SELECT id INTO v_display_type_id FROM display_types WHERE name = 'banner_display' LIMIT 1;

    -- Step 1: Insert into panel_info (casting panel_code to int2)
    INSERT INTO panel_info (
        display_type_id,
        panel_code,
        region_gu_id,
        region_dong_id,
        address,
        nickname,
        panel_status
    )
    VALUES (
        v_display_type_id,
        p_panel_code::int2, -- Cast TEXT to int2
        p_gu_id,
        p_region_dong_id,
        p_address,
        p_nickname,
        'active'
    )
    RETURNING id INTO new_panel_id;

    -- Step 2: Insert into banner_panel_details
    INSERT INTO banner_panel_details (
        panel_info_id,
        max_banners,
        is_for_admin -- 상업용
    )
    VALUES (
        new_panel_id,
        p_max_banners,
        FALSE 
    );

    -- Step 3: Insert into banner_slot_info, assuming one primary slot per panel
    INSERT INTO banner_slot_info (
        panel_info_id,
        slot_number,
        max_width,
        max_height,
        total_price,
        banner_type,
        price_unit
    )
    VALUES (
        new_panel_id,
        1, -- Assuming slot #1 for each panel
        p_width,
        p_height,
        p_total_price,
        p_banner_type,
        p_price_unit
    );
END;

-- 15. insert_yongsan_banner


DECLARE
    new_panel_id UUID;
    v_display_type_id UUID;
BEGIN
    -- Get the display_type_id for 'banner_display'
    SELECT id INTO v_display_type_id FROM display_types WHERE name = 'banner_display' LIMIT 1;

    -- Step 1: Insert into panel_info
    INSERT INTO panel_info (
        display_type_id,
        post_code,
        region_gu_id,
        region_dong_id,
        address,
        nickname,
        panel_status
    )
    VALUES (
        v_display_type_id,
        p_post_code,
        p_gu_id,
        p_region_dong_id,
        p_address,
        p_nickname,
        'active'
    )
    RETURNING id INTO new_panel_id;

    -- Step 2: Insert into banner_panel_details
    INSERT INTO banner_panel_details (
        panel_info_id,
        max_banners,
        is_for_admin -- 상업용
    )
    VALUES (
        new_panel_id,
        p_max_banners,
        FALSE 
    );

    -- Step 3: Insert into banner_slot_info, assuming one primary slot per panel
    INSERT INTO banner_slot_info (
        panel_info_id,
        slot_number,
        max_width,
        max_height,
        total_price,
        banner_type,
        price_unit
    )
    VALUES (
        new_panel_id,
        1, -- Assuming slot #1 for each panel
        p_width,
        p_height,
        p_total_price,
        p_banner_type,
        '15 days' -- Using the only valid enum '15 days'. Price might not match unit.
    );
END;

-- 16.prevent_duplicate_banner_booking

DECLARE
  conflicting_usage RECORD;
BEGIN
  -- banner_type이 'top_fixed'가 아닌 경우에만 중복 확인 (일반 현수막게시대)
  IF NEW.banner_type != 'top_fixed' THEN
    -- 같은 패널의 같은 슬롯이 같은 기간에 이미 예약되어 있는지 확인
    SELECT ps.id INTO conflicting_usage
    FROM panel_slot_usage ps
    WHERE ps.panel_info_id = NEW.panel_info_id
      AND ps.slot_number = NEW.slot_number
      AND ps.is_active = true
      AND ps.is_closed = false
      AND ps.banner_type != 'top_fixed'
      AND (
        (ps.attach_date_from <= NEW.attach_date_from AND ps.attach_date_from + INTERVAL '15 days' >= NEW.attach_date_from)
        OR (ps.attach_date_from >= NEW.attach_date_from AND ps.attach_date_from <= NEW.attach_date_from + INTERVAL '15 days')
      );
    
    IF FOUND THEN
      RAISE EXCEPTION '선택한 기간에 이미 예약된 슬롯입니다. (conflicting_usage_id: %)', conflicting_usage.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;


--17.restore_banner_slot_inventory_on_order_delete


DECLARE
  period_id UUID;
BEGIN
  -- order_details의 display_start_date와 display_end_date를 기반으로 해당하는 기간 찾기
  SELECT rgdp.id INTO period_id
  FROM region_gu_display_periods rgdp
  JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = OLD.panel_info_id
    AND rgdp.display_type_id = pi.display_type_id
    AND (
      -- 기간이 완전히 겹치는 경우
      (OLD.display_start_date >= rgdp.period_from AND OLD.display_end_date <= rgdp.period_to)
      OR
      -- 기간이 부분적으로 겹치는 경우
      (OLD.display_start_date <= rgdp.period_to AND OLD.display_end_date >= rgdp.period_from)
    );
  
  -- 해당 기간의 재고 복구
  IF period_id IS NOT NULL THEN
    UPDATE banner_slot_inventory 
    SET 
      available_slots = LEAST(total_slots, available_slots + OLD.slot_order_quantity),
      closed_slots = GREATEST(0, closed_slots - OLD.slot_order_quantity),
      updated_at = NOW()
    WHERE panel_info_id = OLD.panel_info_id
      AND region_gu_display_period_id = period_id;
  END IF;
  
  RETURN OLD;
END;

--18. update_banner_slot_inventory_on_order


DECLARE
  period_id UUID;
  panel_record RECORD;
BEGIN
  -- order_details의 display_start_date와 display_end_date를 기반으로 해당하는 기간 찾기
  SELECT rgdp.id INTO period_id
  FROM region_gu_display_periods rgdp
  JOIN panel_info pi ON pi.region_gu_id = rgdp.region_gu_id
  WHERE pi.id = NEW.panel_info_id
    AND rgdp.display_type_id = pi.display_type_id
    AND (
      -- 기간이 완전히 겹치는 경우
      (NEW.display_start_date >= rgdp.period_from AND NEW.display_end_date <= rgdp.period_to)
      OR
      -- 기간이 부분적으로 겹치는 경우
      (NEW.display_start_date <= rgdp.period_to AND NEW.display_end_date >= rgdp.period_from)
    );
  
  -- 해당 기간의 재고 업데이트
  IF period_id IS NOT NULL THEN
    UPDATE banner_slot_inventory 
    SET 
      available_slots = GREATEST(0, available_slots - NEW.slot_order_quantity),
      closed_slots = closed_slots + NEW.slot_order_quantity,
      updated_at = NOW()
    WHERE panel_info_id = NEW.panel_info_id
      AND region_gu_display_period_id = period_id;
    
    -- 재고 정보가 없으면 새로 생성
    IF NOT FOUND THEN
      SELECT * INTO panel_record FROM panel_info WHERE id = NEW.panel_info_id;
      INSERT INTO banner_slot_inventory (
        panel_info_id,
        region_gu_display_period_id,
        total_slots,
        available_slots,
        closed_slots
      )
      VALUES (
        NEW.panel_info_id,
        period_id,
        panel_record.max_banner,
        GREATEST(0, panel_record.max_banner - NEW.slot_order_quantity),
        NEW.slot_order_quantity
      );
    END IF;
  ELSE
    -- 기간을 찾지 못한 경우 로그 출력 (디버깅용)
    RAISE NOTICE '기간을 찾을 수 없음: panel_info_id=%, display_start_date=%, display_end_date=%', 
      NEW.panel_info_id, NEW.display_start_date, NEW.display_end_date;
  END IF;
  
  RETURN NEW;
END;

--19.update_top_fixed_banner_inventory

BEGIN
  -- Check if this is a top-fixed banner (slot_number = 0)
  IF EXISTS (
    SELECT 1 FROM banner_slot_info 
    WHERE id = NEW.banner_slot_info_id 
    AND slot_number = 0
    AND banner_type = 'top_fixed'
  ) THEN
    -- Update top_fixed_banner_inventory to mark all periods as unavailable for this panel
    UPDATE top_fixed_banner_inventory 
    SET available_slots = 0,
        updated_at = NOW()
    WHERE panel_info_id = NEW.panel_info_id;
  END IF;
  
  RETURN NEW;
END;

--20.update_updated_at_column

BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;




------------------
-------트리거-------
------------------
Name	Table	Function	Events	Orientation	Enabled	
banner_inventory_delete_trigger	
order_details

restore_banner_slot_inventory_on_order_delete

AFTER DELETE
ROW


banner_inventory_insert_trigger	
order_details

update_banner_slot_inventory_on_order

AFTER INSERT
ROW


duplicate_banner_booking_trigger	
panel_slot_usage

prevent_duplicate_banner_booking

BEFORE INSERT
ROW


inventory_check_trigger	
order_details

check_inventory_before_order

BEFORE INSERT
ROW


trigger_fill_panel_slot_snapshot_after_order_details	
order_details

fill_panel_slot_snapshot_after_order_details

AFTER INSERT
ROW


trigger_update_top_fixed_banner_inventory	
panel_slot_usage

update_top_fixed_banner_inventory

AFTER INSERT
ROW


update_banner_panel_details_updated_at	
banner_panel_details

update_updated_at_column

BEFORE UPDATE
ROW


update_banner_slot_info_updated_at	
banner_slot_info

update_updated_at_column

BEFORE UPDATE
ROW


update_customer_inquiries_updated_at	
customer_inquiries

update_updated_at_column

BEFORE UPDATE
ROW


update_customer_service_updated_at	
customer_service

update_updated_at_column

BEFORE UPDATE
ROW


update_display_types_updated_at	
display_types

update_updated_at_column

BEFORE UPDATE
ROW


update_homepage_contents_updated_at	
homepage_contents

update_updated_at_column

BEFORE UPDATE
ROW


update_homepage_menu_types_updated_at	
homepage_menu_types

update_updated_at_column

BEFORE UPDATE
ROW


update_homepage_notice_updated_at	
homepage_notice

update_updated_at_column

BEFORE UPDATE
ROW


update_led_panel_details_updated_at	
led_panel_details

update_updated_at_column

BEFORE UPDATE
ROW


update_led_slot_info_updated_at	
led_slot_info

update_updated_at_column

BEFORE UPDATE
ROW


update_notice_categories_updated_at	
notice_categories

update_updated_at_column

BEFORE UPDATE
ROW


update_order_details_updated_at	
order_details

update_updated_at_column

BEFORE UPDATE
ROW


update_orders_updated_at	
orders

update_updated_at_column

BEFORE UPDATE
ROW


update_panel_guideline_updated_at	
panel_guideline

update_updated_at_column

BEFORE UPDATE
ROW


update_panel_info_updated_at	
panel_info

update_updated_at_column

BEFORE UPDATE
ROW


update_panel_popup_notices_updated_at	
panel_popup_notices

update_updated_at_column

BEFORE UPDATE
ROW


update_panel_slot_usage_updated_at	
panel_slot_usage

update_updated_at_column

BEFORE UPDATE
ROW


update_region_dong_updated_at	
region_dong

update_updated_at_column

BEFORE UPDATE
ROW


update_region_gu_display_periods_updated_at	
region_gu_display_periods

update_updated_at_column

BEFORE UPDATE
ROW


update_region_gu_updated_at	
region_gu

update_updated_at_column

BEFORE UPDATE
ROW


update_user_auth_updated_at	
user_auth

update_updated_at_column

BEFORE UPDATE
ROW





