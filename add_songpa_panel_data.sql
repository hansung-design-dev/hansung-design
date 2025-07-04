-- 송파구 panel 타입 데이터 추가 (1-20번)
-- 기존 top_fixed 데이터는 그대로 두고, 동일한 address, nickname, panel_code로 panel 타입 신규 추가

INSERT INTO panel_info (
    id,
    display_type_id,
    region_gu_id,
    region_dong_id,
    nickname,
    address,
    panel_status,
    panel_code,
    panel_type,
    max_banner,
    first_half_closure_quantity,
    second_half_closure_quantity
) VALUES
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', '5b28ff3c-2c15-453c-9000-f0d3d87dd58d', '잠실종합운동장 사거리앞(실내체육관 방향)', '잠실동 10', 'active', 1, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', 'fbb1eed5-018e-4ccb-9fe1-ba22a955c681', '올림픽대교 남단사거리 앞(빗물펌프장)', '방이동 88-11', 'active', 2, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', 'fbb1eed5-018e-4ccb-9fe1-ba22a955c681', '올림픽대교 남단사거리 앞(남단 유수지앞)', '방이동 88-13', 'active', 3, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', 'fbb1eed5-018e-4ccb-9fe1-ba22a955c681', '풍납사거리 성내유수지리 앞', '방이동 88-13', 'active', 4, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', 'fbb1eed5-018e-4ccb-9fe1-ba22a955c681', '올림픽공원 북2문 앞', '방이동 88-14', 'active', 5, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', 'fbb1eed5-018e-4ccb-9fe1-ba22a955c681', '둔촌사거리 보성중고 앞', '방이동 89-22', 'active', 6, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', 'fbb1eed5-018e-4ccb-9fe1-ba22a955c681', '서하남IC 사거리 앞', '방이동 433', 'active', 7, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', 'fbb1eed5-018e-4ccb-9fe1-ba22a955c681', '오륜사거리 앞', '방이동 445', 'active', 8, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', 'fbb1eed5-018e-4ccb-9fe1-ba22a955c681', '올림픽선수촌(아) 남문 앞', '방이동 449', 'active', 9, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', 'e9478f46-49f9-4037-9fae-7524bcbfba91', '가든파이브 글샘공원 앞', '문정동 625', 'active', 10, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', '7bffb3cb-2379-4b15-bddf-52dddf0db881', '문정로데오거리 입구 앞', '가락동 102', 'active', 11, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', 'e9478f46-49f9-4037-9fae-7524bcbfba91', '가든파이브 글샘공원 앞', '문정동 625', 'active', 12, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', '57af0b38-12f2-4a38-a433-879be7ad0192', '장지교 사거리 앞', '장지동 640', 'active', 13, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', 'e9478f46-49f9-4037-9fae-7524bcbfba91', '가락시장역 7번출구', '문정동', 'active', 14, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', '7bffb3cb-2379-4b15-bddf-52dddf0db881', '송파역 3번 출구 옆', '가락동', 'active', 15, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', 'e9478f46-49f9-4037-9fae-7524bcbfba91', '법조단지 앞 사거리', '문정동', 'active', 16, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', '57af0b38-12f2-4a38-a433-879be7ad0192', '장지교 사거리2', '장지동', 'active', 17, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', '561e5087-799a-48a8-927c-bf7b58b737a1', '거여동 사거리', '거여동', 'active', 18, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', '4ab545d0-9232-470e-bd92-f7f4555fb290', '송파역 2번 출구 옆', '송파동', 'active', 19, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '01d96bb6-3056-472f-a056-2c1ea7a47db5', 'fbb1eed5-018e-4ccb-9fe1-ba22a955c681', '둔촌사거리 보성중고 앞2', '방이동', 'active', 20, 'panel', 5, 0, 0);

-- 삽입된 데이터 확인
SELECT 
    pi.id,
    pi.nickname,
    pi.address,
    pi.panel_type,
    pi.panel_code,
    rg.name as region_name
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '송파구' 
AND pi.panel_type = 'panel'
ORDER BY pi.panel_code; 