-- customer_service 테이블을 frequent_questions로 이름 변경하는 마이그레이션
-- (기존 데이터 보존)

-- 1. 기존 customer_service 테이블을 frequent_questions로 이름 변경
ALTER TABLE customer_service RENAME TO frequent_questions;

-- 2. 컬럼명 변경 (user_id 제거, homepage_menu_type을 display_type_id로 변경)
-- 먼저 기존 외래키 제약조건 제거
ALTER TABLE frequent_questions DROP CONSTRAINT IF EXISTS customer_service_homepage_menu_type_fkey;
ALTER TABLE frequent_questions DROP CONSTRAINT IF EXISTS customer_service_user_id_fkey;

-- user_id 컬럼 제거
ALTER TABLE frequent_questions DROP COLUMN IF EXISTS user_id;

-- homepage_menu_type 컬럼을 display_type_id로 변경
ALTER TABLE frequent_questions RENAME COLUMN homepage_menu_type TO display_type_id;

-- 3. 새로운 외래키 제약조건 추가 (region_gu 테이블 참조)
ALTER TABLE frequent_questions 
ADD CONSTRAINT frequent_questions_display_type_id_fkey 
FOREIGN KEY (display_type_id) REFERENCES region_gu(id);

-- 4. 기존 데이터의 display_type_id를 region_gu의 해당 display_type_id로 매핑
UPDATE frequent_questions 
SET display_type_id = rg.id
FROM homepage_menu_types hmt, region_gu rg
WHERE frequent_questions.display_type_id = hmt.id 
AND rg.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'::uuid
AND hmt.name IN ('digital_signage', 'public_design', 'led_display', 'banner_display');

-- 5. cs_categories 컬럼 제거 (더 이상 필요 없음)
ALTER TABLE frequent_questions DROP COLUMN IF EXISTS cs_categories;

-- 6. status 컬럼의 기본값을 'active'로 변경
ALTER TABLE frequent_questions ALTER COLUMN status SET DEFAULT 'active';

-- 7. 기존 'answered' 상태를 'active'로 변경
UPDATE frequent_questions SET status = 'active' WHERE status = 'answered';

-- 8. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_frequent_questions_display_type_id ON frequent_questions(display_type_id);
CREATE INDEX IF NOT EXISTS idx_frequent_questions_status ON frequent_questions(status);

-- 9. 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_frequent_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. 트리거 생성
DROP TRIGGER IF EXISTS update_customer_service_updated_at ON frequent_questions;
CREATE TRIGGER update_frequent_questions_updated_at
  BEFORE UPDATE ON frequent_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_frequent_questions_updated_at();

-- 11. 테이블 설명 업데이트
COMMENT ON TABLE frequent_questions IS '자주 묻는 질문 (FAQ) 테이블';
COMMENT ON COLUMN frequent_questions.title IS '질문 제목';
COMMENT ON COLUMN frequent_questions.content IS '질문 내용';
COMMENT ON COLUMN frequent_questions.answer IS '답변 내용';
COMMENT ON COLUMN frequent_questions.status IS '상태 (active/inactive)';
COMMENT ON COLUMN frequent_questions.display_type_id IS '연결된 region_gu ID';
