-- =================================================================
-- panel_slot_snapshot 트리거 수정 (더 안정적인 버전)
-- =================================================================

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS trigger_fill_panel_slot_snapshot ON orders;
DROP FUNCTION IF EXISTS fill_panel_slot_snapshot();

-- panel_slot_snapshot을 자동으로 채우는 함수 생성 (개선된 버전)
CREATE OR REPLACE FUNCTION fill_panel_slot_snapshot()
RETURNS TRIGGER AS $$
DECLARE
    v_banner_slot_info RECORD;
    v_panel_info RECORD;
    v_snapshot JSONB;
    v_order_details_count INTEGER;
BEGIN
    -- 디버깅을 위한 로그
    RAISE NOTICE '트리거 실행: 주문 ID %', NEW.id;
    
    -- order_details가 생성될 때까지 잠시 대기 (최대 1초)
    FOR i IN 1..10 LOOP
        SELECT COUNT(*) INTO v_order_details_count
        FROM order_details 
        WHERE order_id = NEW.id;
        
        IF v_order_details_count > 0 THEN
            EXIT;
        END IF;
        
        -- 0.1초 대기
        PERFORM pg_sleep(0.1);
    END LOOP;
    
    -- order_details에서 첫 번째 아이템의 panel_info_id 가져오기
    SELECT panel_info_id, panel_slot_usage_id 
    INTO v_banner_slot_info
    FROM order_details 
    WHERE order_id = NEW.id 
    LIMIT 1;
    
    RAISE NOTICE 'order_details 조회 결과: panel_info_id = %, panel_slot_usage_id = %', 
        v_banner_slot_info.panel_info_id, v_banner_slot_info.panel_slot_usage_id;
    
    -- panel_info_id가 없으면 처리하지 않음
    IF v_banner_slot_info.panel_info_id IS NULL THEN
        RAISE NOTICE 'panel_info_id가 NULL이므로 처리 중단';
        RETURN NEW;
    END IF;
    
    -- panel_info 정보 가져오기
    SELECT * INTO v_panel_info
    FROM panel_info 
    WHERE id = v_banner_slot_info.panel_info_id;
    
    -- panel_slot_usage에서 banner_slot_info_id 가져오기
    IF v_banner_slot_info.panel_slot_usage_id IS NOT NULL THEN
        SELECT bsi.* INTO v_banner_slot_info
        FROM panel_slot_usage psu
        JOIN banner_slot_info bsi ON psu.banner_slot_info_id = bsi.id
        WHERE psu.id = v_banner_slot_info.panel_slot_usage_id;
        
        RAISE NOTICE 'panel_slot_usage에서 조회: banner_slot_info_id = %', v_banner_slot_info.id;
    ELSE
        -- panel_slot_usage가 없으면 panel_info_id로 직접 조회 (1번 슬롯 사용)
        SELECT * INTO v_banner_slot_info
        FROM banner_slot_info 
        WHERE panel_info_id = v_banner_slot_info.panel_info_id 
        AND slot_number = 1
        LIMIT 1;
        
        RAISE NOTICE 'banner_slot_info 직접 조회: id = %', v_banner_slot_info.id;
    END IF;
    
    -- banner_slot_info가 없으면 처리하지 않음
    IF v_banner_slot_info.id IS NULL THEN
        RAISE NOTICE 'banner_slot_info를 찾을 수 없으므로 처리 중단';
        RETURN NEW;
    END IF;
    
    -- panel_slot_snapshot JSONB 생성
    v_snapshot := jsonb_build_object(
        'id', v_banner_slot_info.id,
        'panel_info_id', v_banner_slot_info.panel_info_id,
        'slot_number', v_banner_slot_info.slot_number,
        'slot_name', v_banner_slot_info.slot_name,
        'max_width', v_banner_slot_info.max_width,
        'max_height', v_banner_slot_info.max_height,
        'total_price', v_banner_slot_info.total_price,
        'tax_price', v_banner_slot_info.tax_price,
        'road_usage_fee', v_banner_slot_info.road_usage_fee,
        'advertising_fee', v_banner_slot_info.advertising_fee,
        'banner_type', v_banner_slot_info.banner_type,
        'price_unit', v_banner_slot_info.price_unit,
        'is_premium', v_banner_slot_info.is_premium,
        'panel_slot_status', v_banner_slot_info.panel_slot_status,
        'notes', v_banner_slot_info.notes,
        'created_at', v_banner_slot_info.created_at,
        'updated_at', v_banner_slot_info.updated_at
    );
    
    RAISE NOTICE '생성된 스냅샷: %', v_snapshot;
    
    -- orders 테이블의 panel_slot_snapshot 업데이트
    UPDATE orders 
    SET panel_slot_snapshot = v_snapshot
    WHERE id = NEW.id;
    
    RAISE NOTICE 'panel_slot_snapshot 업데이트 완료: 주문 ID %, 패널 ID %', 
        NEW.id, v_banner_slot_info.panel_info_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- orders 테이블에 트리거 생성 (BEFORE INSERT로 변경)
CREATE TRIGGER trigger_fill_panel_slot_snapshot
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION fill_panel_slot_snapshot();

-- 추가: order_details INSERT 후에도 스냅샷을 업데이트하는 트리거
CREATE OR REPLACE FUNCTION update_snapshot_after_order_details()
RETURNS TRIGGER AS $$
DECLARE
    v_banner_slot_info RECORD;
    v_snapshot JSONB;
BEGIN
    -- banner_slot_info 조회
    IF NEW.panel_slot_usage_id IS NOT NULL THEN
        SELECT bsi.* INTO v_banner_slot_info
        FROM panel_slot_usage psu
        JOIN banner_slot_info bsi ON psu.banner_slot_info_id = bsi.id
        WHERE psu.id = NEW.panel_slot_usage_id;
    ELSE
        SELECT * INTO v_banner_slot_info
        FROM banner_slot_info 
        WHERE panel_info_id = NEW.panel_info_id 
        AND slot_number = 1
        LIMIT 1;
    END IF;
    
    IF v_banner_slot_info.id IS NOT NULL THEN
        -- panel_slot_snapshot JSONB 생성
        v_snapshot := jsonb_build_object(
            'id', v_banner_slot_info.id,
            'panel_info_id', v_banner_slot_info.panel_info_id,
            'slot_number', v_banner_slot_info.slot_number,
            'slot_name', v_banner_slot_info.slot_name,
            'max_width', v_banner_slot_info.max_width,
            'max_height', v_banner_slot_info.max_height,
            'total_price', v_banner_slot_info.total_price,
            'tax_price', v_banner_slot_info.tax_price,
            'road_usage_fee', v_banner_slot_info.road_usage_fee,
            'advertising_fee', v_banner_slot_info.advertising_fee,
            'banner_type', v_banner_slot_info.banner_type,
            'price_unit', v_banner_slot_info.price_unit,
            'is_premium', v_banner_slot_info.is_premium,
            'panel_slot_status', v_banner_slot_info.panel_slot_status,
            'notes', v_banner_slot_info.notes,
            'created_at', v_banner_slot_info.created_at,
            'updated_at', v_banner_slot_info.updated_at
        );
        
        -- orders 테이블의 panel_slot_snapshot 업데이트
        UPDATE orders 
        SET panel_slot_snapshot = v_snapshot
        WHERE id = NEW.order_id;
        
        RAISE NOTICE 'order_details INSERT 후 스냅샷 업데이트: 주문 ID %, 패널 ID %', 
            NEW.order_id, v_banner_slot_info.panel_info_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- order_details 테이블에 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_snapshot_after_order_details ON order_details;
CREATE TRIGGER trigger_update_snapshot_after_order_details
    AFTER INSERT ON order_details
    FOR EACH ROW
    EXECUTE FUNCTION update_snapshot_after_order_details();

-- 트리거 생성 확인
SELECT 
    trigger_name,
    event_object_table,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_fill_panel_slot_snapshot', 'trigger_update_snapshot_after_order_details')
ORDER BY trigger_name; 