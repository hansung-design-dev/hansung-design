-- 🎯 banner_type별 banner_slots 수정 스크립트
-- 각 banner_type에 따라 올바른 slot_number와 price_unit 설정

-- 1단계: 현재 상황 확인
SELECT 
    '현재 banner_slots 현황' as info,
    COUNT(*) as total_slots,
    COUNT(DISTINCT panel_id) as unique_panels
FROM banner_slots;

-- banner_type별 현황 확인
SELECT 
    banner_type,
    COUNT(*) as slot_count,
    COUNT(DISTINCT panel_id) as panel_count,
    STRING_AGG(DISTINCT price_unit, ', ') as price_units,
    STRING_AGG(DISTINCT slot_number::text, ', ') as slot_numbers
FROM banner_slots
GROUP BY banner_type
ORDER BY banner_type;

-- 2단계: 기존 banner_slots 삭제 (banner_display 타입 패널만)
DELETE FROM banner_slots 
WHERE panel_id IN (
    SELECT id FROM panels 
    WHERE display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
);

-- 3단계: banner_type별로 올바른 banner_slots 생성
DO $$
DECLARE
    panel_record RECORD;
    slot_num INTEGER;
    price_unit_val TEXT;
    slot_name_val TEXT;
    max_width_val NUMERIC;
    max_height_val NUMERIC;
BEGIN
    -- 현수막게시대 타입의 모든 패널에 대해
    FOR panel_record IN 
        SELECT 
            p.id as panel_id,
            p.nickname,
            p.address,
            p.panel_type,
            pbd.max_banner,
            pbd.panel_width,
            pbd.panel_height
        FROM panels p
        LEFT JOIN banner_panel_details pbd ON p.id = pbd.panel_id
        WHERE p.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
        AND p.panel_status = 'active'
    LOOP
        RAISE NOTICE '패널 % (%) 처리 중: panel_type = %, max_banner = %', 
            panel_record.nickname, panel_record.address, panel_record.panel_type, panel_record.max_banner;
        
        -- panel_type에 따라 banner_type 결정
        CASE panel_record.panel_type
            WHEN 'top_fixed' THEN
                -- top_fixed: slot_number = 0, 3개 price_unit (6 months, 1 year, 3 years)
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
                    
                    -- 크기는 패널 정보에서 가져오거나 기본값 사용
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
                        0, -- top_fixed는 항상 slot_number = 0
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
                END LOOP;
                
            WHEN 'bulletin_board' THEN
                -- bulletin_board: 12개 슬롯 (slot_number 1-12)
                FOR slot_num IN 1..12 LOOP
                    -- 크기는 패널 정보에서 가져오거나 기본값 사용
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
                END LOOP;
                
            ELSE
                -- 기타 타입 (panel, semi_auto 등): max_banner 수만큼 슬롯 생성
                FOR slot_num IN 1..COALESCE(panel_record.max_banner, 1) LOOP
                    -- 크기는 패널 정보에서 가져오거나 기본값 사용
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
                END LOOP;
        END CASE;
        
        RAISE NOTICE '패널 % 완료', panel_record.nickname;
    END LOOP;
    
    RAISE NOTICE '모든 banner_slots 생성 완료!';
END $$;

-- 4단계: 생성 결과 확인
SELECT 
    '생성 완료 후 banner_slots 현황' as info,
    COUNT(*) as total_slots,
    COUNT(DISTINCT panel_id) as unique_panels
FROM banner_slots;

-- banner_type별 최종 현황 확인
SELECT 
    banner_type,
    COUNT(*) as slot_count,
    COUNT(DISTINCT panel_id) as panel_count,
    STRING_AGG(DISTINCT price_unit, ', ') as price_units,
    STRING_AGG(DISTINCT slot_number::text, ', ') as slot_numbers
FROM banner_slots
GROUP BY banner_type
ORDER BY banner_type;

-- 5단계: 패널별 상세 확인 (샘플)
SELECT 
    p.nickname as panel_name,
    p.panel_type,
    p.address,
    COUNT(bs.id) as slot_count,
    STRING_AGG(bs.slot_number::text || '(' || bs.banner_type || ')', ', ' ORDER BY bs.slot_number) as slots
FROM panels p
LEFT JOIN banner_slots bs ON p.id = bs.panel_id
WHERE p.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
AND p.panel_status = 'active'
GROUP BY p.id, p.nickname, p.panel_type, p.address
ORDER BY p.nickname
LIMIT 20;

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