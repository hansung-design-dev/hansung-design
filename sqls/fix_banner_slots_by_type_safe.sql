-- 🎯 안전한 banner_type별 banner_slots 수정 스크립트
-- 기존 데이터를 보존하면서 누락된 슬롯만 추가

-- 1단계: 현재 상황 분석
WITH panel_analysis AS (
    SELECT 
        p.id as panel_id,
        p.nickname,
        p.address,
        p.panel_type,
        pbd.max_banner,
        pbd.panel_width,
        pbd.panel_height,
        COUNT(bs.id) as existing_slots
    FROM panels p
    LEFT JOIN banner_panel_details pbd ON p.id = pbd.panel_id
    LEFT JOIN banner_slots bs ON p.id = bs.panel_id
    WHERE p.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
    AND p.panel_status = 'active'
    GROUP BY p.id, p.nickname, p.address, p.panel_type, pbd.max_banner, pbd.panel_width, pbd.panel_height
)
SELECT 
    '현재 현수막게시대 분석' as info,
    COUNT(*) as total_panels,
    SUM(existing_slots) as total_existing_slots,
    STRING_AGG(DISTINCT panel_type, ', ') as panel_types
FROM panel_analysis;

-- 2단계: panel_type별 필요한 슬롯 수 계산
WITH panel_requirements AS (
    SELECT 
        p.id as panel_id,
        p.nickname,
        p.address,
        p.panel_type,
        pbd.max_banner,
        pbd.panel_width,
        pbd.panel_height,
        CASE 
            WHEN p.panel_type = 'top_fixed' THEN 3  -- 3개 price_unit
            WHEN p.panel_type = 'bulletin_board' THEN 12  -- 12개 슬롯
            ELSE COALESCE(pbd.max_banner, 1)  -- 기타는 max_banner 또는 1
        END as required_slots,
        COUNT(bs.id) as existing_slots
    FROM panels p
    LEFT JOIN banner_panel_details pbd ON p.id = pbd.panel_id
    LEFT JOIN banner_slots bs ON p.id = bs.panel_id
    WHERE p.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
    AND p.panel_status = 'active'
    GROUP BY p.id, p.nickname, p.address, p.panel_type, pbd.max_banner, pbd.panel_width, pbd.panel_height
)
SELECT 
    panel_id,
    nickname,
    address,
    panel_type,
    required_slots,
    existing_slots,
    required_slots - existing_slots as missing_slots,
    CASE 
        WHEN existing_slots >= required_slots THEN '✅ 완료'
        ELSE '❌ 부족'
    END as status
FROM panel_requirements
WHERE existing_slots < required_slots
ORDER BY missing_slots DESC;

-- 3단계: 누락된 슬롯들만 생성 (안전한 방법)
DO $$
DECLARE
    panel_record RECORD;
    slot_num INTEGER;
    price_unit_val TEXT;
    slot_name_val TEXT;
    max_width_val NUMERIC;
    max_height_val NUMERIC;
    existing_slot_numbers INTEGER[];
    required_slots INTEGER;
BEGIN
    -- 슬롯이 부족한 패널들에 대해서만 처리
    FOR panel_record IN 
        SELECT 
            p.id as panel_id,
            p.nickname,
            p.address,
            p.panel_type,
            pbd.max_banner,
            pbd.panel_width,
            pbd.panel_height,
            COUNT(bs.id) as existing_slots
        FROM panels p
        LEFT JOIN banner_panel_details pbd ON p.id = pbd.panel_id
        LEFT JOIN banner_slots bs ON p.id = bs.panel_id
        WHERE p.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
        AND p.panel_status = 'active'
        GROUP BY p.id, p.nickname, p.address, p.panel_type, pbd.max_banner, pbd.panel_width, pbd.panel_height
        HAVING COUNT(bs.id) < CASE 
            WHEN p.panel_type = 'top_fixed' THEN 3
            WHEN p.panel_type = 'bulletin_board' THEN 12
            ELSE COALESCE(pbd.max_banner, 1)
        END
    LOOP
        -- 필요한 슬롯 수 계산
        required_slots := CASE 
            WHEN panel_record.panel_type = 'top_fixed' THEN 3
            WHEN panel_record.panel_type = 'bulletin_board' THEN 12
            ELSE COALESCE(panel_record.max_banner, 1)
        END;
        
        RAISE NOTICE '패널 % (%) 처리 중: panel_type = %, 필요=%개, 현재=%개', 
            panel_record.nickname, panel_record.address, panel_record.panel_type, 
            required_slots, panel_record.existing_slots;
        
        -- 현재 존재하는 slot_number들 확인
        SELECT ARRAY_AGG(slot_number) INTO existing_slot_numbers
        FROM banner_slots 
        WHERE panel_id = panel_record.panel_id;
        
        -- panel_type에 따라 필요한 슬롯 생성
        CASE panel_record.panel_type
            WHEN 'top_fixed' THEN
                -- top_fixed: slot_number = 0, 3개 price_unit
                FOR i IN 1..3 LOOP
                    CASE i
                        WHEN 1 THEN 
                            price_unit_val := '6 months';
                            slot_name_val := '6 months';
                        WHEN 2 THEN 
                            price_unit_val := '1 year';
                            slot_name_val := '1 year';
                        WHEN 3 THEN 
                            price_unit_val := '3 years';
                            slot_name_val := '3 years';
                    END CASE;
                    
                    -- 이미 존재하는지 확인
                    IF existing_slot_numbers IS NULL OR NOT (0 = ANY(existing_slot_numbers)) OR 
                       NOT EXISTS (SELECT 1 FROM banner_slots WHERE panel_id = panel_record.panel_id AND price_unit = price_unit_val) THEN
                        
                        max_width_val := COALESCE(panel_record.panel_width, 600);
                        max_height_val := COALESCE(panel_record.panel_height, 100);
                        
                        INSERT INTO banner_slots (
                            panel_id,
                            slot_number,
                            slot_name,
                            max_width,
                            max_height,
                            banner_type,
                            price_unit,
                            panel_slot_status,
                            notes,
                            created_at,
                            updated_at
                        ) VALUES (
                            panel_record.panel_id,
                            0,
                            slot_name_val,
                            max_width_val,
                            max_height_val,
                            'top_fixed',
                            price_unit_val,
                            'available',
                            panel_record.nickname || ' 상단광고 ' || slot_name_val,
                            NOW(),
                            NOW()
                        );
                        
                        RAISE NOTICE '  - top_fixed slot 생성: %', slot_name_val;
                    ELSE
                        RAISE NOTICE '  - top_fixed slot % 이미 존재, 건너뜀', slot_name_val;
                    END IF;
                END LOOP;
                
            WHEN 'bulletin_board' THEN
                -- bulletin_board: 12개 슬롯 (slot_number 1-12)
                FOR slot_num IN 1..12 LOOP
                    -- 이미 존재하는지 확인
                    IF existing_slot_numbers IS NULL OR NOT (slot_num = ANY(existing_slot_numbers)) THEN
                        max_width_val := COALESCE(panel_record.panel_width, 600);
                        max_height_val := COALESCE(panel_record.panel_height, 70);
                        
                        INSERT INTO banner_slots (
                            panel_id,
                            slot_number,
                            slot_name,
                            max_width,
                            max_height,
                            banner_type,
                            price_unit,
                            panel_slot_status,
                            notes,
                            created_at,
                            updated_at
                        ) VALUES (
                            panel_record.panel_id,
                            slot_num,
                            slot_num || '번면',
                            max_width_val,
                            max_height_val,
                            'bulletin_board',
                            '15 days',
                            'available',
                            panel_record.nickname || ' 게시판 ' || slot_num || '번면',
                            NOW(),
                            NOW()
                        );
                        
                        RAISE NOTICE '  - bulletin_board slot % 생성 완료', slot_num;
                    ELSE
                        RAISE NOTICE '  - bulletin_board slot % 이미 존재, 건너뜀', slot_num;
                    END IF;
                END LOOP;
                
            ELSE
                -- 기타 타입 (panel, semi_auto 등): max_banner 수만큼 슬롯 생성
                FOR slot_num IN 1..required_slots LOOP
                    -- 이미 존재하는지 확인
                    IF existing_slot_numbers IS NULL OR NOT (slot_num = ANY(existing_slot_numbers)) THEN
                        max_width_val := COALESCE(panel_record.panel_width, 600);
                        max_height_val := COALESCE(panel_record.panel_height, 70);
                        
                        -- banner_type 결정
                        CASE panel_record.panel_type
                            WHEN 'semi_auto' THEN
                                slot_name_val := CASE 
                                    WHEN slot_num = 1 THEN '1번면'
                                    ELSE slot_num || '번면'
                                END;
                            ELSE
                                slot_name_val := CASE 
                                    WHEN slot_num = 1 THEN '메인면'
                                    WHEN slot_num = 2 THEN '보조면1'
                                    WHEN slot_num = 3 THEN '보조면2'
                                    ELSE slot_num || '번면'
                                END;
                        END CASE;
                        
                        INSERT INTO banner_slots (
                            panel_id,
                            slot_number,
                            slot_name,
                            max_width,
                            max_height,
                            banner_type,
                            price_unit,
                            panel_slot_status,
                            notes,
                            created_at,
                            updated_at
                        ) VALUES (
                            panel_record.panel_id,
                            slot_num,
                            slot_name_val,
                            max_width_val,
                            max_height_val,
                            panel_record.panel_type,
                            '15 days',
                            'available',
                            panel_record.nickname || ' ' || slot_name_val,
                            NOW(),
                            NOW()
                        );
                        
                        RAISE NOTICE '  - % slot % 생성 완료', panel_record.panel_type, slot_num;
                    ELSE
                        RAISE NOTICE '  - % slot % 이미 존재, 건너뜀', panel_record.panel_type, slot_num;
                    END IF;
                END LOOP;
        END CASE;
        
        RAISE NOTICE '패널 % 완료', panel_record.nickname;
    END LOOP;
    
    RAISE NOTICE '모든 누락된 banner_slots 생성 완료!';
END $$;

-- 4단계: 최종 결과 확인
WITH final_analysis AS (
    SELECT 
        p.id as panel_id,
        p.nickname,
        p.address,
        p.panel_type,
        CASE 
            WHEN p.panel_type = 'top_fixed' THEN 3
            WHEN p.panel_type = 'bulletin_board' THEN 12
            ELSE COALESCE(pbd.max_banner, 1)
        END as required_slots,
        COUNT(bs.id) as final_slots
    FROM panels p
    LEFT JOIN banner_panel_details pbd ON p.id = pbd.panel_id
    LEFT JOIN banner_slots bs ON p.id = bs.panel_id
    WHERE p.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
    AND p.panel_status = 'active'
    GROUP BY p.id, p.nickname, p.address, p.panel_type, pbd.max_banner
)
SELECT 
    '최종 현수막게시대 현황' as info,
    COUNT(*) as total_panels,
    SUM(required_slots) as total_required_slots,
    SUM(final_slots) as total_final_slots,
    SUM(required_slots - final_slots) as total_remaining_missing
FROM final_analysis;

-- 5단계: banner_type별 최종 현황 확인
SELECT 
    banner_type,
    COUNT(*) as slot_count,
    COUNT(DISTINCT panel_id) as panel_count,
    STRING_AGG(DISTINCT price_unit, ', ') as price_units,
    STRING_AGG(DISTINCT slot_number::text, ', ') as slot_numbers
FROM banner_slots
GROUP BY banner_type
ORDER BY banner_type;

-- 6단계: top_fixed 패널 상세 확인
SELECT 
    p.nickname as panel_name,
    p.address,
    bs.slot_number,
    bs.slot_name,
    bs.price_unit,
    bs.max_width,
    bs.max_height,
    bs.banner_type
FROM banner_slots bs
JOIN panels p ON bs.panel_id = p.id
WHERE bs.banner_type = 'top_fixed'
ORDER BY p.nickname, bs.slot_number;

-- 7단계: bulletin_board 패널 상세 확인
SELECT 
    p.nickname as panel_name,
    p.address,
    COUNT(bs.id) as slot_count,
    STRING_AGG(bs.slot_number::text, ', ' ORDER BY bs.slot_number) as slot_numbers
FROM banner_slots bs
JOIN panels p ON bs.panel_id = p.id
WHERE bs.banner_type = 'bulletin_board'
GROUP BY p.id, p.nickname, p.address
ORDER BY p.nickname; 