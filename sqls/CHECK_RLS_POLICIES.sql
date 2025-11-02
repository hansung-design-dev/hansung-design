-- RLS (Row Level Security) 정책 확인
-- 혹시 RLS 정책에서 banner_slot_id를 참조하는지 확인

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'order_details';

-- 만약 RLS가 활성화되어 있다면:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'order_details';

-- RLS 비활성화 (임시 테스트용)
-- ALTER TABLE order_details DISABLE ROW LEVEL SECURITY;

