-- 공공디자인 데이터 확인
SELECT 
  id,
  project_category,
  design_contents_type,
  title,
  location,
  image_urls,
  display_order,
  is_active
FROM public.public_design_contents 
WHERE design_contents_type = 'list' 
  AND is_active = true
  AND project_category = 'banner_improvement'
ORDER BY display_order;

-- 2020 사당 관련 데이터만 확인
SELECT 
  id,
  project_category,
  design_contents_type,
  title,
  location,
  image_urls,
  display_order,
  is_active
FROM public.public_design_contents 
WHERE location LIKE '%사당%' 
  OR location LIKE '%sadang%'
  OR title LIKE '%사당%'
  OR title LIKE '%sadang%'
ORDER BY display_order; 