-- 서대문구 현수막 게시대 데이터 입력 스크립트
-- 1. 기본 데이터 확인 및 입력

-- 1-1. 서대문구 데이터 확인 (이미 존재하는지 확인)
SELECT * FROM region_gu WHERE name = '서대문구';

-- 서대문구가 없다면 추가
INSERT INTO region_gu (code, name) VALUES ('seodaemun', '서대문구')
ON CONFLICT (code) DO NOTHING;

-- 1-2. 서대문구의 행정동 데이터 추가
INSERT INTO region_dong (district_code, name) VALUES
('seodaemun', '연희동'),
('seodaemun', '천연동'),
('seodaemun', '홍제1동'),
('seodaemun', '홍은동'),
('seodaemun', '신촌동'),
('seodaemun', '남가좌1동'),
('seodaemun', '북아현동'),
('seodaemun', '대현동'),
('seodaemun', '대신동'),
('seodaemun', '홍제동'),
('seodaemun', '북가좌1동'),
('seodaemun', '남가좌2동')
ON CONFLICT (district_code, name) DO NOTHING;

-- 1-3. 현수막 디스플레이 타입 확인 및 추가
INSERT INTO display_types (name) VALUES ('banner_display')
ON CONFLICT (name) DO NOTHING;

-- 2. 현수막 게시대 데이터 입력

-- 2-1. (행정용) 서대문보건소 옆(연희동141-47) 게시대 - 연희동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '연희동' AND district_code = 'seodaemun'),
  '서대문보건소 옆',
  '연희동141-47',
  'active'
);

-- 2-2. (행정용) 대림아파트앞(연희동 산66-2) 게시대 - 연희동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '연희동' AND district_code = 'seodaemun'),
  '대림아파트앞',
  '연희동 산66-2',
  'active'
);

-- 2-3. (행정용) 연대정문 건너편 오른쪽(창천동83-1) 게시대 - 천연동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '천연동' AND district_code = 'seodaemun'),
  '연대정문 건너편 오른쪽',
  '창천동83-1',
  'active'
);

-- 2-4. (행정용) 사천교 오른쪽(남가좌동 사천교옆) 게시대 - 홍제1동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '홍제1동' AND district_code = 'seodaemun'),
  '사천교 오른쪽',
  '남가좌동 사천교옆',
  'active'
);

-- 2-5. (행정용) 증산교(북가좌동 증산교다리) 게시대 - 북가좌1동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '북가좌1동' AND district_code = 'seodaemun'),
  '증산교',
  '북가좌동 증산교다리',
  'active'
);

-- 2-6. (행정용) 연희입체교차로(연희동193-8) 게시대 - 홍은동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '홍은동' AND district_code = 'seodaemun'),
  '연희입체교차로',
  '연희동193-8',
  'active'
);

-- 2-7. (행정용) 연가교(남가좌동115-63앞) 게시대 - 연희동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '연희동' AND district_code = 'seodaemun'),
  '연가교',
  '남가좌동115-63앞',
  'active'
);

-- 2-8. (행정용) 무악재 왼쪽(현저동1-7) 게시대 - 신촌동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '신촌동' AND district_code = 'seodaemun'),
  '무악재 왼쪽',
  '현저동1-7',
  'active'
);

-- 2-9. (행정용) 가좌역 횡단보도 (남가좌동 293-3) 게시대 - 연희동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '연희동' AND district_code = 'seodaemun'),
  '가좌역 횡단보도',
  '남가좌동 293-3',
  'active'
);

-- 2-10. (행정용) 홍연2교 (홍은동422-11) 게시대 - 연희동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '연희동' AND district_code = 'seodaemun'),
  '홍연2교',
  '홍은동422-11',
  'active'
);

-- 2-11. (행정용) 서대문구청 제3별관 (연희동169-1) 게시대 - 남가좌1동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '남가좌1동' AND district_code = 'seodaemun'),
  '서대문구청 제3별관',
  '연희동169-1',
  'active'
);

-- 2-12. (행정용) 북아현119센터 횡단보도(북아현동1015-2) 게시대 - 북아현동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '북아현동' AND district_code = 'seodaemun'),
  '북아현119센터 횡단보도',
  '북아현동1015-2',
  'active'
);

-- 2-13. (행정용) 세브란스건너편 게시대 - 대현동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '대현동' AND district_code = 'seodaemun'),
  '세브란스건너편',
  NULL,
  'active'
);

-- 2-14. (행정용) 신촌기차역 게시대 - 대신동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '대신동' AND district_code = 'seodaemun'),
  '신촌기차역',
  NULL,
  'active'
);

-- 2-15. (행정용) 홍은사거리 게시대 - 홍은동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '홍은동' AND district_code = 'seodaemun'),
  '홍은사거리',
  NULL,
  'active'
);

-- 2-16. (행정용) 홍제교 게시대 - 홍제동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '홍제동' AND district_code = 'seodaemun'),
  '홍제교',
  NULL,
  'active'
);

-- 2-17. (상업용) 홍은초교(홍제동286-12) 게시대 - 홍제1동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '홍제1동' AND district_code = 'seodaemun'),
  '홍은초교',
  '홍제동286-12',
  'active'
);

-- 2-18. (상업용) 산골고개(홍은동172-1) 게시대 - 신촌동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '신촌동' AND district_code = 'seodaemun'),
  '산골고개',
  '홍은동172-1',
  'active'
);

-- 2-19. (상업용) 연대학군단 앞(신촌동27 도로변) 게시대 - 연희동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '연희동' AND district_code = 'seodaemun'),
  '연대학군단 앞',
  '신촌동27 도로변',
  'active'
);

-- 2-20. (상업용) 연대정문 건너편 왼쪽(창천동83-1) 게시대 - 북가좌1동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '북가좌1동' AND district_code = 'seodaemun'),
  '연대정문 건너편 왼쪽',
  '창천동83-1',
  'active'
);

-- 2-21. (상업용) 연희입체교차로(연희동193-8) 게시대 - 남가좌2동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '남가좌2동' AND district_code = 'seodaemun'),
  '연희입체교차로',
  '연희동193-8 상업용',
  'active'
);

-- 2-22. (상업용) 사천교 왼쪽(남가좌동 사천교옆) 게시대 - 남가좌1동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '남가좌1동' AND district_code = 'seodaemun'),
  '사천교 왼쪽',
  '남가좌동 사천교옆',
  'active'
);

-- 2-23. (상업용) 현대월드컵아파트(북가좌동현대@101동옆) 게시대 - 남가좌1동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '남가좌1동' AND district_code = 'seodaemun'),
  '현대월드컵아파트',
  '북가좌동현대@101동옆',
  'active'
);

-- 2-24. (상업용) 홍남교(남가좌동329-7앞) 게시대 - 연희동
INSERT INTO panel_info (
  display_type_id,
  region_gu_id,
  region_dong_id,
  address,
  nickname,
  panel_status
) VALUES (
  (SELECT id FROM display_types WHERE name = 'banner_display'),
  (SELECT id FROM region_gu WHERE name = '서대문구'),
  (SELECT id FROM region_dong WHERE name = '연희동' AND district_code = 'seodaemun'),
  '홍남교',
  '남가좌동329-7앞',
  'active'
);

-- 3. 현수막 게시대 상세 정보 입력 (banner_panel_details)
-- 각 게시대별로 상세 정보 입력 (주소+닉네임으로 구분)
INSERT INTO banner_panel_details (
  panel_info_id, max_banners, panel_height, panel_width, is_for_admin
) VALUES
-- 1
((SELECT id FROM panel_info WHERE address = '서대문보건소 옆' AND nickname = '연희동141-47' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 6, 70.00, 490.00, true),
-- 2
((SELECT id FROM panel_info WHERE address = '대림아파트앞' AND nickname = '연희동 산66-2' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 6, 70.00, 490.00, true),
-- 3
((SELECT id FROM panel_info WHERE address = '연대정문 건너편 오른쪽' AND nickname = '창천동83-1' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 6, 70.00, 490.00, true),
-- 4
((SELECT id FROM panel_info WHERE address = '사천교 오른쪽' AND nickname = '남가좌동 사천교옆' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 6, 70.00, 490.00, true),
-- 5
((SELECT id FROM panel_info WHERE address = '증산교' AND nickname = '북가좌동 증산교다리' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 6, 70.00, 490.00, true),
-- 6
((SELECT id FROM panel_info WHERE address = '연희입체교차로' AND nickname = '연희동193-8' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 5, 70.00, 600.00, true),
-- 7
((SELECT id FROM panel_info WHERE address = '연가교' AND nickname = '남가좌동115-63앞' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 5, 70.00, 600.00, true),
-- 8
((SELECT id FROM panel_info WHERE address = '무악재 왼쪽' AND nickname = '현저동1-7' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 5, 70.00, 600.00, true),
-- 9
((SELECT id FROM panel_info WHERE address = '가좌역 횡단보도' AND nickname = '남가좌동 293-3' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 5, 70.00, 600.00, true),
-- 10
((SELECT id FROM panel_info WHERE address = '홍연2교' AND nickname = '홍은동422-11' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 6, 70.00, 600.00, true),
-- 11
((SELECT id FROM panel_info WHERE address = '서대문구청 제3별관' AND nickname = '연희동169-1' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 6, 70.00, 600.00, true),
-- 12
((SELECT id FROM panel_info WHERE address = '북아현119센터 횡단보도' AND nickname = '북아현동1015-2' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 6, 70.00, 600.00, true),
-- 13
((SELECT id FROM panel_info WHERE address = '세브란스건너편' AND nickname IS NULL AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 6, 70.00, 600.00, true),
-- 14
((SELECT id FROM panel_info WHERE address = '신촌기차역' AND nickname IS NULL AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 6, 70.00, 600.00, true),
-- 15
((SELECT id FROM panel_info WHERE address = '홍은사거리' AND nickname IS NULL AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 6, 70.00, 600.00, true),
-- 16
((SELECT id FROM panel_info WHERE address = '홍제교' AND nickname IS NULL AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 5, 70.00, 600.00, true),
-- 17
((SELECT id FROM panel_info WHERE address = '홍은초교' AND nickname = '홍제동286-12' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 5, 70.00, 490.00, false),
-- 18
((SELECT id FROM panel_info WHERE address = '산골고개' AND nickname = '홍은동172-1' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 5, 70.00, 490.00, false),
-- 19
((SELECT id FROM panel_info WHERE address = '연대학군단 앞' AND nickname = '신촌동27 도로변' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 6, 70.00, 490.00, false),
-- 20
((SELECT id FROM panel_info WHERE address = '연대정문 건너편 왼쪽' AND nickname = '창천동83-1' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 6, 70.00, 490.00, false),
-- 21
((SELECT id FROM panel_info WHERE address = '연희입체교차로' AND nickname = '연희동193-8' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') AND region_dong_id = (SELECT id FROM region_dong WHERE name = '남가좌2동' AND district_code = 'seodaemun') LIMIT 1), 6, 70.00, 490.00, false),
-- 22
((SELECT id FROM panel_info WHERE address = '사천교 왼쪽' AND nickname = '남가좌동 사천교옆' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 5, 70.00, 490.00, false),
-- 23
((SELECT id FROM panel_info WHERE address = '현대월드컵아파트' AND nickname = '북가좌동현대@101동옆' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 5, 70.00, 490.00, false),
-- 24
((SELECT id FROM panel_info WHERE address = '홍남교' AND nickname = '남가좌동329-7앞' AND region_gu_id = (SELECT id FROM region_gu WHERE name = '서대문구') LIMIT 1), 6, 70.00, 490.00, false);



-- 4. 현수막 게시대 면수별 상세 정보 입력 (banner_slot_info)
-- 각 게시대별로 면수 정보 입력 (주소+닉네임으로 구분)
-- 예시: 6면이면 1~6번면, 5면이면 1~5번면
-- 가격, 규격, 타입, 비고(행정/상업용) 반영
-- (아래는 1번 게시대 예시, 나머지도 동일 패턴으로 반복)
