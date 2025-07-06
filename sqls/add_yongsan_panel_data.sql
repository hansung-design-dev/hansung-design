-- 용산구 panel 타입 데이터 추가 (1-19번)
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
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', 'adcec3a1-a874-41eb-b533-cd5bc166a6fd', '성촌공원', '강변북로 전자상가IC', 'active', 1, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', '8abae7a9-70f8-4855-ac70-72b173955928', '서부이촌동 우편집중국 앞', '이촌로 버스승강장옆', 'active', 2, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', '01f3aa61-60c9-423d-80f6-ddd045055e03', '한강대교입구', '한강대로 한강대교 북단', 'active', 3, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', '8abae7a9-70f8-4855-ac70-72b173955928', '동부이촌동', '이촌로 빌라맨션 앞', 'active', 4, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', '01f3aa61-60c9-423d-80f6-ddd045055e03', '한강대교북단사거리', '한강로 트럼프월드아파트앞', 'active', 5, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', '0878ceca-590f-48de-ae6a-365c53509e5a', '한강중학교 앞 삼거리1', '국립중앙박물관 방향', 'active', 7, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', '0878ceca-590f-48de-ae6a-365c53509e5a', '한강중학교 앞 삼거리2', '녹사평대로 용산구청 방향', 'active', 8, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', 'a8e84c62-66c5-4deb-a2dd-8e806e8a7988', '원효대교북단', '청파로 용산전자오피스텔 상가 앞', 'active', 9, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', 'f5bf4dd5-4021-4bc8-9428-a1aacb1aceb4', '북한남동', '이태원로 북한남 삼거리', 'active', 10, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', '2d36ea5f-e03e-43a3-bcf8-45608c4a5b33', '경리단 앞 삼거리', '녹사평대로 중앙경리단 삼거리', 'active', 11, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', '8abae7a9-70f8-4855-ac70-72b173955928', '삼각지 육군회관 앞', '이태원로 지방보훈청 앞', 'active', 12, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', 'bc67db82-33c0-4d5f-8f29-8c45b91a2d8e', '서울역', '한강대로 게이트웨이타워 앞', 'active', 13, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', '0878ceca-590f-48de-ae6a-365c53509e5a', '서빙고역앞', '서빙고 지하차도 옆', 'active', 14, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', '7ed72b32-57f7-4f55-a99a-23b7029d443d', '갈월동 숙대입구', '청파로 갈월동 지하차도 옆', 'active', 15, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', 'f5bf4dd5-4021-4bc8-9428-a1aacb1aceb4', '한남역앞 삼거리', '한남역앞 삼거리', 'active', 16, 'panel', 5, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', 'f5bf4dd5-4021-4bc8-9428-a1aacb1aceb4', '이태원입구', '이태원로 입구', 'active', 17, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', 'f5bf4dd5-4021-4bc8-9428-a1aacb1aceb4', '효창공원 숙대뒤편', '효창로 효창공원입구', 'active', 18, 'panel', 6, 0, 0),
(gen_random_uuid(), '8178084e-1f13-40bc-8b90-7b8ddc58bf64', '0d53c49c-4033-415b-b309-98d3fdc3d3ea', 'f5bf4dd5-4021-4bc8-9428-a1aacb1aceb4', '남영동 주민센터', '두텁바위로 남영동 주민센터 앞', 'active', 19, 'panel', 6, 0, 0);

-- 삽입된 데이터 확인
SELECT 
    pi.id,
    pi.nickname,
    pi.address,
    pi.panel_type,
    pi.panel_code,
    pi.max_banner,
    rg.name as region_name
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
WHERE rg.name = '용산구' 
AND pi.panel_type = 'panel'
ORDER BY pi.panel_code; 