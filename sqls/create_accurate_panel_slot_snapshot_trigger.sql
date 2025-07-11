-- =================================================================
-- 정확한 panel_slot_snapshot 트리거 (결제 완료 시점 실행)
-- =================================================================

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS trigger_fill_panel_slot_snapshot ON orders;
DROP TRIGGER IF EXISTS trigger_update_snapshot_after_order_details ON order_details;
DROP TRIGGER IF EXISTS trigger_fill_panel_slot_snapshot_on_payment ON orders;
DROP FUNCTION IF EXISTS fill_panel_slot_snapshot();
DROP FUNCTION IF EXISTS update_snapshot_after_order_details();
DROP FUNCTION IF EXISTS fill_panel_slot_snapshot_on_payment();

-- 결제 완료 시점에 panel_slot_snapshot을 채우는 함수
CREATE OR REPLACE FUNCTION fill_panel_slot_snapshot_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_panel_type TEXT;
    v_slot_record RECORD;
    v_snapshot JSONB;
BEGIN
    -- 디버깅 로그
    RAISE NOTICE '결제 완료 트리거 실행: order_id = %', NEW.id;
    
    -- order_details에서 첫 번째 아이템의 panel_info_id 가져오기
    DECLARE
        v_order_detail RECORD;
        v_user_profile RECORD;
        v_price_usage_type TEXT := 'default';
    BEGIN
        SELECT panel_info_id, panel_slot_usage_id 
        INTO v_order_detail
        FROM order_details 
        WHERE order_id = NEW.id 
        LIMIT 1;
        
        -- panel_info_id가 없으면 처리하지 않음
        IF v_order_detail.panel_info_id IS NULL THEN
            RAISE NOTICE 'panel_info_id가 NULL이므로 처리 중단';
            RETURN NEW;
        END IF;
        
        -- 사용자 프로필 확인하여 price_usage_type 결정
        SELECT is_public_institution, is_company 
        INTO v_user_profile
        FROM user_profiles 
        WHERE id = NEW.user_profile_id;
        
        IF v_user_profile.is_public_institution = true THEN
            v_price_usage_type := 'public_institution';
        ELSIF v_user_profile.is_company = true THEN
            v_price_usage_type := 'company';
        ELSE
            v_price_usage_type := 'default';
        END IF;
        
        RAISE NOTICE '사용자 프로필: public_institution = %, company = %, price_usage_type = %', 
            v_user_profile.is_public_institution, v_user_profile.is_company, v_price_usage_type;
    
        -- 패널 타입 확인
        SELECT dt.name INTO v_panel_type
        FROM panel_info pi
        JOIN display_types dt ON pi.display_type_id = dt.id
        WHERE pi.id = v_order_detail.panel_info_id;
    
    RAISE NOTICE '패널 타입: %', v_panel_type;
    
    -- 패널 타입에 따라 슬롯 정보 조회
    IF v_panel_type = 'banner_display' THEN
        -- 배너 패널: panel_slot_usage에서 정확한 슬롯 정보 가져오기
        IF v_order_detail.panel_slot_usage_id IS NOT NULL THEN
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
                AND bsp.price_usage_type = v_price_usage_type  -- 사용자 프로필에 따라 동적 결정
            WHERE psu.id = v_order_detail.panel_slot_usage_id;
            
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
                AND bsp.price_usage_type = v_price_usage_type  -- 사용자 프로필에 따라 동적 결정
            WHERE bsi.panel_info_id = v_order_detail.panel_info_id
              AND bsi.slot_number = 1;
            
            RAISE NOTICE '배너 슬롯 조회 (기본값): slot_number = %, id = %, policy_total_price = %', 
                v_slot_record.slot_number, v_slot_record.id, v_slot_record.policy_total_price;
        END IF;
            
        ELSIF v_panel_type = 'led_display' THEN
            -- LED 패널: panel_slot_usage에서 정확한 슬롯 정보 가져오기
            IF v_order_detail.panel_slot_usage_id IS NOT NULL THEN
                -- panel_slot_usage가 있으면 해당 슬롯 사용
                SELECT lsi.* INTO v_slot_record 
                FROM panel_slot_usage psu
                JOIN led_slot_info lsi ON psu.panel_info_id = lsi.panel_info_id 
                    AND psu.slot_number = lsi.slot_number
                WHERE psu.id = v_order_detail.panel_slot_usage_id;
                
                RAISE NOTICE 'LED 슬롯 조회 (panel_slot_usage): slot_number = %, id = %', 
                    v_slot_record.slot_number, v_slot_record.id;
            ELSE
                -- panel_slot_usage가 없으면 1번 슬롯 사용
                SELECT * INTO v_slot_record 
                FROM led_slot_info
                WHERE panel_info_id = v_order_detail.panel_info_id
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
        WHERE id = NEW.id;
        
        RAISE NOTICE 'panel_slot_snapshot 업데이트 완료: 주문 ID %', NEW.id;
        
        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- orders UPDATE (결제 완료 시점) 후 실행
CREATE TRIGGER trigger_fill_panel_slot_snapshot_on_payment
    AFTER UPDATE ON orders
    FOR EACH ROW
    WHEN (OLD.is_paid = false AND NEW.is_paid = true)
    EXECUTE FUNCTION fill_panel_slot_snapshot_on_payment();

-- 트리거 생성 확인
SELECT 
    trigger_name,
    event_object_table,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_fill_panel_slot_snapshot_on_payment'; 