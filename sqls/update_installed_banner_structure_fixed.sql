-- installed_banner 테이블 구조 변경 및 데이터 삽입 (수정된 버전)

-- 1. display_type_id 컬럼 제거하고 region_gu_id 컬럼 추가
ALTER TABLE public.installed_banner 
DROP COLUMN display_type_id,
ADD COLUMN region_gu_id uuid REFERENCES public.region_gu(id);

-- 2. 인덱스 추가
CREATE INDEX idx_installed_banner_region_gu_id ON public.installed_banner(region_gu_id);
CREATE INDEX idx_installed_banner_created_at ON public.installed_banner(created_at DESC);

-- 3. 각 구별 게첨사진 데이터 삽입 (display_type_id 조건 추가)

-- 관악구 (현수막게시대)
INSERT INTO public.installed_banner (title, region_gu_id, folder_path) VALUES
('4월 전반기', (SELECT id FROM region_gu WHERE name = '관악구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'gwanak/april_first_2025'),
('4월 하반기', (SELECT id FROM region_gu WHERE name = '관악구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'gwanak/april_second_2025'),
('5월 전반기', (SELECT id FROM region_gu WHERE name = '관악구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'gwanak/may_first_2025'),
('5월 하반기', (SELECT id FROM region_gu WHERE name = '관악구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'gwanak/may_second_2025'),
('6월 전반기', (SELECT id FROM region_gu WHERE name = '관악구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'gwanak/june_first_2025'),
('6월 하반기', (SELECT id FROM region_gu WHERE name = '관악구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'gwanak/june_second_2025');

-- 강북구 (현수막게시대)
INSERT INTO public.installed_banner (title, region_gu_id, folder_path) VALUES
('4월 전반기', (SELECT id FROM region_gu WHERE name = '강북구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'gangbuk/april_first_2025'),
('4월 하반기', (SELECT id FROM region_gu WHERE name = '강북구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'gangbuk/april_second_2025'),
('5월 전반기', (SELECT id FROM region_gu WHERE name = '강북구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'gangbuk/may_first_2025'),
('5월 하반기', (SELECT id FROM region_gu WHERE name = '강북구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'gangbuk/may_second_2025'),
('6월 전반기', (SELECT id FROM region_gu WHERE name = '강북구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'gangbuk/june_first_2025'),
('6월 하반기', (SELECT id FROM region_gu WHERE name = '강북구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'gangbuk/june_second_2025');

-- 마포구 (현수막게시대 - 연립형 + 저단형)
INSERT INTO public.installed_banner (title, region_gu_id, folder_path) VALUES
('4월 전반기 연립형', (SELECT id FROM region_gu WHERE name = '마포구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'mapo/april_first_2025_multi'),
('4월 하반기 연립형', (SELECT id FROM region_gu WHERE name = '마포구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'mapo/april_second_2025_multi'),
('5월 전반기 연립형', (SELECT id FROM region_gu WHERE name = '마포구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'mapo/may_first_2025_multi'),
('5월 하반기 연립형', (SELECT id FROM region_gu WHERE name = '마포구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'mapo/may_second_2025_multi'),
('6월 전반기 연립형', (SELECT id FROM region_gu WHERE name = '마포구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'mapo/june_first_2025_multi'),
('6월 하반기 연립형', (SELECT id FROM region_gu WHERE name = '마포구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'mapo/june_seconde_2025_multi'),
('4월 전반기 저단형', (SELECT id FROM region_gu WHERE name = '마포구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'mapo/april_first_2025_lower'),
('4월 하반기 저단형', (SELECT id FROM region_gu WHERE name = '마포구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'mapo/april_second_2025_lower'),
('5월 전반기 저단형', (SELECT id FROM region_gu WHERE name = '마포구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'mapo/may_first_2025_lower'),
('5월 하반기 저단형', (SELECT id FROM region_gu WHERE name = '마포구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'mapo/may_second_2025_lower'),
('6월 전반기 저단형', (SELECT id FROM region_gu WHERE name = '마포구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'mapo/june_first_2025_lower'),
('6월 하반기 저단형', (SELECT id FROM region_gu WHERE name = '마포구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'mapo/june_seconde_2025_lower');

-- 송파구 (현수막게시대)
INSERT INTO public.installed_banner (title, region_gu_id, folder_path) VALUES
('4월 전반기', (SELECT id FROM region_gu WHERE name = '송파구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'songpa/april_first_2025'),
('4월 하반기', (SELECT id FROM region_gu WHERE name = '송파구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'songpa/april_second_2025'),
('5월 전반기', (SELECT id FROM region_gu WHERE name = '송파구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'songpa/may_first_2025'),
('5월 하반기', (SELECT id FROM region_gu WHERE name = '송파구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'songpa/may_second_2025'),
('6월 전반기', (SELECT id FROM region_gu WHERE name = '송파구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'songpa/june_first_2025'),
('6월 하반기', (SELECT id FROM region_gu WHERE name = '송파구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'songpa/june_second_2025');

-- 용산구 (현수막게시대)
INSERT INTO public.installed_banner (title, region_gu_id, folder_path) VALUES
('4월 전반기', (SELECT id FROM region_gu WHERE name = '용산구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'yongsan/april_first_2025'),
('4월 하반기', (SELECT id FROM region_gu WHERE name = '용산구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'yongsan/april_second_2025'),
('5월 전반기', (SELECT id FROM region_gu WHERE name = '용산구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'yongsan/may_first_2025'),
('5월 하반기', (SELECT id FROM region_gu WHERE name = '용산구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'yongsan/may_second_2025'),
('6월 전반기', (SELECT id FROM region_gu WHERE name = '용산구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'yongsan/june_first_2025'),
('6월 하반기', (SELECT id FROM region_gu WHERE name = '용산구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'yongsan/june_second_2025');

-- 서대문구 (현수막게시대)
INSERT INTO public.installed_banner (title, region_gu_id, folder_path) VALUES
('4월 전반기', (SELECT id FROM region_gu WHERE name = '서대문구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'seodaemun/april_first_2025'),
('4월 하반기', (SELECT id FROM region_gu WHERE name = '서대문구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'seodaemun/april_second_2025'),
('5월 전반기', (SELECT id FROM region_gu WHERE name = '서대문구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'seodaemun/may_first_2025'),
('5월 하반기', (SELECT id FROM region_gu WHERE name = '서대문구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'seodaemun/may_second_2025'),
('6월 전반기', (SELECT id FROM region_gu WHERE name = '서대문구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'seodaemun/june_first_2025'),
('6월 하반기', (SELECT id FROM region_gu WHERE name = '서대문구' AND display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'), 'seodaemun/june_second_2025');

-- 4. 확인용 쿼리
SELECT 
  ib.id,
  ib.title,
  rg.name as region_name,
  ib.folder_path,
  ib.created_at
FROM installed_banner ib
JOIN region_gu rg ON ib.region_gu_id = rg.id
ORDER BY rg.name, ib.title; 