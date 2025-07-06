export interface District {
  id: number;
  name: string;
  description: string;
  count: number;
  logo: string;
  src: string;
  code: string;
}

export interface DistrictItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tags: string[];
  location: string;
  status: string;
  spots: number | string;
}

// 공통 베이스 타입
export interface BaseBillboard {
  id: string;
  district: string;
  name: string;
  neighborhood: string;
  period: string;
  price: string;
  size: string;
  faces: number;
  lat: number;
  lng: number;
  status: string;
  panel_width?: number;
  panel_height?: number;
  price_unit?: string;
  address?: string;
  nickname?: string | null; // null도 허용하도록 통일
  panel_code?: number;
  panel_type?: string;
  first_half_closure_quantity?: number;
  second_half_closure_quantity?: number;
  total_price?: number; // 실제 가격 (숫자)
  panel_info_id?: string; // panel_info 테이블의 실제 ID
}

// 현수막게시대 전용 타입
export interface BannerBillboard extends BaseBillboard {
  type: 'banner';
  is_for_admin?: boolean;
  banner_type?: string;
  banner_slot_info?: {
    id: string;
    slot_number: number;
    slot_name: string;
    max_width: number;
    max_height: number;
    total_price?: number;
    tax_price?: number;
    advertising_fee?: number;
    road_usage_fee?: number;
    banner_type: string;
    price_unit?: string;
    is_premium: boolean;
    panel_slot_status: string;
  }[];
}

// LED 전자게시대 전용 타입
export interface LEDBillboard extends BaseBillboard {
  type: 'led';
  exposure_count: number;
  max_banners: number;
  slot_width_px: number;
  slot_height_px: number;
  total_price: number;
  tax_price: number;
  advertising_fee: number;
  road_usage_fee: number;
  administrative_fee: number;
  panel_slot_status: string;
}

// 통합 타입 (기존 DisplayBillboard와 동일)
export type DisplayBillboard = BannerBillboard | LEDBillboard;

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  location?: string;
  status: string;
  date?: string;
  category?: string;
  price?: string;
  price_unit?: string;
  is_for_admin?: boolean;
  address?: string;
  nickname?: string;
}

export interface DropdownOption {
  id: number;
  option: string;
}

export interface PanelGuideline {
  id: string;
  display_category_id: string;
  notes: string;
  order_period: string;
  order_method: string;
  account_info: string;
  main_notice: string;
  warning_notice: string;
  show_warning: boolean;
  created_at: string;
  updated_at: string;
  image_url: string[];
  region_gu_id: string;
  guideline_type:
    | 'lower-panel'
    | 'multi-panel'
    | 'bulliten-board'
    | 'led'
    | 'panel'
    | 'top-fixed'
    | 'admin'
    | 'commercial'
    | 'banner';
}
