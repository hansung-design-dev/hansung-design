-- 관악구 현수막 게시대 데이터 입력 스크립트
-- 1. 기본 데이터 확인 및 입력

-- 1-1. 관악구 데이터 확인 (이미 존재하는지 확인)
SELECT * FROM region_gu WHERE name = '관악구';

-- 1-2. 관악구가 없다면 추가
INSERT INTO region_gu (code, name, logo_image) 
VALUES ('gwanak', '관악구', '/images/district-icon/gwanak-gu.png')
ON CONFLICT (code) DO NOTHING;

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

-- 1-5. 현수막 디스플레이 타입이 없다면 추가
INSERT INTO display_types (name, description) 
VALUES ('banner_display', '현수막 게시대')
ON CONFLICT (name) DO NOTHING;

-- 2. 관악구 현수막 게시대 기본 정보 입력
-- 각 게시대별로 panel_info, banner_panel_details, banner_slot_info 테이블에 데이터 입력

-- 2-1. 강남중앙교회 건너편(가)(봉천고개) 게시대
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  latitude,
  longitude,
  panel_status,
  maintenance_notes
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE district_code = 'gwanak' AND name = '성현동'),
  '관악로 285',
  37.4789,
  126.9517,
  'active',
  '관악로 285'
);

-- 2-2. 관악IC 만남의 광장(가)(관악산입구 건너편) 게시대
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  latitude,
  longitude,
  panel_status,
  maintenance_notes
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE district_code = 'gwanak' AND name = '대학동'),
  '신림로',
  37.4789,
  126.9517,
  'active',
  '신림로'
);

-- 2-3. 관악IC 만남의 광장(나)(관악산입구 건너편) 게시대
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  latitude,
  longitude,
  panel_status,
  maintenance_notes
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE district_code = 'gwanak' AND name = '대학동'),
  '신림로',
  37.4789,
  126.9517,
  'active',
  '신림로'
);

-- 2-4. 신림중 담장앞 게시대
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  latitude,
  longitude,
  panel_status,
  maintenance_notes
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE district_code = 'gwanak' AND name = '대학동'),
  '신림로',
  37.4789,
  126.9517,
  'active',
  '신림로'
);

-- 2-5. 원당초등학교 담장 옆(서울대학교 입구) 게시대
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  latitude,
  longitude,
  panel_status,
  maintenance_notes
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE district_code = 'gwanak' AND name = '행운동'),
  '봉천로 505',
  37.4789,
  126.9517,
  'active',
  '봉천로 505'
);

-- 2-6. 강남중앙교회 건너편(나) 게시대
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  latitude,
  longitude,
  panel_status,
  maintenance_notes
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE district_code = 'gwanak' AND name = '성현동'),
  '관악로 285',
  37.4789,
  126.9517,
  'active',
  '관악로 285'
);

-- 2-7. 난곡보건소 맞은편(우측) 게시대
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  latitude,
  longitude,
  panel_status,
  maintenance_notes
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE district_code = 'gwanak' AND name = '난곡동'),
  '',
  37.4789,
  126.9517,
  'active',
  ''
);

-- 2-8. 현대A교차로 옆(시민의 숲 삼거리)(배수펌프장앞) 게시대
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  latitude,
  longitude,
  panel_status,
  maintenance_notes
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE district_code = 'gwanak' AND name = '조원동'),
  '신사로60',
  37.4789,
  126.9517,
  'active',
  '신사로60'
);

-- 2-9. 난곡보건소 맞은편(좌측) 게시대
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  latitude,
  longitude,
  panel_status,
  maintenance_notes
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE district_code = 'gwanak' AND name = '난곡동'),
  '난곡로154',
  37.4789,
  126.9517,
  'active',
  '난곡로154'
);

-- 2-10. 사당역 홈플러스 공터 옆 게시대
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  latitude,
  longitude,
  panel_status,
  maintenance_notes
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE district_code = 'gwanak' AND name = '남현동'),
  '남현동 611-3',
  37.4789,
  126.9517,
  'active',
  '남현동 611-3'
);

-- 2-11. 서원동 GS주유소 건너편(가) 게시대
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  latitude,
  longitude,
  panel_status,
  maintenance_notes
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE district_code = 'gwanak' AND name = '서원동'),
  '신림로',
  37.4789,
  126.9517,
  'active',
  '신림로'
);

-- 2-12. 서원동 GS주유소 건너편(나) 게시대
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  latitude,
  longitude,
  panel_status,
  maintenance_notes
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE district_code = 'gwanak' AND name = '서원동'),
  '신림로',
  37.4789,
  126.9517,
  'active',
  '신림로'
);

-- 2-13. 사당역IC(강남순환고속도로) 게시대
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  latitude,
  longitude,
  panel_status,
  maintenance_notes
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '관악구'),
  (SELECT id FROM region_dong WHERE district_code = 'gwanak' AND name = '남현동'),
  '남현동 산 69-19',
  37.4789,
  126.9517,
  'active',
  '남현동 산 69-19'
);

-- 3. 현수막 게시대 상세 정보 입력 (banner_panel_details)
-- 각 게시대별로 면수 정보 입력 (주소로 구분)

INSERT INTO banner_panel_details (panel_info_id, max_banners, panel_height, panel_width) VALUES
((SELECT id FROM panel_info WHERE address = '관악로 285' AND maintenance_notes = '관악로 285' LIMIT 1), 5, 70.00, 700.00),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 0), 4, 70.00, 700.00),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 1), 1, 70.00, 700.00),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 2), 5, 70.00, 700.00),
((SELECT id FROM panel_info WHERE address = '봉천로 505'), 5, 70.00, 700.00),
((SELECT id FROM panel_info WHERE address = '관악로 285' AND maintenance_notes = '관악로 285' LIMIT 1 OFFSET 1), 5, 70.00, 700.00),
((SELECT id FROM panel_info WHERE address = ''), 5, 70.00, 700.00),
((SELECT id FROM panel_info WHERE address = '신사로60'), 5, 70.00, 700.00),
((SELECT id FROM panel_info WHERE address = '난곡로154'), 5, 70.00, 700.00),
((SELECT id FROM panel_info WHERE address = '남현동 611-3'), 5, 70.00, 700.00),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 3), 5, 70.00, 700.00),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 4), 5, 70.00, 700.00),
((SELECT id FROM panel_info WHERE address = '남현동 산 69-19'), 5, 70.00, 700.00);

-- 4. 현수막 면 정보 입력 (banner_slot_info)
-- 각 게시대별로 슬롯 정보 입력 (가격: 110,000원, 15일 기준)

INSERT INTO banner_slot_info (
  panel_info_id, 
  slot_number, 
  slot_name, 
  max_width, 
  max_height, 
  base_price, 
  tax_price, 
  banner_type, 
  price_unit, 
  is_premium, 
  panel_slot_status
) VALUES
-- 1번 게시대: 강남중앙교회 건너편(가) - 5개 슬롯
((SELECT id FROM panel_info WHERE address = '관악로 285' AND maintenance_notes = '관악로 285' LIMIT 1), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '관악로 285' AND maintenance_notes = '관악로 285' LIMIT 1), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '관악로 285' AND maintenance_notes = '관악로 285' LIMIT 1), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '관악로 285' AND maintenance_notes = '관악로 285' LIMIT 1), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '관악로 285' AND maintenance_notes = '관악로 285' LIMIT 1), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),

-- 2번 게시대: 관악IC 만남의 광장(가) - 4개 슬롯
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 0), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 0), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 0), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 0), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),

-- 3번 게시대: 관악IC 만남의 광장(나) - 1개 슬롯
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 1), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),

-- 4번 게시대: 신림중 담장앞 - 5개 슬롯
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 2), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 2), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 2), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 2), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 2), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),

-- 5번 게시대: 원당초등학교 담장 옆 - 5개 슬롯
((SELECT id FROM panel_info WHERE address = '봉천로 505'), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '봉천로 505'), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '봉천로 505'), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '봉천로 505'), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '봉천로 505'), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),

-- 6번 게시대: 강남중앙교회 건너편(나) - 5개 슬롯
((SELECT id FROM panel_info WHERE address = '관악로 285' AND maintenance_notes = '관악로 285' LIMIT 1 OFFSET 1), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '관악로 285' AND maintenance_notes = '관악로 285' LIMIT 1 OFFSET 1), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '관악로 285' AND maintenance_notes = '관악로 285' LIMIT 1 OFFSET 1), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '관악로 285' AND maintenance_notes = '관악로 285' LIMIT 1 OFFSET 1), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '관악로 285' AND maintenance_notes = '관악로 285' LIMIT 1 OFFSET 1), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),

-- 7번 게시대: 난곡보건소 맞은편(우측) - 5개 슬롯
((SELECT id FROM panel_info WHERE address = ''), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = ''), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = ''), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = ''), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = ''), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),

-- 8번 게시대: 현대A교차로 옆 - 5개 슬롯
((SELECT id FROM panel_info WHERE address = '신사로60'), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신사로60'), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신사로60'), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신사로60'), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신사로60'), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),

-- 9번 게시대: 난곡보건소 맞은편(좌측) - 5개 슬롯
((SELECT id FROM panel_info WHERE address = '난곡로154'), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '난곡로154'), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '난곡로154'), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '난곡로154'), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '난곡로154'), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),

-- 10번 게시대: 사당역 홈플러스 공터 옆 - 5개 슬롯
((SELECT id FROM panel_info WHERE address = '남현동 611-3'), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '남현동 611-3'), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '남현동 611-3'), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '남현동 611-3'), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '남현동 611-3'), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),

-- 11번 게시대: 서원동 GS주유소 건너편(가) - 5개 슬롯
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 3), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 3), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 3), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 3), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 3), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),

-- 12번 게시대: 서원동 GS주유소 건너편(나) - 5개 슬롯
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 4), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 4), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 4), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 4), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '신림로' AND maintenance_notes = '신림로' LIMIT 1 OFFSET 4), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),

-- 13번 게시대: 사당역IC(강남순환고속도로) - 5개 슬롯
((SELECT id FROM panel_info WHERE address = '남현동 산 69-19'), 1, '1번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '남현동 산 69-19'), 2, '2번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '남현동 산 69-19'), 3, '3번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '남현동 산 69-19'), 4, '4번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available'),
((SELECT id FROM panel_info WHERE address = '남현동 산 69-19'), 5, '5번면', 700.00, 70.00, 110000.00, 0.00, 'horizontal', 'daily', false, 'available');

-- 5. 데이터 확인 쿼리
-- 관악구 현수막 게시대 전체 목록 조회
SELECT 
  ROW_NUMBER() OVER (ORDER BY pi.address) as "No",
  pi.address as "게시대명칭",
  rd.name as "행정동",
  bsi.base_price + bsi.tax_price as "게시금액(원)",
  CONCAT(bsi.max_width, 'x', bsi.max_height, 'cm') as "규격(cm)",
  bpd.max_banners as "면수",
  pi.maintenance_notes as "비고"
FROM panel_info pi
JOIN region_gu rg ON pi.region_gu_id = rg.id
JOIN region_dong rd ON pi.region_dong_id = rd.id
JOIN banner_panel_details bpd ON pi.id = bpd.panel_info_id
JOIN banner_slot_info bsi ON pi.id = bsi.panel_info_id
WHERE rg.name = '관악구' AND bsi.slot_number = 1
ORDER BY pi.address; 