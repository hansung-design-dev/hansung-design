import { v4 as uuidv4 } from 'uuid';

export const regionGuData = [
  {
    id: uuidv4(),
    code: '1100000000',
    name: '종로구',
    logo_image: '/images/district-icon/all.svg',
  },
  // {
  //   id: uuidv4(),
  //   code: '1200000000',
  //   name: '강동구',
  //   logo_image: '/images/district-icon/gangdong-gu.png',
  // },
  {
    id: uuidv4(),
    code: '1300000000',
    name: '관악구',
    logo_image: '/images/district-icon/gwanak-gu.png',
  },
  {
    id: uuidv4(),
    code: '1400000000',
    name: '마포구',
    logo_image: '/images/district-icon/mapo-gu.png',
  },
  {
    id: uuidv4(),
    code: '1500000000',
    name: '서대문구',
    logo_image: '/images/district-icon/seodaemun-gu.png',
  },
  {
    id: uuidv4(),
    code: '1600000000',
    name: '송파구',
    logo_image: '/images/district-icon/songpa-gu.png',
  },
  {
    id: uuidv4(),
    code: '1700000000',
    name: '용산구',
    logo_image: '/images/district-icon/yongsan-gu.png',
  },
  {
    id: uuidv4(),
    code: '1800000000',
    name: '강북구',
    logo_image: '/images/district-icon/gangbuk-gu.png',
  },
];

// Region Dong (동) Data
export const regionDongData = [
  {
    id: uuidv4(),
    district_code: '1100000000',
    name: '청운동',
  },
  {
    id: uuidv4(),
    district_code: '1100000000',
    name: '사직동',
  },
  {
    id: uuidv4(),
    district_code: '1200000000',
    name: '신당동',
  },
  {
    id: uuidv4(),
    district_code: '1300000000',
    name: '이태원동',
  },
];

// Display Types
export const displayTypes = [
  {
    id: uuidv4(),
    name: 'led_display',
    description: 'LED 전자게시대',
  },
  {
    id: uuidv4(),
    name: 'banner_display',
    description: '현수막 게시대',
  },
];

// Panel Info (게시대 기본 정보)
export const panelInfoData = [
  // LED 게시대
  {
    id: uuidv4(),
    display_type_id: displayTypes[0].id,
    post_code: '03045',
    region_gu_id: regionGuData[0].id,
    region_dong_id: regionDongData[0].id,
    address: '서울 종로구 청운동 123-45',
    photo_url: '/images/panels/led1.jpg',
    location_url: 'https://map.naver.com/...',
    map_url: 'https://map.naver.com/...',
    latitude: 37.5892,
    longitude: 126.9707,
    panel_status: 'active',
  },
  {
    id: uuidv4(),
    display_type_id: displayTypes[0].id,
    post_code: '04521',
    region_gu_id: regionGuData[1].id,
    region_dong_id: regionDongData[2].id,
    address: '서울 중구 신당동 456-78',
    photo_url: '/images/panels/led2.jpg',
    location_url: 'https://map.naver.com/...',
    map_url: 'https://map.naver.com/...',
    latitude: 37.5577,
    longitude: 127.0104,
    panel_status: 'active',
  },
  // 현수막 게시대
  {
    id: uuidv4(),
    display_type_id: displayTypes[1].id,
    post_code: '03046',
    region_gu_id: regionGuData[0].id,
    region_dong_id: regionDongData[1].id,
    address: '서울 종로구 사직동 789-10',
    photo_url: '/images/panels/banner1.jpg',
    location_url: 'https://map.naver.com/...',
    map_url: 'https://map.naver.com/...',
    latitude: 37.5757,
    longitude: 126.9714,
    panel_status: 'active',
  },
  {
    id: uuidv4(),
    display_type_id: displayTypes[1].id,
    post_code: '04340',
    region_gu_id: regionGuData[2].id,
    region_dong_id: regionDongData[3].id,
    address: '서울 용산구 이태원동 111-22',
    photo_url: '/images/panels/banner2.jpg',
    location_url: 'https://map.naver.com/...',
    map_url: 'https://map.naver.com/...',
    latitude: 37.5347,
    longitude: 126.9947,
    panel_status: 'active',
  },
];

// LED Panel Details
export const ledPanelDetails = [
  {
    id: uuidv4(),
    panel_id: panelInfoData[0].id,
    exposure_count: 50000,
    panel_width: 1920,
    panel_height: 1080,
  },
  {
    id: uuidv4(),
    panel_id: panelInfoData[1].id,
    exposure_count: 45000,
    panel_width: 1600,
    panel_height: 900,
  },
];

// Banner Panel Details
export const bannerPanelDetails = [
  {
    id: uuidv4(),
    panel_id: panelInfoData[2].id,
    max_banners: 3,
    panel_height: 3.5,
    panel_width: 2.5,
    is_for_admin: false,
  },
  {
    id: uuidv4(),
    panel_id: panelInfoData[3].id,
    max_banners: 4,
    panel_height: 4.0,
    panel_width: 3.0,
    is_for_admin: false,
  },
];

// LED Slot Info
export const ledSlotInfo = [
  {
    id: uuidv4(),
    panel_id: panelInfoData[0].id,
    slot_name: '메인 화면',
    slot_width_px: 1920,
    slot_height_px: 1080,
    position_x: 0,
    position_y: 0,
    base_price: 500000,
    tax_price: 50000,
    price_unit: 'daily',
    panel_slot_status: 'available',
  },
  {
    id: uuidv4(),
    panel_id: panelInfoData[1].id,
    slot_name: '메인 화면',
    slot_width_px: 1600,
    slot_height_px: 900,
    position_x: 0,
    position_y: 0,
    base_price: 400000,
    tax_price: 40000,
    price_unit: 'daily',
    panel_slot_status: 'available',
  },
];

// Banner Slot Info
export const bannerSlotInfo = [
  {
    id: uuidv4(),
    panel_id: panelInfoData[2].id,
    slot_number: 1,
    slot_name: '1번 면',
    max_width: 2.0,
    max_height: 3.0,
    base_price: 100000,
    tax_price: 10000,
    banner_type: 'horizontal',
    price_unit: 'daily',
    panel_slot_status: 'available',
  },
  {
    id: uuidv4(),
    panel_id: panelInfoData[2].id,
    slot_number: 2,
    slot_name: '2번 면',
    max_width: 2.0,
    max_height: 3.0,
    base_price: 100000,
    tax_price: 10000,
    banner_type: 'horizontal',
    price_unit: 'daily',
    panel_slot_status: 'available',
  },
  {
    id: uuidv4(),
    panel_id: panelInfoData[2].id,
    slot_number: 3,
    slot_name: '3번 면',
    max_width: 2.0,
    max_height: 3.0,
    base_price: 100000,
    tax_price: 10000,
    banner_type: 'horizontal',
    price_unit: 'daily',
    panel_slot_status: 'available',
  },
  {
    id: uuidv4(),
    panel_id: panelInfoData[3].id,
    slot_number: 1,
    slot_name: '1번 면',
    max_width: 2.5,
    max_height: 3.5,
    base_price: 120000,
    tax_price: 12000,
    banner_type: 'horizontal',
    price_unit: 'daily',
    panel_slot_status: 'available',
  },
  {
    id: uuidv4(),
    panel_id: panelInfoData[3].id,
    slot_number: 2,
    slot_name: '2번 면',
    max_width: 2.5,
    max_height: 3.5,
    base_price: 120000,
    tax_price: 12000,
    banner_type: 'horizontal',
    price_unit: 'daily',
    panel_slot_status: 'available',
  },
  {
    id: uuidv4(),
    panel_id: panelInfoData[3].id,
    slot_number: 3,
    slot_name: '3번 면',
    max_width: 2.5,
    max_height: 3.5,
    base_price: 120000,
    tax_price: 12000,
    banner_type: 'horizontal',
    price_unit: 'daily',
    panel_slot_status: 'available',
  },
  {
    id: uuidv4(),
    panel_id: panelInfoData[3].id,
    slot_number: 4,
    slot_name: '4번 면',
    max_width: 2.5,
    max_height: 3.5,
    base_price: 120000,
    tax_price: 12000,
    banner_type: 'horizontal',
    price_unit: 'daily',
    panel_slot_status: 'available',
  },
];

// Panel Slot Usage
export const panelSlotUsage = [
  {
    id: uuidv4(),
    display_type_id: displayTypes[0].id,
    panel_id: panelInfoData[0].id,
    slot_number: 1,
    usage_type: 'led_display',
    attach_date_from: new Date('2024-03-01'),
    unit_price: 500000,
    tax_price: 50000,
    total_price: 550000,
    is_active: true,
    is_closed: false,
    banner_type: 'horizontal',
  },
  {
    id: uuidv4(),
    display_type_id: displayTypes[1].id,
    panel_id: panelInfoData[2].id,
    slot_number: 1,
    usage_type: 'banner_display',
    attach_date_from: new Date('2024-03-01'),
    unit_price: 100000,
    tax_price: 10000,
    total_price: 110000,
    is_active: true,
    is_closed: false,
    banner_type: 'horizontal',
  },
];

// Export combined data for frontend use
export const ledItems = panelInfoData
  .filter((panel) => panel.display_type_id === displayTypes[0].id)
  .map((panel) => {
    const ledDetail = ledPanelDetails.find(
      (detail) => detail.panel_id === panel.id
    );
    const slotInfo = ledSlotInfo.find(
      (slot) => slot.panel_id === panel.id
    );
    const dong = regionDongData.find(
      (dong) => dong.id === panel.region_dong_id
    );
    const gu = regionGuData.find((gu) => gu.id === panel.region_gu_id);

    return {
      id: panel.id,
      title: `${gu?.name} ${dong?.name} LED 전자게시대`,
      location: `${gu?.name} ${dong?.name}`,
      region_gu: gu?.name || '',
      region_dong: dong?.name || '',
      image: panel.photo_url,
      type: 'led-display',
      price: slotInfo?.base_price || 0,
      width: ledDetail?.panel_width || 0,
      height: ledDetail?.panel_height || 0,
      exposureCount: ledDetail?.exposure_count || 0,
      slots: 1, // LED는 보통 1개의 슬롯
    };
  });

export const bannerItems = panelInfoData
  .filter((panel) => panel.display_type_id === displayTypes[1].id)
  .map((panel) => {
    const bannerDetail = bannerPanelDetails.find(
      (detail) => detail.panel_id === panel.id
    );
    const slots = bannerSlotInfo.filter(
      (slot) => slot.panel_id === panel.id
    );
    const dong = regionDongData.find(
      (dong) => dong.id === panel.region_dong_id
    );
    const gu = regionGuData.find((gu) => gu.id === panel.region_gu_id);

    return {
      id: panel.id,
      title: `${gu?.name} ${dong?.name} 현수막 게시대`,
      location: `${gu?.name} ${dong?.name}`,
      region_gu: gu?.name || '',
      region_dong: dong?.name || '',
      image: panel.photo_url,
      type: 'banner-display',
      price: slots[0]?.base_price || 0,
      maxBanners: bannerDetail?.max_banners || 0,
      slots: slots.length,
      width: bannerDetail?.panel_width || 0,
      height: bannerDetail?.panel_height || 0,
    };
  });
