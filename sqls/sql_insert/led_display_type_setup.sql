-- LED 디스플레이 타입 추가
INSERT INTO display_types (name, description) 
VALUES ('led_display', 'LED 전자게시대')
ON CONFLICT (name) DO NOTHING;

-- 확인
SELECT * FROM display_types WHERE name = 'led_display'; 