-- 용산구 현수막게시대용 banner_slot_info 생성
-- 상업용/공공용, 6개월/1년/3년, panel/semi-auto에 따라 다른 가격 적용

INSERT INTO banner_slot_info (
    panel_info_id,
    slot_number,
    slot_name,
    banner_type,
    purpose,
    period,
    total_price,
    tax_price,
    advertising_fee,
    road_usage_fee,
    created_at,
    updated_at
)
SELECT 
    pi.id as panel_info_id,
    generate_series(1, 
        CASE 
            WHEN pi.panel_code = 16 THEN 5  -- panel_code 16은 5면
            ELSE 6  -- 나머지는 6면
        END
    ) as slot_number,
    CASE 
        WHEN pi.panel_code IN (11, 17, 19) THEN '상업용 반자동'
        ELSE '상업용 판넬'
    END as slot_name,
    CASE 
        WHEN pi.panel_code IN (11, 17, 19) THEN 'semi-auto'::banner_type
        ELSE 'panel'::banner_type
    END as banner_type,
    CASE 
        WHEN pi.panel_code IN (11, 17, 19) THEN 120000  -- semi-auto
        ELSE 140000  -- panel
    END as total_price,
    CASE 
        WHEN pi.panel_code IN (11, 17, 19) THEN 10000  -- semi-auto
        ELSE 10000   -- panel
    END as tax_price,
    CASE 
        WHEN pi.panel_code IN (11, 17, 19) THEN 87900  -- semi-auto
        ELSE 102280  -- panel
    END as advertising_fee,
    CASE 
        WHEN pi.panel_code IN (11, 17, 19) THEN 22100  -- semi-auto
        ELSE 27720   -- panel
    END as road_usage_fee,
    NOW() as created_at,
    NOW() as updated_at
FROM panel_info pi
WHERE pi.region_gu_id = '0d53c49c-4033-415b-b309-98d3fdc3d3ea'  -- 용산구
  AND pi.panel_code BETWEEN 1 AND 19
ORDER BY pi.panel_code, slot_number;

-- 공공용 현수막게시대 추가
INSERT INTO banner_slot_info (
    panel_info_id,
    slot_number,
    slot_name,
    banner_type,
    total_price,
    tax_price,
    advertising_fee,
    road_usage_fee,
    created_at,
    updated_at
)
SELECT 
    pi.id as panel_info_id,
    generate_series(1, 
        CASE 
            WHEN pi.panel_code = 16 THEN 5  -- panel_code 16은 5면
            ELSE 6  -- 나머지는 6면
        END
    ) as slot_number,
    CASE 
        WHEN pi.panel_code IN (11, 17, 19) THEN '공공용 반자동'
        ELSE '공공용 판넬'
    END as slot_name,
    CASE 
        WHEN pi.panel_code IN (11, 17, 19) THEN 'semi-auto'::banner_type
        ELSE 'panel'::banner_type
    END as banner_type,
    CASE 
        WHEN pi.panel_code IN (11, 17, 19) THEN 79000  -- semi-auto
        ELSE 99000   -- panel
    END as total_price,
    0 as tax_price,  -- 공공용은 수수료 없음
    CASE 
        WHEN pi.panel_code IN (11, 17, 19) THEN 79000  -- semi-auto
        ELSE 99000   -- panel
    END as advertising_fee,
    0 as road_usage_fee,  -- 공공용은 도로사용료 없음
    NOW() as created_at,
    NOW() as updated_at
FROM panel_info pi
WHERE pi.region_gu_id = '0d53c49c-4033-415b-b309-98d3fdc3d3ea'  -- 용산구
  AND pi.panel_code BETWEEN 1 AND 19
ORDER BY pi.panel_code, slot_number;

-- 생성된 banner_slot_info 확인
SELECT 
    bsi.id,
    bsi.panel_info_id,
    pi.panel_code,
    pi.panel_type,
    pi.nickname,
    bsi.slot_number,
    bsi.slot_name,
    bsi.banner_type,
    bsi.total_price,
    bsi.tax_price,
    bsi.advertising_fee,
    bsi.road_usage_fee
FROM banner_slot_info bsi
JOIN panel_info pi ON bsi.panel_info_id = pi.id
WHERE pi.region_gu_id = '0d53c49c-4033-415b-b309-98d3fdc3d3ea'  -- 용산구
  AND bsi.slot_number > 0  -- 현수막게시대만 (상단광고는 slot_number = 0)
ORDER BY pi.panel_code, bsi.slot_name, bsi.slot_number; 