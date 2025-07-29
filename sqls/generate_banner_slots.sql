-- 🎯 현수막게시대별 banner_slots 생성 스크립트
-- 각 게시대의 max_banner 수만큼 slot_number를 생성

-- 1단계: 현재 상황 확인
SELECT 
    '현재 banner_slots 현황' as info,
    COUNT(*) as total_slots,
    COUNT(DISTINCT panel_id) as unique_panels
FROM banner_slots;

SELECT 
    '현재 panels 현수막게시대 현황' as info,
    COUNT(*) as total_panels,
    SUM(max_banner) as total_required_slots
FROM panels 
WHERE display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display');

-- 2단계: 기존 banner_slots 삭제 (slot_number = 1인 것들만)
DELETE FROM banner_slots 
WHERE slot_number = 1 
AND panel_id IN (
    SELECT id FROM panels 
    WHERE display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
);

-- 3단계: 각 현수막게시대별로 max_banner 수만큼 banner_slots 생성
DO $$
DECLARE
    panel_record RECORD;
    slot_num INTEGER;
BEGIN
    -- 현수막게시대 타입의 모든 패널에 대해
    FOR panel_record IN 
        SELECT 
            id as panel_id,
            max_banner,
            nickname,
            address
        FROM panels 
        WHERE display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
        AND panel_status = 'active'
    LOOP
        RAISE NOTICE '패널 % (%) 처리 중: max_banner = %', 
            panel_record.nickname, panel_record.address, panel_record.max_banner;
        
        -- max_banner 수만큼 slot 생성
        FOR slot_num IN 1..panel_record.max_banner LOOP
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
                300, -- 기본 max_width (필요시 조정)
                200, -- 기본 max_height (필요시 조정)
                'panel', -- 기본 banner_type
                '15 days', -- 기본 price_unit
                'available', -- 기본 panel_slot_status
                panel_record.nickname || ' ' || slot_num || '번면',
                NOW(),
                NOW()
            );
            
            RAISE NOTICE '  - slot_number % 생성 완료', slot_num;
        END LOOP;
        
        RAISE NOTICE '패널 % 완료: %개 슬롯 생성', panel_record.nickname, panel_record.max_banner;
    END LOOP;
    
    RAISE NOTICE '모든 현수막게시대 banner_slots 생성 완료!';
END $$;

-- 4단계: 생성 결과 확인
SELECT 
    '생성 완료 후 banner_slots 현황' as info,
    COUNT(*) as total_slots,
    COUNT(DISTINCT panel_id) as unique_panels
FROM banner_slots;

-- 5단계: 패널별 슬롯 현황 상세 확인
SELECT 
    p.nickname as panel_name,
    p.address,
    p.max_banner as required_slots,
    COUNT(bs.id) as created_slots,
    CASE 
        WHEN COUNT(bs.id) = p.max_banner THEN '✅ 완료'
        ELSE '❌ 부족'
    END as status
FROM panels p
LEFT JOIN banner_slots bs ON p.id = bs.panel_id
WHERE p.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
GROUP BY p.id, p.nickname, p.address, p.max_banner
ORDER BY p.nickname;

-- 6단계: 슬롯별 상세 정보 확인 (샘플)
SELECT 
    p.nickname as panel_name,
    bs.slot_number,
    bs.slot_name,
    bs.max_width,
    bs.max_height,
    bs.banner_type,
    bs.panel_slot_status,
    bs.notes
FROM banner_slots bs
JOIN panels p ON bs.panel_id = p.id
WHERE p.display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display')
ORDER BY p.nickname, bs.slot_number
LIMIT 20; 