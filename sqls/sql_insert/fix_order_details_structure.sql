-- order_details 테이블에 panel_info_id 컬럼 추가
ALTER TABLE order_details 
ADD COLUMN panel_info_id UUID REFERENCES panel_info(id);

-- 기존 데이터 업데이트: orders 테이블의 panel_info_id를 order_details에 복사
UPDATE order_details 
SET panel_info_id = orders.panel_info_id
FROM orders 
WHERE order_details.order_id = orders.id;

-- order_details 테이블의 panel_info_id를 NOT NULL로 설정
ALTER TABLE order_details 
ALTER COLUMN panel_info_id SET NOT NULL;

-- 인덱스 추가 (성능 향상)
CREATE INDEX idx_order_details_panel_info_id ON order_details(panel_info_id);

-- 주문 상세 조회를 위한 뷰 생성 (선택사항)
CREATE OR REPLACE VIEW order_details_with_panel AS
SELECT 
    od.id,
    od.order_id,
    od.panel_info_id,
    od.slot_order_quantity,
    od.display_start_date,
    od.display_end_date,
    od.created_at,
    od.updated_at,
    pi.nickname as panel_nickname,
    pi.address as panel_address,
    pi.panel_status,
    pi.panel_type,
    rg.name as region_name
FROM order_details od
JOIN panel_info pi ON od.panel_info_id = pi.id
LEFT JOIN region_gu rg ON pi.region_gu_id = rg.id; 