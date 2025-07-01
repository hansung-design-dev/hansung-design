-- 패널별 상반기/하반기 설정 테이블
CREATE TABLE panel_period_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_info_id UUID REFERENCES panel_info(id) ON DELETE CASCADE,
    first_half_start_day INTEGER NOT NULL,  -- 상반기 시작일 (1-31)
    first_half_end_day INTEGER NOT NULL,    -- 상반기 종료일 (1-31)
    second_half_start_day INTEGER NOT NULL, -- 하반기 시작일 (1-31)
    second_half_end_day INTEGER NOT NULL,   -- 하반기 종료일 (1-31)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_panel_period_settings_panel_id ON panel_period_settings(panel_info_id);

-- 기본 설정 데이터 (일반 패널용)
INSERT INTO panel_period_settings (panel_info_id, first_half_start_day, first_half_end_day, second_half_start_day, second_half_end_day)
SELECT 
    id,
    1,   -- 상반기: 1일-15일
    15,
    16,  -- 하반기: 16일-31일
    31
FROM panel_info
WHERE panel_type != 'cultural';  -- 문화게시대가 아닌 경우

-- 문화게시대 설정 (예시)
INSERT INTO panel_period_settings (panel_info_id, first_half_start_day, first_half_end_day, second_half_start_day, second_half_end_day)
SELECT 
    id,
    5,   -- 상반기: 5일-20일
    20,
    21,  -- 하반기: 21일-다음달 4일
    4
FROM panel_info
WHERE panel_type = 'cultural';  -- 문화게시대인 경우 