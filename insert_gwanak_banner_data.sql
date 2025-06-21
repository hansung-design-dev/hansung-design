-- 관악구 현수막 게시대 데이터 입력 스크립트
-- 1. 기본 데이터 확인 및 입력

-- 1-1. 관악구 데이터 확인 (이미 존재하는지 확인)
SELECT * FROM region_gu WHERE name = '관악구';
-- 패널인포에 닉네임 추가 (각 주소를 짧게 부르는 홈페이지의 '비고'란에 들어있는 내용 null있음.)
ALTER TABLE panel_info
ADD COLUMN nickname TEXT;

--1 관악구 위도경도
INSERT INTO region_gu ()
-- 1-3. 관악구의 행정동 데이터 추가
INSERT INTO region_dong (district_code, name) VALUES
('gwanak', '성현동'),
('gwanak', '대학동'),
('gwanak', '행운동'),
('gwanak', '난곡동'),
('gwanak', '조원동'),
('gwanak', '남현동'),
('gwanak', '서원동')
ON CONFLICT (district_code, name) DO NOTHING;

-- 1-4. 현수막 디스플레이 타입 확인
SELECT * FROM display_types WHERE name = 'banner_display';
INSERT INTO display_types (name) VALUES ('banner_display')
-- 2. post_code notnull 드롭
ALTER TABLE panel_info
ALTER COLUMN post_code DROP NOT NULL;

INSERT INTO region_dong (district_code, name) VALUES
('gwanak', '성현동'),
('gwanak', '대학동'),
('gwanak', '행운동'),
('gwanak', '난곡동'),
('gwanak', '조원동'),
('gwanak', '남현동'),
('gwanak', '서원동')
ON CONFLICT (district_code, name) DO NOTHING;

-- 2-1. 강남중앙교회 건너편(가)(봉천고개) 게시대 - 성현동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  '548f8a9a-ba58-4d66-82a0-65c8533beb8b',
  '5165dddb-3929-4f40-bd6d-56cd44d27fa0',
  '강남중앙교회 건너편(가)(봉천고개)',
  '관악로285',
  'active'
);

-- 2-2. 관악IC 만남의 광장(가) 게시대 - 대학동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  '548f8a9a-ba58-4d66-82a0-65c8533beb8b',
  '5576c452-1277-4b3f-89d6-d6ca0d81c737',
  '관악IC 만남의 광장(가)(관악산입구 건너편)',
  '신림로',
  'active'
);

-- 2-3. 관악IC 만남의 광장(나) 게시대 - 대학동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  '548f8a9a-ba58-4d66-82a0-65c8533beb8b',
  '5576c452-1277-4b3f-89d6-d6ca0d81c737',
  '관악IC 만남의 광장(나)(관악산입구 건너편)',
  '신림로',
  'active'
);

-- 2-4. 신림중 담장앞 게시대 - 대학동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  '548f8a9a-ba58-4d66-82a0-65c8533beb8b',
  '5576c452-1277-4b3f-89d6-d6ca0d81c737',
  '신림중 담장앞',
  '신림로',
  'active'
);

-- 2-5. 원당초등학교 담장 옆 게시대 - 행운동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  '548f8a9a-ba58-4d66-82a0-65c8533beb8b',
  'fb3eeeb0-30db-48e2-a9f2-5712815bc458',
  '원당초등학교 담장 옆(서울대학교 입구)',
  '봉천로 505',
  'active'
);

-- 2-6. 강남중앙교회 건너편(나) 게시대 - 성현동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  '548f8a9a-ba58-4d66-82a0-65c8533beb8b',
  '5165dddb-3929-4f40-bd6d-56cd44d27fa0',
  '강남중앙교회 건너편(나)',
  '관악로 285',
  'active'
);

-- 2-7. 난곡보건소 맞은편(우측) 게시대 - 난곡동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  '548f8a9a-ba58-4d66-82a0-65c8533beb8b',
  '9b9b922d-0bbe-44a2-859c-44d36db40b2f',
  '난곡보건소 맞은편(우측)',
  'active'
);

-- 2-8. 현대A교차로 옆 게시대 - 조원동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  '548f8a9a-ba58-4d66-82a0-65c8533beb8b',
  '9f3c1dd4-315e-44c3-8c01-b9de75b19eaf',
  '현대A교차로 옆(시민의 숲 삼거리)(배수펌프장앞)',
  '신사로60',
  'active'
);

-- 2-9. 난곡보건소 맞은편(좌측) 게시대 - 난곡동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  '548f8a9a-ba58-4d66-82a0-65c8533beb8b',
  '9b9b922d-0bbe-44a2-859c-44d36db40b2f',
  '난곡보건소 맞은편(좌측)',
  '난곡로154',
  'active'
);

-- 2-10. 사당역 홈플러스 공터 옆 게시대 - 남현동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  '548f8a9a-ba58-4d66-82a0-65c8533beb8b',
  '49f161e3-d720-451d-96be-df1e02444ffb',
  '사당역 홈플러스 공터 옆',
  '남현동 611-3',
  'active'
);

-- 2-11. 서원동 GS주유소 건너편(가) 게시대 - 서원동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  '548f8a9a-ba58-4d66-82a0-65c8533beb8b',
  '698ddd37-fcc5-46e7-a6e8-0a9822d52d00',
  '서원동 GS주유소 건너편(가)',
  '신림로',
  'active'
);

-- 2-12. 서원동 GS주유소 건너편(나) 게시대 - 서원동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  '548f8a9a-ba58-4d66-82a0-65c8533beb8b',
  '698ddd37-fcc5-46e7-a6e8-0a9822d52d00',
  '서원동 GS주유소 건너편(나)',
  '신림로',
  'active'
);

-- 2-13. 사당역IC(강남순환고속도로) 게시대 - 남현동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  '548f8a9a-ba58-4d66-82a0-65c8533beb8b',
  '49f161e3-d720-451d-96be-df1e02444ffb',
  '사당역IC(강남순환고속도로)',
  '남현동 산 69-19',
  'active'
);

-- 3. 현수막 게시대 상세 정보 입력 (banner_panel_details)
-- 각 게시대별로 면수 정보 입력 (주소로 구분)

INSERT INTO banner_panel_details (panel_info_id, max_banners, panel_height, panel_width) VALUES
('f2c0172f-6270-40e2-beb5-907ee24723cf', 5, 70.00, 700.00), -- 강남중앙교회 건너편(가)
('c0dcaacb-3d2b-4d3d-94a0-cb1cefc4cf87', 4, 70.00, 700.00), -- 관악IC 만남의 광장(가)
('abeb4da2-a158-4d45-97ba-bf4ac5c60fab', 1, 70.00, 700.00), -- 관악IC 만남의 광장(나)
('e157d8c9-0f3f-4ccf-9bc8-63604591ed3f', 5, 70.00, 700.00), -- 신림중 담장앞
('594c8b63-5a11-41bf-91a6-ebc819dbf590', 5, 70.00, 700.00), -- 원당초등학교 담장 옆
('b0ee2a4f-d5d5-4cfd-bdef-c13e0e601189', 5, 70.00, 700.00), -- 강남중앙교회 건너편(나)
('d3a262e8-5aad-4a14-bb8c-17e3a3d45a61', 5, 70.00, 700.00), -- 난곡보건소 맞은편(우측)
('6cace8eb-2ba7-4f39-87a7-d87a05cad2ba', 5, 70.00, 700.00), -- 현대A교차로 옆
('69b7cd7f-cfe5-4dec-8419-b0af7222e411', 5, 70.00, 700.00), -- 난곡보건소 맞은편(좌측)
('a19ff1cb-edc0-47fb-84a7-31248b513c85', 5, 70.00, 700.00), -- 사당역 홈플러스 공터 옆
('7c8d518a-654e-4790-81b2-b665cb1966e6', 5, 70.00, 700.00), -- 서원동 GS주유소 건너편(가)
('1192252d-2ab3-4400-97f4-0ac43eb95f09', 5, 70.00, 700.00), -- 서원동 GS주유소 건너편(나)
('2d5d4057-d1d8-4f91-87fc-644357360e4c', 5, 70.00, 700.00); -- 사당역IC
