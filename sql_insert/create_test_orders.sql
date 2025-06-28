-- =================================================================
-- 1. orders 테이블에 user_id 컬럼 추가
-- =================================================================

-- orders 테이블에 user_id 컬럼 추가 (user_auth 테이블 참조)
ALTER TABLE orders ADD COLUMN user_id uuid REFERENCES user_auth(id);

-- =================================================================
-- 2. 테스트 주문 데이터 생성
-- =================================================================

-- 테스트 사용자 ID 가져오기 (실제 user_auth 테이블의 사용자 ID 사용)
DO $$
DECLARE
    v_user_id UUID;
    v_panel_info_id UUID;
    v_slot_info_id UUID;
    v_order_id UUID;
    v_order_detail_id UUID;
BEGIN
    -- 테스트 사용자 ID 가져오기 (첫 번째 사용자 사용)
    SELECT id INTO v_user_id FROM user_auth LIMIT 1;
    
    -- panel_info에서 첫 번째 패널 ID 가져오기
    SELECT id INTO v_panel_info_id FROM panel_info LIMIT 1;
    
    -- banner_slot_info에서 첫 번째 슬롯 ID 가져오기
    SELECT id INTO v_slot_info_id FROM banner_slot_info WHERE panel_info_id = v_panel_info_id LIMIT 1;
    
    -- 주문 1: 결제 완료된 주문
    INSERT INTO orders (
        id,
        user_id,
        panel_info_id,
        panel_slot_usage_id,
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
        v_panel_info_id,
        v_slot_info_id,
        130000,
        '테스트',
        CURRENT_DATE - INTERVAL '5 days',
        true,
        true,
        'bank_transfer',
        true,
        true,
        true,
        true,
        true,
        true,
        '마포구 상암동',
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    ) RETURNING id INTO v_order_id;
    
    -- 주문 1의 상세 정보
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
        CURRENT_DATE + INTERVAL '25 days',
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    );
    
    -- 주문 2: 결제 대기 중인 주문
    INSERT INTO orders (
        id,
        user_id,
        panel_info_id,
        panel_slot_usage_id,
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
        v_panel_info_id,
        v_slot_info_id,
        561000,
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
        '강동구 천호동',
        NULL,
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ) RETURNING id INTO v_order_id;
    
    -- 주문 2의 상세 정보
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
        CURRENT_DATE + INTERVAL '15 days',
        CURRENT_DATE + INTERVAL '45 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    );
    
    -- 주문 3: 완료된 주문 (과거)
    INSERT INTO orders (
        id,
        user_id,
        panel_info_id,
        panel_slot_usage_id,
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
        v_panel_info_id,
        v_slot_info_id,
        380600,
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
        '동작구 사당동',
        CURRENT_TIMESTAMP - INTERVAL '30 days',
        CURRENT_TIMESTAMP - INTERVAL '30 days',
        CURRENT_TIMESTAMP - INTERVAL '30 days'
    ) RETURNING id INTO v_order_id;
    
    -- 주문 3의 상세 정보
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
        CURRENT_TIMESTAMP - INTERVAL '30 days',
        CURRENT_TIMESTAMP - INTERVAL '30 days'
    );
    
    RAISE NOTICE '테스트 주문 데이터 생성 완료: 총 3개 주문';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '오류 발생: %', SQLERRM;
END $$;

-- =================================================================
-- 3. 생성된 데이터 확인
-- =================================================================

-- 주문 데이터 확인
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
    ua.name as user_name,
    ua.email as user_email
FROM orders o
JOIN panel_info pi ON o.panel_info_id = pi.id
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
    o.payment_method
FROM order_details od
JOIN orders o ON od.order_id = o.id
ORDER BY od.created_at DESC; 