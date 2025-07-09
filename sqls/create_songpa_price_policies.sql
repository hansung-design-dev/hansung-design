-- 송파구 banner_slot_info에 대한 가격 정책 추가
-- 각 slot에 대해 default와 public-institution 두 가지 가격 정책 생성

-- slot_number 1 (id: 6696af69-1393-4eb7-98ff-bd6c34aac6cd)
INSERT INTO banner_slot_price_policy (id, banner_slot_info_id, price_usage_type, tax_price, road_usage_fee, advertising_fee, total_price, created_at, updated_at)
VALUES 
    (gen_random_uuid(), '6696af69-1393-4eb7-98ff-bd6c34aac6cd', 'default', 10000, 20570, 109230, 139800, NOW(), NOW()),
    (gen_random_uuid(), '6696af69-1393-4eb7-98ff-bd6c34aac6cd', 'public-institution', 0, 0, 139800, 139800, NOW(), NOW());

-- slot_number 2 (id: 76340b99-40ba-4f9c-8dfa-d3502f90c3da)
INSERT INTO banner_slot_price_policy (id, banner_slot_info_id, price_usage_type, tax_price, road_usage_fee, advertising_fee, total_price, created_at, updated_at)
VALUES 
    (gen_random_uuid(), '76340b99-40ba-4f9c-8dfa-d3502f90c3da', 'default', 10000, 20570, 109230, 139800, NOW(), NOW()),
    (gen_random_uuid(), '76340b99-40ba-4f9c-8dfa-d3502f90c3da', 'public-institution', 0, 0, 139800, 139800, NOW(), NOW());

-- slot_number 3 (id: d3a729b4-f470-440e-b412-3473be759b19)
INSERT INTO banner_slot_price_policy (id, banner_slot_info_id, price_usage_type, tax_price, road_usage_fee, advertising_fee, total_price, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'd3a729b4-f470-440e-b412-3473be759b19', 'default', 10000, 20570, 109230, 139800, NOW(), NOW()),
    (gen_random_uuid(), 'd3a729b4-f470-440e-b412-3473be759b19', 'public-institution', 0, 0, 139800, 139800, NOW(), NOW());

-- slot_number 4 (id: ed182556-429a-43d0-ab45-910fcc7d921e)
INSERT INTO banner_slot_price_policy (id, banner_slot_info_id, price_usage_type, tax_price, road_usage_fee, advertising_fee, total_price, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'ed182556-429a-43d0-ab45-910fcc7d921e', 'default', 10000, 20570, 109230, 139800, NOW(), NOW()),
    (gen_random_uuid(), 'ed182556-429a-43d0-ab45-910fcc7d921e', 'public-institution', 0, 0, 139800, 139800, NOW(), NOW());

-- slot_number 5 (id: 69c99040-40c7-4392-b862-d0d17fc34b26)
INSERT INTO banner_slot_price_policy (id, banner_slot_info_id, price_usage_type, tax_price, road_usage_fee, advertising_fee, total_price, created_at, updated_at)
VALUES 
    (gen_random_uuid(), '69c99040-40c7-4392-b862-d0d17fc34b26', 'default', 10000, 20570, 109230, 139800, NOW(), NOW()),
    (gen_random_uuid(), '69c99040-40c7-4392-b862-d0d17fc34b26', 'public-institution', 0, 0, 139800, 139800, NOW(), NOW());

-- 생성 확인
SELECT 
    bsi.slot_number,
    bspp.price_usage_type,
    bspp.total_price,
    bspp.tax_price,
    bspp.road_usage_fee,
    bspp.advertising_fee
FROM banner_slot_price_policy bspp
JOIN banner_slot_info bsi ON bspp.banner_slot_info_id = bsi.id
WHERE bsi.panel_info_id = '0c0cef8c-b39c-4f19-bbc8-c9723e0fc4ce'
ORDER BY bsi.slot_number, bspp.price_usage_type; 