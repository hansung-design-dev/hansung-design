-- 🎯 안전한 현수막게시대별 banner_slots 생성 스크립트
-- 기존 데이터를 보존하면서 누락된 슬롯만 추가

-- 1단계: 현재 상황 분석
WITH panel_analysis AS (
    SELECT 
        p.id as panel_id,
        p.nickname,
        p.address,
        p.max_banner as required_slots,
        COUNT(bs.id) as existing_slots,
        p.max_banner - COUNT(bs.id) as missing_slots
    FROM panels p
    LEFT JOIN banner_slots bs ON p.id = bs.panel_id
    WHERE p.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
    AND p.panel_status = 'active'
    GROUP BY p.id, p.nickname, p.address, p.max_banner
)
SELECT 
    '현재 현수막게시대 분석' as info,
    COUNT(*) as total_panels,
    SUM(required_slots) as total_required_slots,
    SUM(existing_slots) as total_existing_slots,
    SUM(missing_slots) as total_missing_slots
FROM panel_analysis;

-- 2단계: 슬롯이 부족한 패널들 확인
WITH panel_analysis AS (
    SELECT 
        p.id as panel_id,
        p.nickname,
        p.address,
        p.max_banner as required_slots,
        COUNT(bs.id) as existing_slots,
        p.max_banner - COUNT(bs.id) as missing_slots
    FROM panels p
    LEFT JOIN banner_slots bs ON p.id = bs.panel_id
    WHERE p.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
    AND p.panel_status = 'active'
    GROUP BY p.id, p.nickname, p.address, p.max_banner
)
SELECT 
    panel_id,
    nickname,
    address,
    required_slots,
    existing_slots,
    missing_slots,
    CASE 
        WHEN missing_slots > 0 THEN '❌ 슬롯 부족'
        WHEN existing_slots = required_slots THEN '✅ 완료'
        ELSE '⚠️ 초과'
    END as status
FROM panel_analysis
WHERE missing_slots > 0
ORDER BY missing_slots DESC;

-- 3단계: 누락된 슬롯들만 생성 (안전한 방법)
DO $$
DECLARE
    panel_record RECORD;
    slot_num INTEGER;
    existing_slot_numbers INTEGER[];
BEGIN
    -- 슬롯이 부족한 패널들에 대해서만 처리
    FOR panel_record IN 
        SELECT 
            p.id as panel_id,
            p.nickname,
            p.address,
            p.max_banner as required_slots,
            COUNT(bs.id) as existing_slots
        FROM panels p
        LEFT JOIN banner_slots bs ON p.id = bs.panel_id
        WHERE p.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
        AND p.panel_status = 'active'
        GROUP BY p.id, p.nickname, p.address, p.max_banner
        HAVING COUNT(bs.id) < p.max_banner
    LOOP
        RAISE NOTICE '패널 % (%) 처리 중: 필요=%개, 현재=%개', 
            panel_record.nickname, panel_record.address, 
            panel_record.required_slots, panel_record.existing_slots;
        
        -- 현재 존재하는 slot_number들 확인
        SELECT ARRAY_AGG(slot_number) INTO existing_slot_numbers
        FROM banner_slots 
        WHERE panel_id = panel_record.panel_id;
        
        -- 누락된 slot_number들만 생성
        FOR slot_num IN 1..panel_record.required_slots LOOP
            -- 이미 존재하는 slot_number는 건너뛰기
            IF existing_slot_numbers IS NULL OR NOT (slot_num = ANY(existing_slot_numbers)) THEN
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
                    CASE 
                        WHEN slot_num = 1 THEN '메인면'
                        WHEN slot_num = 2 THEN '보조면1'
                        WHEN slot_num = 3 THEN '보조면2'
                        ELSE '면' || slot_num
                    END,
                    300, -- 기본 max_width
                    200, -- 기본 max_height
                    'panel', -- 기본 banner_type
                    '15 days', -- 기본 price_unit
                    'available', -- 기본 panel_slot_status
                    panel_record.nickname || ' ' || slot_num || '번면',
                    NOW(),
                    NOW()
                );
                
                RAISE NOTICE '  - slot_number % 생성 완료', slot_num;
            ELSE
                RAISE NOTICE '  - slot_number % 이미 존재, 건너뜀', slot_num;
            END IF;
        END LOOP;
        
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
        p.max_banner as required_slots,
        COUNT(bs.id) as final_slots,
        p.max_banner - COUNT(bs.id) as remaining_missing
    FROM panels p
    LEFT JOIN banner_slots bs ON p.id = bs.panel_id
    WHERE p.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
    AND p.panel_status = 'active'
    GROUP BY p.id, p.nickname, p.address, p.max_banner
)
SELECT 
    '최종 현수막게시대 현황' as info,
    COUNT(*) as total_panels,
    SUM(required_slots) as total_required_slots,
    SUM(final_slots) as total_final_slots,
    SUM(remaining_missing) as total_remaining_missing
FROM final_analysis;

-- 5단계: 패널별 최종 상태 확인
SELECT 
    p.nickname as panel_name,
    p.address,
    p.max_banner as required_slots,
    COUNT(bs.id) as final_slots,
    CASE 
        WHEN COUNT(bs.id) = p.max_banner THEN '✅ 완료'
        WHEN COUNT(bs.id) > p.max_banner THEN '⚠️ 초과'
        ELSE '❌ 부족'
    END as status,
    STRING_AGG(bs.slot_number::text, ', ' ORDER BY bs.slot_number) as slot_numbers
FROM panels p
LEFT JOIN banner_slots bs ON p.id = bs.panel_id
WHERE p.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
AND p.panel_status = 'active'
GROUP BY p.id, p.nickname, p.address, p.max_banner
ORDER BY p.nickname; 