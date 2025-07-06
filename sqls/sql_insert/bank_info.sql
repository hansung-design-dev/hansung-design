-- bank_info 테이블에 계좌번호 데이터 삽입
-- 현수막 게시대와 LED 게시대별로 다른 계좌번호 설정

-- 먼저 display_types에서 ID를 가져오는 함수 생성
DO $$
DECLARE
    v_banner_display_type_id UUID;
    v_led_display_type_id UUID;
    v_region_gu_ids RECORD;
BEGIN
    -- display_types에서 ID 가져오기
    SELECT id INTO v_banner_display_type_id 
    FROM display_types 
    WHERE name = 'banner_display' 
    LIMIT 1;

    SELECT id INTO v_led_display_type_id 
    FROM display_types 
    WHERE name = 'led_display' 
    LIMIT 1;

    -- 각 구별로 계좌번호 데이터 삽입
    FOR v_region_gu_ids IN 
        SELECT id, name 
        FROM region_gu 
        WHERE name IN ('서대문구', '관악구', '송파구', '용산구', '마포구', '강동구', '광진구', '동작구', '동대문구')
    LOOP
        -- 현수막 게시대 계좌번호 삽입
        INSERT INTO bank_info (
            region_gu_id,
            display_type_id,
            bank_name,
            account_number,
            depositor,
            created_at,
            updated_at
        ) VALUES (
            v_region_gu_ids.id,
            v_banner_display_type_id,
            CASE v_region_gu_ids.name
                WHEN '관악구' THEN '우리'
                WHEN '광진구' THEN '기업'
                WHEN '마포구' THEN '기업'
                WHEN '서대문구' THEN '기업'
                WHEN '송파구' THEN '우리'
                WHEN '용산구' THEN '기업'
                ELSE '우리'
            END,
            CASE v_region_gu_ids.name
                WHEN '관악구' THEN '1005-103-367439'
                WHEN '광진구' THEN '049-039964-04-103'
                WHEN '마포구' THEN '049-039964-04-135'
                WHEN '서대문구' THEN '049-039964-01-096'
                WHEN '송파구' THEN '1005-303-618971'
                WHEN '용산구' THEN '049-039964-04-128'
                ELSE '1005-602-397672'
            END,
            '(주)한성디자인기획',
            NOW(),
            NOW()
        )
        ON CONFLICT (region_gu_id, display_type_id) 
        DO UPDATE SET
            bank_name = EXCLUDED.bank_name,
            account_number = EXCLUDED.account_number,
            depositor = EXCLUDED.depositor,
            updated_at = NOW();

        -- LED 게시대 계좌번호 삽입
        INSERT INTO bank_info (
            region_gu_id,
            display_type_id,
            bank_name,
            account_number,
            depositor,
            created_at,
            updated_at
        ) VALUES (
            v_region_gu_ids.id,
            v_led_display_type_id,
            CASE v_region_gu_ids.name
                WHEN '강동구' THEN '우리'
                WHEN '광진구' THEN '기업'
                WHEN '동작구' THEN '기업'
                WHEN '동대문구' THEN '기업'
                ELSE '우리'
            END,
            CASE v_region_gu_ids.name
                WHEN '강동구' THEN '1005-602-397672'
                WHEN '광진구' THEN '049-039964-04-150'
                WHEN '동작구' THEN '049-039964-04-111'
                WHEN '동대문구' THEN '049-039964-04-167'
                ELSE '1005-602-397672'
            END,
            '(주)한성디자인기획',
            NOW(),
            NOW()
        )
        ON CONFLICT (region_gu_id, display_type_id) 
        DO UPDATE SET
            bank_name = EXCLUDED.bank_name,
            account_number = EXCLUDED.account_number,
            depositor = EXCLUDED.depositor,
            updated_at = NOW();
    END LOOP;
END $$; 