-- =================================================================
-- 1. orders 테이블에 user_id 컬럼 추가 (이미 추가되어 있다면 무시)
-- =================================================================

-- orders 테이블에 user_id 컬럼 추가 (user_auth 테이블 참조)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES user_auth(id);

-- =================================================================
-- 2. 특정 상품들을 찾아서 주문 데이터 생성
-- =================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_mapo_bulletin_id UUID;      -- 마포구 시민게시대
    v_songpa_panel_id UUID;       -- 송파구 패널
    v_yongsan_lighting_id UUID;   -- 용산구 조명용
    v_yongsan_no_lighting_id UUID; -- 용산구 비조명용
    v_mapo_lower_id UUID;         -- 마포구 저단형
    v_mapo_multi_id UUID;         -- 마포구 연립형
    v_seodaemun_admin_id UUID;    -- 서대문구 행정용
    v_led_panel_id UUID;          -- LED 게시대
    v_order_id UUID;
BEGIN
    -- 테스트 사용자 ID 가져오기
    SELECT id INTO v_user_id FROM user_auth LIMIT 1;
    
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
    
    -- 3. 용산구 조명용 찾기 (with_lighting)
    SELECT pi.id INTO v_yongsan_lighting_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '용산구' AND pi.panel_type = 'with_lighting' 
    LIMIT 1;
    
    -- 4. 용산구 비조명용 찾기 (no_lighting)
    SELECT pi.id INTO v_yongsan_no_lighting_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '용산구' AND pi.panel_type = 'no_lighting' 
    LIMIT 1;
    
    -- 5. 마포구 저단형 찾기 (lower-panel)
    SELECT pi.id INTO v_mapo_lower_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '마포구' AND pi.panel_type = 'lower-panel' 
    LIMIT 1;
    
    -- 6. 마포구 연립형 찾기 (multi-panel)
    SELECT pi.id INTO v_mapo_multi_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '마포구' AND pi.panel_type = 'multi-panel' 
    LIMIT 1;
    
    -- 7. 서대문구 행정용 찾기 (admin 타입)
    SELECT pi.id INTO v_seodaemun_admin_id 
    FROM panel_info pi 
    JOIN region_gu rg ON pi.region_gu_id = rg.id 
    WHERE rg.name = '서대문구' 
    LIMIT 1;
    
    -- 8. LED 게시대 찾기
    SELECT pi.id INTO v_led_panel_id 
    FROM panel_info pi 
    WHERE pi.panel_type = 'led' 
    LIMIT 1;
    
    RAISE NOTICE '찾은 패널 정보:';
    RAISE NOTICE '마포구 시민게시대: %', v_mapo_bulletin_id;
    RAISE NOTICE '송파구 패널: %', v_songpa_panel_id;
    RAISE NOTICE '용산구 조명용: %', v_yongsan_lighting_id;
    RAISE NOTICE '용산구 비조명용: %', v_yongsan_no_lighting_id;
    RAISE NOTICE '마포구 저단형: %', v_mapo_lower_id;
    RAISE NOTICE '마포구 연립형: %', v_mapo_multi_id;
    RAISE NOTICE '서대문구 행정용: %', v_seodaemun_admin_id;
    RAISE NOTICE 'LED 게시대: %', v_led_panel_id;
    
    -- =================================================================
    -- 주문 1: 마포구 시민게시대 (포스터 지참 후 방문 신청)
    -- =================================================================
    IF v_mapo_bulletin_id IS NOT NULL THEN
        INSERT INTO orders (
            id,
            user_id,
            panel_info_id,
            total_price,
            depositor_name,
            deposit_date,
            is_paid,
            is_checked,
            payment_method,
            is_received_order,
            is_received_paymenet,
            is_draft_sent,
            is_draft_received,
            is_address_verified,
            is_draft_verified,
            display_location,
            received_payment_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            v_mapo_bulletin_id,
            0, -- 포스터 지참 후 방문 신청이므로 가격 0
            '테스트',
            CURRENT_DATE - INTERVAL '3 days',
            true,
            true,
            'bank_transfer',
            true,
            true,
            true,
            true,
            true,
            true,
            '마포구 시민게시대',
            CURRENT_TIMESTAMP - INTERVAL '3 days',
            CURRENT_TIMESTAMP - INTERVAL '3 days',
            CURRENT_TIMESTAMP - INTERVAL '3 days'
        ) RETURNING id INTO v_order_id;
        
        -- 주문 상세 정보
        INSERT INTO order_details (
            id,
            order_id,
            slot_order_quantity,
            display_start_date,
            display_end_date,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_order_id,
            1,
            CURRENT_DATE + INTERVAL '5 days',
            CURRENT_DATE + INTERVAL '20 days',
            CURRENT_TIMESTAMP - INTERVAL '3 days',
            CURRENT_TIMESTAMP - INTERVAL '3 days'
        );
        
        RAISE NOTICE '마포구 시민게시대 주문 생성 완료';
    END IF;
    
    -- =================================================================
    -- 주문 2: 송파구 상담문의
    -- =================================================================
    IF v_songpa_panel_id IS NOT NULL THEN
        INSERT INTO orders (
            id,
            user_id,
            panel_info_id,
            total_price,
            depositor_name,
            deposit_date,
            is_paid,
            is_checked,
            payment_method,
            is_received_order,
            is_received_paymenet,
            is_draft_sent,
            is_draft_received,
            is_address_verified,
            is_draft_verified,
            display_location,
            received_payment_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            v_songpa_panel_id,
            0, -- 상담문의이므로 가격 0
            '테스트',
            NULL,
            false,
            false,
            'bank_transfer',
            true,
            false,
            true,
            true,
            true,
            true,
            '송파구 상담문의',
            NULL,
            CURRENT_TIMESTAMP - INTERVAL '1 day',
            CURRENT_TIMESTAMP - INTERVAL '1 day'
        ) RETURNING id INTO v_order_id;
        
        -- 주문 상세 정보
        INSERT INTO order_details (
            id,
            order_id,
            slot_order_quantity,
            display_start_date,
            display_end_date,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_order_id,
            1,
            CURRENT_DATE + INTERVAL '10 days',
            CURRENT_DATE + INTERVAL '40 days',
            CURRENT_TIMESTAMP - INTERVAL '1 day',
            CURRENT_TIMESTAMP - INTERVAL '1 day'
        );
        
        RAISE NOTICE '송파구 상담문의 주문 생성 완료';
    END IF;
    
    -- =================================================================
    -- 주문 3: 용산구 조명용
    -- =================================================================
    IF v_yongsan_lighting_id IS NOT NULL THEN
        INSERT INTO orders (
            id,
            user_id,
            panel_info_id,
            total_price,
            depositor_name,
            deposit_date,
            is_paid,
            is_checked,
            payment_method,
            is_received_order,
            is_received_paymenet,
            is_draft_sent,
            is_draft_received,
            is_address_verified,
            is_draft_verified,
            display_location,
            received_payment_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            v_yongsan_lighting_id,
            150000, -- 용산구 조명용 가격
            '테스트',
            CURRENT_DATE - INTERVAL '7 days',
            true,
            true,
            'bank_transfer',
            true,
            true,
            true,
            true,
            true,
            true,
            '용산구 조명용',
            CURRENT_TIMESTAMP - INTERVAL '7 days',
            CURRENT_TIMESTAMP - INTERVAL '7 days',
            CURRENT_TIMESTAMP - INTERVAL '7 days'
        ) RETURNING id INTO v_order_id;
        
        -- 주문 상세 정보
        INSERT INTO order_details (
            id,
            order_id,
            slot_order_quantity,
            display_start_date,
            display_end_date,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_order_id,
            1,
            CURRENT_DATE + INTERVAL '8 days',
            CURRENT_DATE + INTERVAL '23 days',
            CURRENT_TIMESTAMP - INTERVAL '7 days',
            CURRENT_TIMESTAMP - INTERVAL '7 days'
        );
        
        RAISE NOTICE '용산구 조명용 주문 생성 완료';
    END IF;
    
    -- =================================================================
    -- 주문 4: 용산구 비조명용
    -- =================================================================
    IF v_yongsan_no_lighting_id IS NOT NULL THEN
        INSERT INTO orders (
            id,
            user_id,
            panel_info_id,
            total_price,
            depositor_name,
            deposit_date,
            is_paid,
            is_checked,
            payment_method,
            is_received_order,
            is_received_paymenet,
            is_draft_sent,
            is_draft_received,
            is_address_verified,
            is_draft_verified,
            display_location,
            received_payment_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            v_yongsan_no_lighting_id,
            120000, -- 용산구 비조명용 가격
            '테스트',
            CURRENT_DATE - INTERVAL '10 days',
            true,
            true,
            'bank_transfer',
            true,
            true,
            true,
            true,
            true,
            true,
            '용산구 비조명용',
            CURRENT_TIMESTAMP - INTERVAL '10 days',
            CURRENT_TIMESTAMP - INTERVAL '10 days',
            CURRENT_TIMESTAMP - INTERVAL '10 days'
        ) RETURNING id INTO v_order_id;
        
        -- 주문 상세 정보
        INSERT INTO order_details (
            id,
            order_id,
            slot_order_quantity,
            display_start_date,
            display_end_date,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_order_id,
            1,
            CURRENT_DATE - INTERVAL '5 days',
            CURRENT_DATE + INTERVAL '10 days',
            CURRENT_TIMESTAMP - INTERVAL '10 days',
            CURRENT_TIMESTAMP - INTERVAL '10 days'
        );
        
        RAISE NOTICE '용산구 비조명용 주문 생성 완료';
    END IF;
    
    -- =================================================================
    -- 주문 5: 마포구 저단형
    -- =================================================================
    IF v_mapo_lower_id IS NOT NULL THEN
        INSERT INTO orders (
            id,
            user_id,
            panel_info_id,
            total_price,
            depositor_name,
            deposit_date,
            is_paid,
            is_checked,
            payment_method,
            is_received_order,
            is_received_paymenet,
            is_draft_sent,
            is_draft_received,
            is_address_verified,
            is_draft_verified,
            display_location,
            received_payment_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            v_mapo_lower_id,
            100000, -- 마포구 저단형 가격
            '테스트',
            CURRENT_DATE - INTERVAL '15 days',
            true,
            true,
            'bank_transfer',
            true,
            true,
            true,
            true,
            true,
            true,
            '마포구 저단형',
            CURRENT_TIMESTAMP - INTERVAL '15 days',
            CURRENT_TIMESTAMP - INTERVAL '15 days',
            CURRENT_TIMESTAMP - INTERVAL '15 days'
        ) RETURNING id INTO v_order_id;
        
        -- 주문 상세 정보
        INSERT INTO order_details (
            id,
            order_id,
            slot_order_quantity,
            display_start_date,
            display_end_date,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_order_id,
            1,
            CURRENT_DATE - INTERVAL '10 days',
            CURRENT_DATE + INTERVAL '5 days',
            CURRENT_TIMESTAMP - INTERVAL '15 days',
            CURRENT_TIMESTAMP - INTERVAL '15 days'
        );
        
        RAISE NOTICE '마포구 저단형 주문 생성 완료';
    END IF;
    
    -- =================================================================
    -- 주문 6: 마포구 연립형
    -- =================================================================
    IF v_mapo_multi_id IS NOT NULL THEN
        INSERT INTO orders (
            id,
            user_id,
            panel_info_id,
            total_price,
            depositor_name,
            deposit_date,
            is_paid,
            is_checked,
            payment_method,
            is_received_order,
            is_received_paymenet,
            is_draft_sent,
            is_draft_received,
            is_address_verified,
            is_draft_verified,
            display_location,
            received_payment_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            v_mapo_multi_id,
            130000, -- 마포구 연립형 가격
            '테스트',
            CURRENT_DATE - INTERVAL '20 days',
            true,
            true,
            'bank_transfer',
            true,
            true,
            true,
            true,
            true,
            true,
            '마포구 연립형',
            CURRENT_TIMESTAMP - INTERVAL '20 days',
            CURRENT_TIMESTAMP - INTERVAL '20 days',
            CURRENT_TIMESTAMP - INTERVAL '20 days'
        ) RETURNING id INTO v_order_id;
        
        -- 주문 상세 정보
        INSERT INTO order_details (
            id,
            order_id,
            slot_order_quantity,
            display_start_date,
            display_end_date,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_order_id,
            1,
            CURRENT_DATE - INTERVAL '15 days',
            CURRENT_DATE,
            CURRENT_TIMESTAMP - INTERVAL '20 days',
            CURRENT_TIMESTAMP - INTERVAL '20 days'
        );
        
        RAISE NOTICE '마포구 연립형 주문 생성 완료';
    END IF;
    
    -- =================================================================
    -- 주문 7: 서대문구 행정용
    -- =================================================================
    IF v_seodaemun_admin_id IS NOT NULL THEN
        INSERT INTO orders (
            id,
            user_id,
            panel_info_id,
            total_price,
            depositor_name,
            deposit_date,
            is_paid,
            is_checked,
            payment_method,
            is_received_order,
            is_received_paymenet,
            is_draft_sent,
            is_draft_received,
            is_address_verified,
            is_draft_verified,
            display_location,
            received_payment_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            v_seodaemun_admin_id,
            80000, -- 서대문구 행정용 가격
            '테스트',
            CURRENT_DATE - INTERVAL '25 days',
            true,
            true,
            'bank_transfer',
            true,
            true,
            true,
            true,
            true,
            true,
            '서대문구 행정용',
            CURRENT_TIMESTAMP - INTERVAL '25 days',
            CURRENT_TIMESTAMP - INTERVAL '25 days',
            CURRENT_TIMESTAMP - INTERVAL '25 days'
        ) RETURNING id INTO v_order_id;
        
        -- 주문 상세 정보
        INSERT INTO order_details (
            id,
            order_id,
            slot_order_quantity,
            display_start_date,
            display_end_date,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_order_id,
            1,
            CURRENT_DATE - INTERVAL '20 days',
            CURRENT_DATE - INTERVAL '5 days',
            CURRENT_TIMESTAMP - INTERVAL '25 days',
            CURRENT_TIMESTAMP - INTERVAL '25 days'
        );
        
        RAISE NOTICE '서대문구 행정용 주문 생성 완료';
    END IF;
    
    -- =================================================================
    -- 주문 8: LED 게시대
    -- =================================================================
    IF v_led_panel_id IS NOT NULL THEN
        INSERT INTO orders (
            id,
            user_id,
            panel_info_id,
            total_price,
            depositor_name,
            deposit_date,
            is_paid,
            is_checked,
            payment_method,
            is_received_order,
            is_received_paymenet,
            is_draft_sent,
            is_draft_received,
            is_address_verified,
            is_draft_verified,
            display_location,
            received_payment_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            v_led_panel_id,
            561000, -- LED 게시대 가격
            '테스트',
            CURRENT_DATE - INTERVAL '30 days',
            true,
            true,
            'bank_transfer',
            true,
            true,
            true,
            true,
            true,
            true,
            'LED 게시대',
            CURRENT_TIMESTAMP - INTERVAL '30 days',
            CURRENT_TIMESTAMP - INTERVAL '30 days',
            CURRENT_TIMESTAMP - INTERVAL '30 days'
        ) RETURNING id INTO v_order_id;
        
        -- 주문 상세 정보
        INSERT INTO order_details (
            id,
            order_id,
            slot_order_quantity,
            display_start_date,
            display_end_date,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_order_id,
            1,
            CURRENT_DATE - INTERVAL '25 days',
            CURRENT_DATE - INTERVAL '10 days',
            CURRENT_TIMESTAMP - INTERVAL '30 days',
            CURRENT_TIMESTAMP - INTERVAL '30 days'
        );
        
        RAISE NOTICE 'LED 게시대 주문 생성 완료';
    END IF;
    
    RAISE NOTICE '모든 특정 상품 주문 데이터 생성 완료!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '오류 발생: %', SQLERRM;
END $$;

-- =================================================================
-- 3. 생성된 데이터 확인
-- =================================================================

-- 주문 데이터 확인 (상품별 구분)
SELECT 
    o.id,
    o.total_price,
    o.depositor_name,
    o.deposit_date,
    o.is_paid,
    o.is_checked,
    o.payment_method,
    o.display_location,
    o.created_at,
    pi.nickname as panel_name,
    pi.address as panel_address,
    pi.panel_type,
    rg.name as region_name,
    ua.name as user_name,
    ua.email as user_email,
    CASE 
        WHEN o.total_price = 0 AND pi.panel_type = 'bulletin-board' THEN '포스터 지참 후 방문 신청'
        WHEN o.total_price = 0 AND rg.name IN ('송파구', '용산구') THEN '상담문의'
        ELSE o.total_price::text || '원'
    END as price_display
FROM orders o
JOIN panel_info pi ON o.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN user_auth ua ON o.user_id = ua.id
ORDER BY o.created_at DESC;

-- 주문 상세 정보 확인
SELECT 
    od.id,
    od.order_id,
    od.slot_order_quantity,
    od.display_start_date,
    od.display_end_date,
    o.total_price,
    o.depositor_name,
    o.payment_method,
    o.display_location,
    pi.panel_type,
    rg.name as region_name
FROM order_details od
JOIN orders o ON od.order_id = o.id
JOIN panel_info pi ON o.panel_info_id = pi.id
JOIN region_gu rg ON pi.region_gu_id = rg.id
ORDER BY od.created_at DESC; 