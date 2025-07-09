-- 송파구 panel_info_id = 0c0cef8c-b39c-4f19-bbc8-c9723e0fc4ce에 대한 banner_slot_info 생성
-- 총 8개 로우: slot_number 0 (top-fixed 3개) + slot_number 1-5 (panel 5개)

-- slot_number 0 - top-fixed (6 months)
INSERT INTO banner_slot_info (
    panel_info_id, slot_number, slot_name, max_width, max_height, 
    total_price, tax_price, banner_type, price_unit, is_premium, 
    panel_slot_status, notes, created_at, updated_at, road_usage_fee, advertising_fee
) VALUES (
    '0c0cef8c-b39c-4f19-bbc8-c9723e0fc4ce', 0, '6 months', 500.00, 100.00,
    5000000.00, 0, 'top-fixed', '6 months', FALSE,
    'available', NULL, NOW(), NOW(), 0.00, 0.00
);

-- slot_number 0 - top-fixed (3 years)
INSERT INTO banner_slot_info (
    panel_info_id, slot_number, slot_name, max_width, max_height, 
    total_price, tax_price, banner_type, price_unit, is_premium, 
    panel_slot_status, notes, created_at, updated_at, road_usage_fee, advertising_fee
) VALUES (
    '0c0cef8c-b39c-4f19-bbc8-c9723e0fc4ce', 0, '3 years', 500.00, 100.00,
    5000000.00, 0, 'top-fixed', '3 years', FALSE,
    'available', NULL, NOW(), NOW(), 0.00, 0.00
);

-- slot_number 0 - top-fixed (1 year)
INSERT INTO banner_slot_info (
    panel_info_id, slot_number, slot_name, max_width, max_height, 
    total_price, tax_price, banner_type, price_unit, is_premium, 
    panel_slot_status, notes, created_at, updated_at, road_usage_fee, advertising_fee
) VALUES (
    '0c0cef8c-b39c-4f19-bbc8-c9723e0fc4ce', 0, '1 year', 500.00, 100.00,
    5000000.00, 0, 'top-fixed', '1 year', FALSE,
    'available', NULL, NOW(), NOW(), 0.00, 0.00
);

-- slot_number 1 - panel
INSERT INTO banner_slot_info (
    panel_info_id, slot_number, slot_name, max_width, max_height, 
    total_price, tax_price, banner_type, price_unit, is_premium, 
    panel_slot_status, notes, created_at, updated_at, road_usage_fee, advertising_fee
) VALUES (
    '0c0cef8c-b39c-4f19-bbc8-c9723e0fc4ce', 1, NULL, 500.00, 70.00,
    139800.00, 10000, 'panel', '15 days', FALSE,
    'available', NULL, NOW(), NOW(), 20570.00, 109230.00
);

-- slot_number 2 - panel
INSERT INTO banner_slot_info (
    panel_info_id, slot_number, slot_name, max_width, max_height, 
    total_price, tax_price, banner_type, price_unit, is_premium, 
    panel_slot_status, notes, created_at, updated_at, road_usage_fee, advertising_fee
) VALUES (
    '0c0cef8c-b39c-4f19-bbc8-c9723e0fc4ce', 2, NULL, 500.00, 70.00,
    139800.00, 10000, 'panel', '15 days', FALSE,
    'available', NULL, NOW(), NOW(), 20570.00, 109230.00
);

-- slot_number 3 - panel
INSERT INTO banner_slot_info (
    panel_info_id, slot_number, slot_name, max_width, max_height, 
    total_price, tax_price, banner_type, price_unit, is_premium, 
    panel_slot_status, notes, created_at, updated_at, road_usage_fee, advertising_fee
) VALUES (
    '0c0cef8c-b39c-4f19-bbc8-c9723e0fc4ce', 3, NULL, 500.00, 70.00,
    139800.00, 10000, 'panel', '15 days', FALSE,
    'available', NULL, NOW(), NOW(), 20570.00, 109230.00
);

-- slot_number 4 - panel
INSERT INTO banner_slot_info (
    panel_info_id, slot_number, slot_name, max_width, max_height, 
    total_price, tax_price, banner_type, price_unit, is_premium, 
    panel_slot_status, notes, created_at, updated_at, road_usage_fee, advertising_fee
) VALUES (
    '0c0cef8c-b39c-4f19-bbc8-c9723e0fc4ce', 4, NULL, 500.00, 70.00,
    139800.00, 10000, 'panel', '15 days', FALSE,
    'available', NULL, NOW(), NOW(), 20570.00, 109230.00
);

-- slot_number 5 - panel
INSERT INTO banner_slot_info (
    panel_info_id, slot_number, slot_name, max_width, max_height, 
    total_price, tax_price, banner_type, price_unit, is_premium, 
    panel_slot_status, notes, created_at, updated_at, road_usage_fee, advertising_fee
) VALUES (
    '0c0cef8c-b39c-4f19-bbc8-c9723e0fc4ce', 5, NULL, 500.00, 70.00,
    139800.00, 10000, 'panel', '15 days', FALSE,
    'available', NULL, NOW(), NOW(), 20570.00, 109230.00
);

-- 생성 확인
SELECT 
    panel_info_id,
    slot_number,
    slot_name,
    banner_type,
    price_unit,
    total_price,
    COUNT(*) as count
FROM banner_slot_info
WHERE panel_info_id = '0c0cef8c-b39c-4f19-bbc8-c9723e0fc4ce'
GROUP BY panel_info_id, slot_number, slot_name, banner_type, price_unit, total_price
ORDER BY slot_number, price_unit; 