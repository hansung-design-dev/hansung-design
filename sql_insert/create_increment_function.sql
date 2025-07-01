-- 패널 수량 증가 함수 생성
CREATE OR REPLACE FUNCTION increment(
  row_id UUID,
  column_name TEXT,
  increment_value INTEGER
) RETURNS INTEGER AS $$
BEGIN
  RETURN increment_value;
END;
$$ LANGUAGE plpgsql; 