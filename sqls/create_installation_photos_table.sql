-- 게첨사진 테이블 생성
CREATE TABLE installed_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    display_type_id UUID NOT NULL REFERENCES display_types(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    photo_urls TEXT[] NOT NULL, -- 사진 URL 배열로 변경
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_installed_photos_display_type ON installed_photos(display_type_id);
CREATE INDEX idx_installed_photos_created_at ON installed_photos(created_at);

-- RLS 정책 설정 (읽기만 허용)
ALTER TABLE installed_photos ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 설정
CREATE POLICY "Allow public read access to installed_photos" ON installed_photos
    FOR SELECT USING (true);

-- 트리거로 updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_installed_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_installed_photos_updated_at
    BEFORE UPDATE ON installed_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_installed_photos_updated_at(); 