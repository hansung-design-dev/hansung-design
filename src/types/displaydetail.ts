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
  panel_id?: string; // panels 테이블의 실제 ID
  photo_url?: string; // 사진 URL 추가
  is_closed?: boolean; // 게시대 마감 여부
  inventory_info?: {
    current_period: {
      total_slots: number;
      available_slots: number;
      closed_slots: number;
      period: string;
      year_month: string;
    } | null;
    first_half: {
      total_slots: number;
      available_slots: number;
      closed_slots: number;
    } | null;
    second_half: {
      total_slots: number;
      available_slots: number;
      closed_slots: number;
    } | null;
  };
}

// 현수막게시대 전용 타입
export interface BannerBillboard extends BaseBillboard {
  type: 'banner';
  is_for_admin?: boolean;
  banner_type?: string;
  banner_slots?: {
    id: string;
    panel_id: string;
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
    panel_slot_status: string;
    notes: string;
    created_at: string;
    updated_at: string;
    // banner_slot_price_policy 정보 추가
    banner_slot_price_policy?: {
      id: string;
      price_usage_type: 'default' | 'public_institution' | 'company';
      tax_price: number;
      road_usage_fee: number;
      advertising_fee: number;
      total_price: number;
    }[];
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
  panel_status?: string;
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
    | 'lower_panel'
    | 'multi_panel'
    | 'bulletin_board'
    | 'led'
    | 'panel'
    | 'top_fixed'
    | 'admin'
    | 'commercial'
    | 'banner';
}
