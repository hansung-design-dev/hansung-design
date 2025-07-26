-- 구와 디스플레이 타입 매핑 테이블 생성
CREATE TABLE region_gu_display_types (
  region_gu_id UUID NOT NULL REFERENCES region_gu(id) ON DELETE CASCADE,
  display_type_id UUID NOT NULL REFERENCES display_types(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (region_gu_id, display_type_id)
);

-- 인덱스 추가 (조회 성능 향상)
CREATE INDEX idx_region_gu_display_types_region_gu_id ON region_gu_display_types(region_gu_id);
CREATE INDEX idx_region_gu_display_types_display_type_id ON region_gu_display_types(display_type_id); 