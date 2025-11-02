-- 트리거가 실제로 비활성화되었는지 확인

-- 1. order_details 테이블의 모든 트리거 상태 확인
SELECT 
  tgname as trigger_name,
  tgenabled as is_enabled,
  CASE tgenabled
    WHEN 'O' THEN '활성화'
    WHEN 'D' THEN '비활성화'
    ELSE '알 수 없음'
  END as status
FROM pg_trigger
WHERE tgrelid = 'order_details'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- 2. 모든 트리거 다시 활성화 (테스트 후)
-- ALTER TABLE order_details ENABLE TRIGGER ALL;

