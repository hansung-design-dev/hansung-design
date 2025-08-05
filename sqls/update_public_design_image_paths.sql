-- 공공디자인 이미지 경로 업데이트
-- 2020 사당 관련 경로 수정

-- 현재 데이터 확인
SELECT 
  id,
  title,
  location,
  image_urls
FROM public.public_design_contents 
WHERE location LIKE '%사당%' 
  OR location LIKE '%sadang%'
  OR title LIKE '%사당%'
  OR title LIKE '%sadang%';

-- 2020 사당 경로 업데이트 (필요한 경우)
UPDATE public.public_design_contents 
SET image_urls = ARRAY[
  'banner_improvement/2020%20sadang%20/list/01.jpg',
  'banner_improvement/2020%20sadang%20/list/02.jpg',
  'banner_improvement/2020%20sadang%20/list/03.jpg',
  'banner_improvement/2020%20sadang%20/list/04.jpg',
  'banner_improvement/2020%20sadang%20/list/05.jpg'
]
WHERE location = '사당1동' 
  AND title LIKE '%2020%'
  AND design_contents_type = 'list';

-- 업데이트 후 확인
SELECT 
  id,
  title,
  location,
  image_urls
FROM public.public_design_contents 
WHERE location = '사당1동' 
  AND title LIKE '%2020%'
  AND design_contents_type = 'list'; 