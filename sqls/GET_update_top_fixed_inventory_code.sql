-- update_top_fixed_inventory_on_order 함수의 전체 코드 확인
SELECT 
  proname,
  prosrc as full_code
FROM pg_proc
WHERE proname = 'update_top_fixed_inventory_on_order';

