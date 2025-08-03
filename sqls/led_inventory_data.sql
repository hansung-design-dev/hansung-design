-- LED 재고 테이블에 초기 데이터 삽입
-- 모든 LED 패널에 대해 재고 정보를 생성합니다.

INSERT INTO public.led_display_inventory (
  panel_id,
  region_gu_display_period_id,
  total_faces,
  available_faces,
  closed_faces
)
SELECT 
  p.id as panel_id,
  rgdp.id as region_gu_display_period_id,
  20 as total_faces,  -- 기본값: 20개 면
  20 as available_faces,  -- 기본값: 20개 면 사용 가능
  0 as closed_faces  -- 기본값: 0개 면 폐쇄
FROM panels p
JOIN region_gu_display_periods rgdp ON p.region_gu_id = rgdp.region_gu_id
WHERE p.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'  -- LED display type ID
  AND p.panel_status = 'active'
  AND rgdp.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
ON CONFLICT (panel_id, region_gu_display_period_id) DO UPDATE SET
  total_faces = EXCLUDED.total_faces,
  available_faces = EXCLUDED.available_faces,
  closed_faces = EXCLUDED.closed_faces,
  updated_at = now();

-- 재고 상태 업데이트 (실제 사용 중인 슬롯 수에 따라)
UPDATE public.led_display_inventory 
SET 
  available_faces = (
    SELECT COALESCE(20 - COUNT(*), 20)
    FROM led_slots ls
    WHERE ls.panel_id = led_display_inventory.panel_id
      AND ls.panel_slot_status = 'occupied'
  ),
  updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM led_slots ls 
  WHERE ls.panel_id = led_display_inventory.panel_id
);

-- 재고 상태 로그 출력
SELECT 
  p.panel_code,
  rg.name as region_name,
  ldi.total_faces,
  ldi.available_faces,
  ldi.closed_faces,
  (ldi.total_faces - ldi.available_faces - ldi.closed_faces) as used_faces
FROM led_display_inventory ldi
JOIN panels p ON ldi.panel_id = p.id
JOIN region_gu rg ON p.region_gu_id = rg.id
ORDER BY rg.name, p.panel_code; 