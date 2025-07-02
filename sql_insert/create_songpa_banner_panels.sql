-- 송파구 현수막게시대용 panel_info 생성
-- 기존 상단광고 panel_info와 같은 panel_code를 사용하되, panel_type은 'banner'로 설정

INSERT INTO panel_info (
    panel_code,
    panel_type,
    display_type,
    region_gu_id,
    address,
    nickname,
    width,
    height,
    face_count,
    max_banner,
    created_at,
    updated_at
) VALUES
-- panel_code 1-10: 140000원, 540x66, 6면, panel
(1, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 1호', 540, 66, 6, 6, NOW(), NOW()),
(2, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 2호', 540, 66, 6, 6, NOW(), NOW()),
(3, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 3호', 540, 66, 6, 6, NOW(), NOW()),
(4, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 4호', 540, 66, 6, 6, NOW(), NOW()),
(5, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 5호', 540, 66, 6, 6, NOW(), NOW()),
(6, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 6호', 540, 66, 6, 6, NOW(), NOW()),
(7, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 7호', 540, 66, 6, 6, NOW(), NOW()),
(8, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 8호', 540, 66, 6, 6, NOW(), NOW()),
(9, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 9호', 540, 66, 6, 6, NOW(), NOW()),
(10, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 10호', 540, 66, 6, 6, NOW(), NOW()),
-- panel_code 11: 140000원, 540x66, 6면, semi_auto
(11, 'semi_auto', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 11호', 540, 66, 6, 6, NOW(), NOW()),
-- panel_code 12-15: 140000원, 540x66, 6면, panel
(12, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 12호', 540, 66, 6, 6, NOW(), NOW()),
(13, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 13호', 540, 66, 6, 6, NOW(), NOW()),
(14, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 14호', 540, 66, 6, 6, NOW(), NOW()),
(15, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 15호', 540, 66, 6, 6, NOW(), NOW()),
-- panel_code 16: 140000원, 540x66, 5면, panel
(16, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 16호', 540, 66, 5, 5, NOW(), NOW()),
-- panel_code 17: 140000원, 540x66, 6면, semi_auto
(17, 'semi_auto', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 17호', 540, 66, 6, 6, NOW(), NOW()),
-- panel_code 18: 140000원, 540x66, 6면, panel
(18, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 18호', 540, 66, 6, 6, NOW(), NOW()),
-- panel_code 19: 120000원, 540x66, 6면, semi_auto
(19, 'semi_auto', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 19호', 540, 66, 6, 6, NOW(), NOW()),
-- panel_code 20: 140000원, 540x66, 6면, panel
(20, 'panel', 'banner', 9, '서울특별시 송파구 올림픽로 25', '송파구 현수막게시대 20호', 540, 66, 6, 6, NOW(), NOW());

-- 생성된 panel_info 확인
SELECT 
    id,
    panel_code,
    panel_type,
    region_gu_id,
    address,
    nickname,
    width,
    height,
    face_count
FROM panel_info 
WHERE region_gu_id = 9 AND panel_type = 'banner'
ORDER BY panel_code; 