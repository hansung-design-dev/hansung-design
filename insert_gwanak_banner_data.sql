-- 관악구 현수막 게시대 데이터 입력 스크립트
-- 1. 기본 데이터 확인 및 입력

-- 1-1. 관악구 데이터 확인 (이미 존재하는지 확인)
SELECT * FROM region_gu WHERE name = '관악구';

-- 관악구가 없다면 추가
INSERT INTO region_gu (code, name) VALUES ('gwanak', '관악구')
ON CONFLICT (code) DO NOTHING;

-- 1-2. 패널인포에 닉네임 추가 (각 주소를 짧게 부르는 홈페이지의 '비고'란에 들어있는 내용 null있음.)
ALTER TABLE panel_info
ADD COLUMN nickname TEXT;

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

-- 1-4. 현수막 디스플레이 타입 확인 및 추가
INSERT INTO display_types (name) VALUES ('banner_display')
ON CONFLICT (name) DO NOTHING;

-- 1-5. post_code notnull 드롭
ALTER TABLE panel_info
ALTER COLUMN post_code DROP NOT NULL;

-- 1-6. post_code 컬럼을 NULL 허용으로 변경
ALTER TABLE panel_info
ALTER COLUMN post_code DROP NOT NULL;

-- 2. 현수막 게시대 데이터 입력

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
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE name = '성현동' AND district_code = 'gwanak'),
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
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE name = '대학동' AND district_code = 'gwanak'),
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
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE name = '대학동' AND district_code = 'gwanak'),
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
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE name = '대학동' AND district_code = 'gwanak'),
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
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE name = '행운동' AND district_code = 'gwanak'),
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
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE name = '성현동' AND district_code = 'gwanak'),
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
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE name = '난곡동' AND district_code = 'gwanak'),
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
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE name = '조원동' AND district_code = 'gwanak'),
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
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE name = '난곡동' AND district_code = 'gwanak'),
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
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE name = '남현동' AND district_code = 'gwanak'),
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
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE name = '서원동' AND district_code = 'gwanak'),
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
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE name = '서원동' AND district_code = 'gwanak'),
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
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE name = '남현동' AND district_code = 'gwanak'),
  '사당역IC(강남순환고속도로)',
  '남현동 산 69-19',
  'active'
);

-- 3. 현수막 게시대 상세 정보 입력 (banner_slot_info)
-- 각 게시대별로 면수 정보 입력 (주소로 구분)
INSERT INTO banner_slot_info (
  panel_info_id, slot_number, slot_name, max_width, max_height,
  base_price, tax_price, banner_type, price_unit, is_premium, panel_slot_status
) VALUES
-- 강남중앙교회 건너편(가)(봉천고개) - 5면
((SELECT id FROM panel_info WHERE address = '강남중앙교회 건너편(가)(봉천고개)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '강남중앙교회 건너편(가)(봉천고개)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '강남중앙교회 건너편(가)(봉천고개)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '강남중앙교회 건너편(가)(봉천고개)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '강남중앙교회 건너편(가)(봉천고개)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),

-- 관악IC 만남의 광장(가)(관악산입구 건너편) - 4면
((SELECT id FROM panel_info WHERE address = '관악IC 만남의 광장(가)(관악산입구 건너편)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '관악IC 만남의 광장(가)(관악산입구 건너편)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '관악IC 만남의 광장(가)(관악산입구 건너편)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '관악IC 만남의 광장(가)(관악산입구 건너편)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),

-- 관악IC 만남의 광장(나)(관악산입구 건너편) - 1면
((SELECT id FROM panel_info WHERE address = '관악IC 만남의 광장(나)(관악산입구 건너편)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),

-- 신림중 담장앞 - 5면
((SELECT id FROM panel_info WHERE address = '신림중 담장앞' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림중 담장앞' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림중 담장앞' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림중 담장앞' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림중 담장앞' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),

-- 원당초등학교 담장 옆(서울대학교 입구) - 5면
((SELECT id FROM panel_info WHERE address = '원당초등학교 담장 옆(서울대학교 입구)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '원당초등학교 담장 옆(서울대학교 입구)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '원당초등학교 담장 옆(서울대학교 입구)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '원당초등학교 담장 옆(서울대학교 입구)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '원당초등학교 담장 옆(서울대학교 입구)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),

-- 강남중앙교회 건너편(나) - 5면
((SELECT id FROM panel_info WHERE address = '강남중앙교회 건너편(나)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '강남중앙교회 건너편(나)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '강남중앙교회 건너편(나)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '강남중앙교회 건너편(나)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '강남중앙교회 건너편(나)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),

-- 난곡보건소 맞은편(우측) - 5면
((SELECT id FROM panel_info WHERE address = '난곡보건소 맞은편(우측)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '난곡보건소 맞은편(우측)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '난곡보건소 맞은편(우측)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '난곡보건소 맞은편(우측)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '난곡보건소 맞은편(우측)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),

-- 현대A교차로 옆(시민의 숲 삼거리)(배수펌프장앞) - 5면
((SELECT id FROM panel_info WHERE address = '현대A교차로 옆(시민의 숲 삼거리)(배수펌프장앞)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '현대A교차로 옆(시민의 숲 삼거리)(배수펌프장앞)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '현대A교차로 옆(시민의 숲 삼거리)(배수펌프장앞)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '현대A교차로 옆(시민의 숲 삼거리)(배수펌프장앞)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '현대A교차로 옆(시민의 숲 삼거리)(배수펌프장앞)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),

-- 난곡보건소 맞은편(좌측) - 5면
((SELECT id FROM panel_info WHERE address = '난곡보건소 맞은편(좌측)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '난곡보건소 맞은편(좌측)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '난곡보건소 맞은편(좌측)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '난곡보건소 맞은편(좌측)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '난곡보건소 맞은편(좌측)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),

-- 사당역 홈플러스 공터 옆 - 5면
((SELECT id FROM panel_info WHERE address = '사당역 홈플러스 공터 옆' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '사당역 홈플러스 공터 옆' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '사당역 홈플러스 공터 옆' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '사당역 홈플러스 공터 옆' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '사당역 홈플러스 공터 옆' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),

-- 서원동 GS주유소 건너편(가) - 5면
((SELECT id FROM panel_info WHERE address = '서원동 GS주유소 건너편(가)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '서원동 GS주유소 건너편(가)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '서원동 GS주유소 건너편(가)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '서원동 GS주유소 건너편(가)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '서원동 GS주유소 건너편(가)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),

-- 서원동 GS주유소 건너편(나) - 5면
((SELECT id FROM panel_info WHERE address = '서원동 GS주유소 건너편(나)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '서원동 GS주유소 건너편(나)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '서원동 GS주유소 건너편(나)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '서원동 GS주유소 건너편(나)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '서원동 GS주유소 건너편(나)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),

-- 사당역IC(강남순환고속도로) - 5면
((SELECT id FROM panel_info WHERE address = '사당역IC(강남순환고속도로)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '사당역IC(강남순환고속도로)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '사당역IC(강남순환고속도로)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '사당역IC(강남순환고속도로)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available'),
((SELECT id FROM panel_info WHERE address = '사당역IC(강남순환고속도로)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'panel', '15 days', false, 'available');

-- 4. 현수막 게시대 상세 정보 입력 (banner_panel_details)
-- 각 게시대별로 상세 정보 입력 (주소로 구분)
INSERT INTO banner_panel_details (
  panel_info_id, max_banners, panel_height, panel_width, is_for_admin
) VALUES
-- 강남중앙교회 건너편(가)(봉천고개) - 5면
((SELECT id FROM panel_info WHERE address = '강남중앙교회 건너편(가)(봉천고개)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, 70.00, 700.00, false),

-- 관악IC 만남의 광장(가)(관악산입구 건너편) - 4면
((SELECT id FROM panel_info WHERE address = '관악IC 만남의 광장(가)(관악산입구 건너편)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 4, 70.00, 700.00, false),

-- 관악IC 만남의 광장(나)(관악산입구 건너편) - 1면
((SELECT id FROM panel_info WHERE address = '관악IC 만남의 광장(나)(관악산입구 건너편)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 1, 70.00, 700.00, false),

-- 신림중 담장앞 - 5면
((SELECT id FROM panel_info WHERE address = '신림중 담장앞' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, 70.00, 700.00, false),

-- 원당초등학교 담장 옆(서울대학교 입구) - 5면
((SELECT id FROM panel_info WHERE address = '원당초등학교 담장 옆(서울대학교 입구)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, 70.00, 700.00, false),

-- 강남중앙교회 건너편(나) - 5면
((SELECT id FROM panel_info WHERE address = '강남중앙교회 건너편(나)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, 70.00, 700.00, false),

-- 난곡보건소 맞은편(우측) - 5면
((SELECT id FROM panel_info WHERE address = '난곡보건소 맞은편(우측)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, 70.00, 700.00, false),

-- 현대A교차로 옆(시민의 숲 삼거리)(배수펌프장앞) - 5면
((SELECT id FROM panel_info WHERE address = '현대A교차로 옆(시민의 숲 삼거리)(배수펌프장앞)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, 70.00, 700.00, false),

-- 난곡보건소 맞은편(좌측) - 5면
((SELECT id FROM panel_info WHERE address = '난곡보건소 맞은편(좌측)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, 70.00, 700.00, false),

-- 사당역 홈플러스 공터 옆 - 5면
((SELECT id FROM panel_info WHERE address = '사당역 홈플러스 공터 옆' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, 70.00, 700.00, false),

-- 서원동 GS주유소 건너편(가) - 5면
((SELECT id FROM panel_info WHERE address = '서원동 GS주유소 건너편(가)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, 70.00, 700.00, false),

-- 서원동 GS주유소 건너편(나) - 5면
((SELECT id FROM panel_info WHERE address = '서원동 GS주유소 건너편(나)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, 70.00, 700.00, false),

-- 사당역IC(강남순환고속도로) - 5면
((SELECT id FROM panel_info WHERE address = '사당역IC(강남순환고속도로)' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '관악구')), 5, 70.00, 700.00, false);


